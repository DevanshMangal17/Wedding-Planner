import type { Vendor, Wedding, VendorCategory } from "@prisma/client";
import { db } from "@/lib/db";
import { scoreVendor, type MatchCriteria, type VendorMatchResult } from "@/ai/vendorMatcher";
import { suggestBudgetAllocation } from "@/ai/weddingPlanner";

const CATEGORY_STYLE_FIELD: Partial<Record<VendorCategory, keyof Wedding>> = {
  PHOTOGRAPHER: "photographyStyle",
  VIDEOGRAPHER: "photographyStyle",
  DECORATOR: "decorStyle",
  FLORIST: "decorStyle",
  MAKEUP: "makeupPrefs",
  ENTERTAINMENT: "entertainmentPrefs",
};

function tokenize(text?: string | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z-]+/)
    .filter((t) => t.length > 2);
}

export function buildMatchCriteria(wedding: Wedding, category: VendorCategory): MatchCriteria {
  const allocation = suggestBudgetAllocation(wedding.budgetTotal);
  const field = CATEGORY_STYLE_FIELD[category];
  const styleSource = [wedding.style, field ? (wedding[field] as string | null) : null];
  const preferredStyles = Array.from(new Set(styleSource.flatMap((s) => tokenize(s))));

  return {
    city: wedding.city,
    weddingDate: wedding.weddingDate,
    budgetForCategory: allocation[category],
    preferredStyles,
    requiredCapacity: category === "VENUE" || category === "CATERER" ? wedding.guestCount : undefined,
  };
}

export interface ScoredVendor {
  vendor: Vendor;
  match: VendorMatchResult;
}

export async function getVendorsForCategory(wedding: Wedding, category: VendorCategory): Promise<ScoredVendor[]> {
  const vendors = await db.vendor.findMany({ where: { category } });
  const availability = await db.vendorAvailability.findMany({ where: { vendorId: { in: vendors.map((v) => v.id) } } });
  const availabilityByVendor = new Map<string, typeof availability>();
  for (const a of availability) {
    availabilityByVendor.set(a.vendorId, [...(availabilityByVendor.get(a.vendorId) ?? []), a]);
  }
  const criteria = buildMatchCriteria(wedding, category);

  return vendors
    .map((vendor) => ({ vendor, match: scoreVendor(vendor, availabilityByVendor.get(vendor.id) ?? [], criteria) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export async function getAllVendorsScored(wedding: Wedding): Promise<ScoredVendor[]> {
  const vendors = await db.vendor.findMany();
  const availability = await db.vendorAvailability.findMany();
  const availabilityByVendor = new Map<string, typeof availability>();
  for (const a of availability) {
    availabilityByVendor.set(a.vendorId, [...(availabilityByVendor.get(a.vendorId) ?? []), a]);
  }

  return vendors
    .map((vendor) => {
      const criteria = buildMatchCriteria(wedding, vendor.category);
      return { vendor, match: scoreVendor(vendor, availabilityByVendor.get(vendor.id) ?? [], criteria) };
    })
    .sort((a, b) => b.match.score - a.match.score);
}
