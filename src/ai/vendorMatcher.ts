import type { Vendor, VendorAvailability } from "@prisma/client";
import { getAIProvider } from "@/ai/provider";
import { distanceBetweenCitiesKm } from "@/lib/indianCities";

export interface MatchBreakdown {
  budgetFit: number;
  styleFit: number;
  availability: number;
  location: number;
  reliability: number;
  rating: number;
}

export interface VendorMatchResult {
  score: number;
  breakdown: MatchBreakdown;
  reason: string;
  /** false when the vendor's stated capacity can't actually hold the guest count — a hard constraint, not a soft preference (§11). */
  meetsCapacity: boolean;
  /** Distance from the wedding city in km — 0 for a same-city vendor, null when either city isn't in our lookup table (genuinely unknown, not necessarily far) or the vendor is pan-India. */
  distanceKm: number | null;
  /** Short, ready-to-render label: "Based in Mumbai", "62 km away", "Travels pan-India", or "Distance unknown". */
  locationLabel: string;
}

export interface MatchCriteria {
  city: string;
  weddingDate: Date;
  budgetForCategory?: number; // allocated budget for this vendor's category
  preferredStyles?: string[];
  requiredCapacity?: number;
}

const WEIGHTS: Record<keyof MatchBreakdown, number> = {
  budgetFit: 0.25,
  styleFit: 0.2,
  availability: 0.2,
  location: 0.15,
  reliability: 0.1,
  rating: 0.1,
};

function scoreBudgetFit(vendor: Vendor, budget?: number): number {
  if (!budget) return 75; // no preference stated — neutral score
  const mid = (vendor.priceMin + vendor.priceMax) / 2;
  if (budget >= vendor.priceMin && budget <= vendor.priceMax) return 100;
  const distance = Math.abs(mid - budget) / Math.max(mid, budget);
  return Math.max(0, Math.round(100 - distance * 100));
}

function scoreStyleFit(vendor: Vendor, styleTags: string[], preferred?: string[]): number {
  if (!preferred || preferred.length === 0) return 80;
  const vendorTags = styleTags.map((t) => t.toLowerCase());
  const wanted = preferred.map((t) => t.toLowerCase());
  const matches = wanted.filter((t) => vendorTags.includes(t)).length;
  return Math.round((matches / wanted.length) * 100);
}

function scoreAvailability(availability: VendorAvailability[], weddingDate: Date): number {
  const sameDay = availability.find(
    (a) => a.date.toDateString() === weddingDate.toDateString(),
  );
  if (!sameDay) return 100; // no record means nothing is booking it out
  return sameDay.isAvailable ? 100 : 0;
}

interface LocationResult {
  score: number;
  distanceKm: number | null;
  label: string;
}

/**
 * Distance-aware, not just same-city-or-not. A vendor 40km away should
 * clearly outrank one 600km away even though neither is a literal city
 * match — the old flat "55 if not exact match" couldn't tell them apart,
 * which is exactly what fell over for a Goa wedding matched only against
 * Mumbai/Jaipur vendors.
 */
function scoreLocation(vendor: Vendor, city: string): LocationResult {
  if (vendor.isPanIndia) {
    return { score: 78, distanceKm: null, label: "Travels pan-India" };
  }
  if (vendor.city.toLowerCase() === city.toLowerCase()) {
    return { score: 100, distanceKm: 0, label: `Based in ${vendor.city}` };
  }

  const distanceKm = distanceBetweenCitiesKm(vendor.city, city);
  if (distanceKm === null) {
    return { score: 55, distanceKm: null, label: "Distance unknown" };
  }
  const score =
    distanceKm <= 50 ? 92 :
    distanceKm <= 150 ? 82 :
    distanceKm <= 300 ? 68 :
    distanceKm <= 600 ? 52 :
    distanceKm <= 1000 ? 38 : 22;
  return { score, distanceKm, label: `${distanceKm} km away` };
}

function scoreCapacity(vendor: Vendor, requiredCapacity?: number): boolean {
  if (!requiredCapacity) return true;
  if (vendor.capacityMin == null && vendor.capacityMax == null) return true;
  const min = vendor.capacityMin ?? 0;
  const max = vendor.capacityMax ?? Infinity;
  return requiredCapacity >= min && requiredCapacity <= max;
}

