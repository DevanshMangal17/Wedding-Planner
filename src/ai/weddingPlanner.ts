import { getAIProvider } from "@/ai/provider";
import type { VendorCategory } from "@prisma/client";

/** Typical Indian-wedding category split, used only as a starting allocation the couple can override. */
const BUDGET_SPLIT: Partial<Record<VendorCategory, number>> = {
  VENUE: 0.25,
  CATERER: 0.22,
  DECORATOR: 0.12,
  PHOTOGRAPHER: 0.07,
  VIDEOGRAPHER: 0.04,
  JEWELLERY: 0.08,
  MAKEUP: 0.03,
  ENTERTAINMENT: 0.05,
  INVITATIONS: 0.02,
  TRANSPORTATION: 0.03,
  ACCOMMODATION: 0.04,
  FLORIST: 0.02,
  MEHENDI: 0.01,
  PRIEST: 0.01,
};

export function suggestBudgetAllocation(totalBudget: number): Record<VendorCategory, number> {
  const allocation = {} as Record<VendorCategory, number>;
  for (const [category, pct] of Object.entries(BUDGET_SPLIT)) {
    allocation[category as VendorCategory] = Math.round(totalBudget * pct);
  }
  return allocation;
}

export interface PlanSummaryInput {
  brideName: string;
  groomName: string;
  city: string;
  weddingDateLabel: string;
  guestCount: number;
  budgetTotal: number;
  functionNames: string[];
}

function templateSummary(input: PlanSummaryInput): string {
  return (
    `${input.brideName} & ${input.groomName}'s wedding in ${input.city} on ${input.weddingDateLabel} ` +
    `is shaping up around ${input.guestCount} guests across ${input.functionNames.length} function` +
    `${input.functionNames.length === 1 ? "" : "s"} (${input.functionNames.join(", ")}), with a budget of ` +
    `₹${(input.budgetTotal / 100000).toFixed(1)}L. We've drafted a checklist and category budgets to match — ` +
    `you can adjust anything as vendors get finalised.`
  );
}

export async function generatePlanSummary(input: PlanSummaryInput): Promise<string> {
  const provider = getAIProvider();
  const fallback = templateSummary(input);
  if (!provider.isLive) return fallback;

  const system =
    "You write a warm, confident 2-sentence summary opening a couple's wedding plan. Use only the facts given, no invented details, no emojis.";
  const prompt = JSON.stringify(input);
  try {
    return await provider.generateText(system, prompt);
  } catch {
    return fallback;
  }
}
