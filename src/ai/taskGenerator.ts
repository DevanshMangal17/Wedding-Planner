import { addDays, subDays } from "date-fns";
import type { TaskPhase, TaskPriority } from "@prisma/client";

export interface TaskBlueprint {
  title: string;
  category: string;
  phase: TaskPhase;
  priority: TaskPriority;
  description?: string;
  functionName?: string; // ties the task to a WeddingFunction by name, if present
}

export interface WeddingProfileInput {
  weddingDate: Date;
  guestCount: number;
  functionNames: string[]; // e.g. ["Mehendi", "Haldi", "Wedding", "Reception"]
  religion?: string | null;
  outstationGuestPct?: number | null;
  needsAccommodation?: boolean;
  needsTransportation?: boolean;
  multiCity?: boolean;
  existingVendorCategories?: string[]; // categories already booked at onboarding time
}

const PHASE_OFFSET_DAYS: Record<TaskPhase, number> = {
  SIX_MONTHS_BEFORE: -180,
  THREE_MONTHS_BEFORE: -90,
  ONE_MONTH_BEFORE: -30,
  ONE_WEEK_BEFORE: -7,
  WEDDING_DAY: 0,
  POST_WEDDING: 14,
};

/**
 * The checklist is deterministic, rule-based TypeScript rather than a raw
 * LLM call: a wedding's task list drives dependent payments, milestones and
 * the control-tower "critical tasks" count, so it has to be reproducible
 * and inspectable rather than something that can quietly hallucinate a
 * different list on every regeneration.
 */