export function meetsHardConstraints(vendor: Vendor, criteria: MatchCriteria): boolean {
  return scoreCapacity(vendor, criteria.requiredCapacity);
}

export function scoreVendor(
  vendor: Vendor,
  availability: VendorAvailability[],
  criteria: MatchCriteria,
): VendorMatchResult {
  const styleTags: string[] = JSON.parse(vendor.styleTags);
  const location = scoreLocation(vendor, criteria.city);

  const breakdown: MatchBreakdown = {
    budgetFit: scoreBudgetFit(vendor, criteria.budgetForCategory),
    styleFit: scoreStyleFit(vendor, styleTags, criteria.preferredStyles),
    availability: scoreAvailability(availability, criteria.weddingDate),
    location: location.score,
    reliability: vendor.reliabilityScore,
    rating: Math.round((vendor.rating / 5) * 100),
  };

  const rawScore = Object.entries(breakdown).reduce(
    (sum, [key, value]) => sum + value * WEIGHTS[key as keyof MatchBreakdown],
    0,
  );

  // A vendor that mathematically can't seat/serve the guest count isn't a
  // "lower match" — it's not usable, so this weighs it down hard rather
  // than blending it in as one soft signal among six.
  const meetsCapacity = meetsHardConstraints(vendor, criteria);
  const score = Math.round(meetsCapacity ? rawScore : rawScore * 0.3);

  return {
    score,
    breakdown,
    meetsCapacity,
    distanceKm: location.distanceKm,
    locationLabel: location.label,
    reason: buildReasonTemplate(vendor, breakdown, criteria, meetsCapacity, location),
  };
}

function buildReasonTemplate(
  vendor: Vendor,
  b: MatchBreakdown,
  criteria: MatchCriteria,
  meetsCapacity: boolean,
  location: LocationResult,
): string {
  if (!meetsCapacity && criteria.requiredCapacity) {
    return `Capacity mismatch: this vendor typically handles up to ${vendor.capacityMax ?? "a smaller"} guests, below your ${criteria.requiredCapacity} guest count.`;
  }

  const clauses: string[] = [];
  if (b.budgetFit >= 85 && criteria.budgetForCategory) {
    clauses.push(`fits your ₹${criteria.budgetForCategory.toLocaleString("en-IN")} budget`);
  }
  if (b.availability === 100) clauses.push("is available on your wedding date");
  if (b.styleFit >= 80) clauses.push("matches your preferred style");
  if (b.rating >= 85) clauses.push(`has strong reviews (${vendor.rating.toFixed(1)}★, ${vendor.reviewCount} reviews)`);
  if (vendor.isPanIndia) clauses.push("travels nationwide, so it can cover your venue directly");
  else if (location.distanceKm === 0) clauses.push(`is based in ${vendor.city}`);
  else if (location.distanceKm !== null && location.distanceKm <= 150) {
    clauses.push(`is only ${location.distanceKm} km from ${criteria.city}`);
  }
  if (clauses.length === 0 && location.distanceKm !== null && location.distanceKm > 150) {
    clauses.push(`is the closest match we have, ${location.distanceKm} km from ${criteria.city} — worth confirming they travel`);
  }
  if (clauses.length === 0) clauses.push("is a reasonable fit for your requirements");

  const joined = clauses.slice(0, 3).join(", ");
  return `Recommended because it ${joined}.`;
}

/**
 * Rephrases an already-computed, deterministic reason into warmer copy.
 * The facts (score, breakdown, which clauses qualified) never come from the
 * model — only the phrasing does, and only when a live provider is
 * configured. Without one, the template reason above is used verbatim.
 */
export async function explainMatch(vendor: Vendor, result: VendorMatchResult): Promise<string> {
  const provider = getAIProvider();
  if (!provider.isLive) return result.reason;

  const system =
    "You rewrite a single factual sentence explaining a wedding vendor recommendation. Keep it under 30 words, warm but concise, and do not invent any facts not present in the input.";
  const prompt = `Vendor: ${vendor.name} (${vendor.category}). Match score: ${result.score}%. Draft reason: "${result.reason}"`;
  try {
    return await provider.generateText(system, prompt);
  } catch {
    return result.reason;
  }
}
