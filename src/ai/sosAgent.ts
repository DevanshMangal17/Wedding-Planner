import type { Vendor, VendorAvailability } from "@prisma/client";
import { scoreVendor, meetsHardConstraints, type MatchCriteria } from "@/ai/vendorMatcher";

export interface SOSOptionResult {
  vendor: Vendor;
  label: "Premium" | "Best value" | "Closest match";
  price: number;
  reason: string;
  score: number;
  locationLabel: string;
}

/**
 * Deterministic candidate search + labelling. The model (when configured)
 * only narrates this result — it never picks the vendors, since a
 * mis-picked replacement the night before a wedding is exactly the kind of
 * consequential mistake §23's "AI recommends → customer approves" boundary
 * exists to prevent.
 */
export function findSOSAlternatives(
  candidates: Vendor[],
  availabilityByVendor: Map<string, VendorAvailability[]>,
  criteria: MatchCriteria,
  count = 3,
): SOSOptionResult[] {
  const scored = candidates
    // A vendor that can't actually take the guest count is not an option,
    // urgent or not — filtered out before scoring, not just ranked lower.
    .filter((vendor) => meetsHardConstraints(vendor, criteria))
    .map((vendor) => ({
      vendor,
      ...scoreVendor(vendor, availabilityByVendor.get(vendor.id) ?? [], criteria),
    }))
    .filter((s) => s.breakdown.availability === 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(count, 4));

  if (scored.length === 0) return [];

  const byPrice = [...scored].sort((a, b) => (b.vendor.priceMax - a.vendor.priceMax));
  const premium = byPrice[0];
  const bestValue = [...scored].sort((a, b) => a.vendor.priceMin - b.vendor.priceMin)[0];
  const remaining = scored.filter(
    (s) => s.vendor.id !== premium.vendor.id && s.vendor.id !== bestValue.vendor.id,
  );
  const closest = remaining[0] ?? scored[0];

  const picks: { entry: typeof premium; label: SOSOptionResult["label"] }[] = [
    { entry: premium, label: "Premium" },
    { entry: bestValue, label: "Best value" },
    { entry: closest, label: "Closest match" },
  ];

  const seen = new Set<string>();
  const results: SOSOptionResult[] = [];
  for (const { entry, label } of picks) {
    if (seen.has(entry.vendor.id)) continue;
    seen.add(entry.vendor.id);
    results.push({
      vendor: entry.vendor,
      label,
      price: Math.round((entry.vendor.priceMin + entry.vendor.priceMax) / 2),
      score: entry.score,
      locationLabel: entry.locationLabel,
      reason: reasonForLabel(label, entry.vendor, entry.score, entry.locationLabel, entry.distanceKm),
    });
  }
  return results.slice(0, count);
}

function reasonForLabel(
  label: SOSOptionResult["label"],
  vendor: Vendor,
  score: number,
  locationLabel: string,
  distanceKm: number | null,
): string {
  // Distance matters more than usual here — this is an urgent, last-minute
  // swap, so whether a replacement is actually nearby (or can travel at all)
  // belongs in the headline reason, not buried in a details page.
  const locationNote = vendor.isPanIndia
    ? "travels nationwide"
    : distanceKm === 0
      ? "based in your wedding city"
      : distanceKm !== null
        ? `${distanceKm} km away`
        : locationLabel.toLowerCase();

  switch (label) {
    case "Premium":
      return `Highest-rated option available (${vendor.rating.toFixed(1)}★, ${locationNote}), at a premium price point.`;
    case "Best value":
      return `Most affordable option that still meets your date (${locationNote}).`;
    case "Closest match":
      return `Closest overall match to your original requirements (${score}% match score, ${locationNote}).`;
  }
}

export function sosSummary(optionsCount: number, timeframe: string): string {
  if (optionsCount === 0) {
    return `We couldn't find an available replacement for ${timeframe} yet — widening the search radius and rechecking availability.`;
  }
  return `We found ${optionsCount} potential replacement${optionsCount > 1 ? "s" : ""} available ${timeframe}.`;
}