export function generateTaskBlueprints(profile: WeddingProfileInput): TaskBlueprint[] {
  const blueprints: TaskBlueprint[] = [];
  const already = new Set((profile.existingVendorCategories ?? []).map((c) => c.toUpperCase()));
  const hasFunction = (name: string) =>
    profile.functionNames.some((f) => f.toLowerCase() === name.toLowerCase());

  const add = (bp: TaskBlueprint) => blueprints.push(bp);

  // --- 6 months before -------------------------------------------------
  if (!already.has("VENUE")) {
    add({ title: "Shortlist and book wedding venue", category: "Venue", phase: "SIX_MONTHS_BEFORE", priority: "CRITICAL" });
  }
  if (!already.has("CATERER")) {
    add({ title: "Finalise caterer and menu direction", category: "Catering", phase: "SIX_MONTHS_BEFORE", priority: "HIGH" });
  }
  if (!already.has("PHOTOGRAPHER")) {
    add({ title: "Book photographer", category: "Photography", phase: "SIX_MONTHS_BEFORE", priority: "HIGH" });
  }
  if (!already.has("VIDEOGRAPHER")) {
    add({ title: "Book videographer", category: "Videography", phase: "SIX_MONTHS_BEFORE", priority: "MEDIUM" });
  }
  if (!already.has("DECORATOR")) {
    add({ title: "Shortlist decorator and share mood board", category: "Decor", phase: "SIX_MONTHS_BEFORE", priority: "HIGH" });
  }
  add({ title: "Set category-wise budget allocation", category: "Budget", phase: "SIX_MONTHS_BEFORE", priority: "CRITICAL" });
  add({ title: "Create guest list draft", category: "Guests", phase: "SIX_MONTHS_BEFORE", priority: "MEDIUM" });
  if (profile.needsAccommodation) {
    add({ title: "Block hotel rooms for outstation guests", category: "Accommodation", phase: "SIX_MONTHS_BEFORE", priority: "HIGH" });
  }

  // --- Function-specific (6 months) ------------------------------------
  if (hasFunction("Mehendi") && !already.has("MEHENDI")) {
    add({ title: "Book mehendi artist", category: "Mehendi", phase: "SIX_MONTHS_BEFORE", priority: "MEDIUM", functionName: "Mehendi" });
  }
  if (hasFunction("Engagement")) {
    add({ title: "Plan engagement ceremony details", category: "Rituals", phase: "SIX_MONTHS_BEFORE", priority: "MEDIUM", functionName: "Engagement" });
    add({ title: "Order engagement rings", category: "Jewellery", phase: "SIX_MONTHS_BEFORE", priority: "HIGH", functionName: "Engagement" });
  }
  if ((hasFunction("Wedding") || hasFunction("Reception")) && !already.has("MAKEUP")) {
    add({ title: "Book makeup artist", category: "Makeup", phase: "SIX_MONTHS_BEFORE", priority: "HIGH" });
  }
  if (profile.religion?.toLowerCase().includes("hindu") && !already.has("PRIEST")) {
    add({ title: "Book priest for rituals", category: "Rituals", phase: "SIX_MONTHS_BEFORE", priority: "HIGH" });
  }

  // --- 3 months before ---------------------------------------------------
  add({ title: "Design and order wedding invitations", category: "Invitations", phase: "THREE_MONTHS_BEFORE", priority: "HIGH" });
  add({ title: "Finalise jewellery selection", category: "Jewellery", phase: "THREE_MONTHS_BEFORE", priority: "MEDIUM" });
  add({ title: "Finalise bridal and groom outfits", category: "Outfits", phase: "THREE_MONTHS_BEFORE", priority: "HIGH" });
  if (profile.needsTransportation) {
    add({ title: "Arrange guest transportation plan", category: "Transportation", phase: "THREE_MONTHS_BEFORE", priority: "MEDIUM" });
  }
  if (!already.has("ENTERTAINMENT") && (hasFunction("Reception") || hasFunction("Wedding"))) {
    add({ title: "Book entertainment / DJ", category: "Entertainment", phase: "THREE_MONTHS_BEFORE", priority: "MEDIUM" });
  }
  if (!already.has("FLORIST")) {
    add({ title: "Confirm floral arrangements with florist", category: "Florals", phase: "THREE_MONTHS_BEFORE", priority: "LOW" });
  }
  add({ title: "Share shot list with photographer", category: "Photography", phase: "THREE_MONTHS_BEFORE", priority: "MEDIUM" });
  add({ title: "Finalise decor theme and colour palette", category: "Decor", phase: "THREE_MONTHS_BEFORE", priority: "MEDIUM" });
  if (profile.multiCity) {
    add({ title: "Coordinate logistics across wedding cities", category: "Logistics", phase: "THREE_MONTHS_BEFORE", priority: "HIGH" });
  }
  if (profile.guestCount > 300) {
    add({ title: "Confirm catering plan for large guest count", category: "Catering", phase: "THREE_MONTHS_BEFORE", priority: "HIGH" });
  }

  // --- 1 month before ------------------------------------------------------
  add({ title: "Confirm final guest count with all vendors", category: "Guests", phase: "ONE_MONTH_BEFORE", priority: "CRITICAL" });
  add({ title: "Complete vendor booking confirmations", category: "Vendors", phase: "ONE_MONTH_BEFORE", priority: "CRITICAL" });
  add({ title: "Clear pending advance payments", category: "Payments", phase: "ONE_MONTH_BEFORE", priority: "CRITICAL" });
  add({ title: "Finalise wedding day logistics plan", category: "Logistics", phase: "ONE_MONTH_BEFORE", priority: "HIGH" });
  add({ title: "Makeup trial run", category: "Makeup", phase: "ONE_MONTH_BEFORE", priority: "MEDIUM" });
  add({ title: "Dispatch wedding invitations", category: "Invitations", phase: "ONE_MONTH_BEFORE", priority: "HIGH" });
  if (profile.needsAccommodation) {
    add({ title: "Share room allocation with outstation guests", category: "Accommodation", phase: "ONE_MONTH_BEFORE", priority: "MEDIUM" });
  }

  // --- 1 week before --------------------------------------------------------
  add({ title: "Reconfirm all vendor arrival times", category: "Vendors", phase: "ONE_WEEK_BEFORE", priority: "CRITICAL" });
  add({ title: "Share day-of run sheet with vendors and family", category: "Logistics", phase: "ONE_WEEK_BEFORE", priority: "HIGH" });
  add({ title: "Pack and dispatch return gifts", category: "Gifts", phase: "ONE_WEEK_BEFORE", priority: "MEDIUM" });
  add({ title: "Final rehearsal for key rituals", category: "Rituals", phase: "ONE_WEEK_BEFORE", priority: "MEDIUM" });

  // --- Function days (wedding day phase) ------------------------------------
  for (const fn of profile.functionNames) {
    add({ title: `Execution checklist: ${fn}`, category: "Execution", phase: "WEDDING_DAY", priority: "CRITICAL", functionName: fn });
  }

  // --- Post-wedding ---------------------------------------------------------
  add({ title: "Collect raw photos and videos from photographer", category: "Photography", phase: "POST_WEDDING", priority: "MEDIUM" });
  add({ title: "Clear final vendor payments", category: "Payments", phase: "POST_WEDDING", priority: "HIGH" });
  add({ title: "Return rented outfits and jewellery", category: "Returns", phase: "POST_WEDDING", priority: "MEDIUM" });
  add({ title: "Document jewellery and gifts received", category: "Documentation", phase: "POST_WEDDING", priority: "LOW" });
  add({ title: "Update legal documents and address changes", category: "Documentation", phase: "POST_WEDDING", priority: "MEDIUM" });
  add({ title: "Send thank-you messages to guests", category: "Guests", phase: "POST_WEDDING", priority: "LOW" });
  add({ title: "Review and approve final wedding album", category: "Photography", phase: "POST_WEDDING", priority: "MEDIUM" });

  return blueprints;
}

export function resolveDueDate(weddingDate: Date, phase: TaskPhase): Date {
  const offset = PHASE_OFFSET_DAYS[phase];
  return offset >= 0 ? addDays(weddingDate, offset) : subDays(weddingDate, Math.abs(offset));
}
