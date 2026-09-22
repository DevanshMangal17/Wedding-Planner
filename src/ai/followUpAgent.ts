import { differenceInCalendarDays } from "date-fns";
import type { VendorMilestone } from "@prisma/client";
import { getAIProvider } from "@/ai/provider";

export interface OverdueMilestone {
  milestone: VendorMilestone;
  daysOverdue: number;
}

/**
 * Pure date-math check — this is what actually decides "overdue", never the
 * model. A milestone due earlier today is not yet overdue (the day isn't
 * over), so this only counts whole calendar days past the expected date,
 * and returns them worst-first so callers that just want "the" overdue
 * milestone get the most urgent one rather than whichever happens to be
 * first in the input order.
 */
export function findOverdueMilestones(
  milestones: VendorMilestone[],
  now: Date = new Date(),
): OverdueMilestone[] {
  return milestones
    .filter((m) => m.status !== "RECEIVED" && m.status !== "COMPLETED")
    .map((m) => ({ milestone: m, daysOverdue: differenceInCalendarDays(now, m.expectedDate) }))
    .filter((m) => m.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export interface FollowUpMessageInput {
  coupleNames: string; // "Priya & Dev"
  weddingDate: string; // pre-formatted, e.g. "18 February"
  vendorContactName: string;
  milestoneTitle: string;
}

function templateMessage(input: FollowUpMessageInput): string {
  return `Hi ${input.vendorContactName}, just checking in on the ${input.milestoneTitle.toLowerCase()} for ${input.coupleNames}'s wedding on ${input.weddingDate}. Could you please share an update by end of day today?`;
}

export async function draftFollowUpMessage(input: FollowUpMessageInput): Promise<string> {
  const provider = getAIProvider();
  const fallback = templateMessage(input);
  if (!provider.isLive) return fallback;

  const system =
    "You draft a short, polite WhatsApp-style follow-up message to a wedding vendor on behalf of a couple. Keep it under 40 words, one message, no greeting fluff beyond a name.";
  const prompt = `Couple: ${input.coupleNames}. Wedding date: ${input.weddingDate}. Vendor contact: ${input.vendorContactName}. Pending item: ${input.milestoneTitle}.`;
  try {
    return await provider.generateText(system, prompt);
  } catch {
    return fallback;
  }
}

export function escalationRecommendation(daysOverdue: number): string {
  if (daysOverdue >= 3) {
    return "This has been pending for a while. I recommend following up now — if there's no response within 6 hours, I can shortlist 3 alternatives so you're not stuck waiting.";
  }
  return "I recommend following up now. If there is no response within 6 hours, I can shortlist 3 alternatives.";
}
