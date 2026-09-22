import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { findOverdueMilestones, escalationRecommendation } from "@/ai/followUpAgent";

export interface AssistantAction {
  label: string;
  href: string;
}

export interface AssistantReply {
  text: string;
  actions?: AssistantAction[];
}

type Intent =
  | "TASKS_THIS_WEEK"
  | "BUDGET_STATUS"
  | "FOLLOWUP"
  | "FIND_VENDOR"
  | "PENDING_ITEMS"
  | "CHECKLIST"
  | "GENERIC";

function detectIntent(message: string): Intent {
  const m = message.toLowerCase();
  if (/(this week|today|due|upcoming)/.test(m) && /(task|do|need)/.test(m)) return "TASKS_THIS_WEEK";
  if (/(budget|spend|overspend|over budget|cost)/.test(m)) return "BUDGET_STATUS";
  if (/(follow.?up|chase|remind)/.test(m)) return "FOLLOWUP";
  if (/(find|search|shortlist|another|backup|alternative)/.test(m) && /(vendor|photographer|caterer|decorator|makeup|venue|dj|florist)/.test(m)) {
    return "FIND_VENDOR";
  }
  if (/(pending|what's left|what is pending|outstanding)/.test(m)) return "PENDING_ITEMS";
  if (/(checklist|plan|prepare)/.test(m)) return "CHECKLIST";
  return "GENERIC";
}

/**
 * Every branch answers from data fetched for this wedding right before
 * responding — never from the model's own guess — so numbers stay correct
 * even when a live provider is configured. The model, when present, is only
 * asked to restate an already-assembled fact sheet in nicer prose.
 */
export async function answerAssistantQuery(message: string, weddingId: string): Promise<AssistantReply> {
  const intent = detectIntent(message);

  switch (intent) {
    case "TASKS_THIS_WEEK": {
      const weekOut = addDays(new Date(), 7);
      const tasks = await db.weddingTask.findMany({
        where: { weddingId, dueDate: { lte: weekOut }, status: { notIn: ["COMPLETED"] } },
        orderBy: { dueDate: "asc" },
      });
      const critical = tasks.filter((t) => t.priority === "CRITICAL" || t.priority === "HIGH").length;
      if (tasks.length === 0) {
        return { text: "Nothing due in the next 7 days — you're clear for this week." };
      }
      return {
        text: `You have ${tasks.length} thing${tasks.length > 1 ? "s" : ""} due this week. ${critical} ${critical === 1 ? "is" : "are"} high priority: ${tasks.slice(0, 3).map((t) => t.title).join(", ")}${tasks.length > 3 ? ", and more" : ""}.`,
        actions: [{ label: "Open Plan", href: "/app/plan" }],
      };
    }

    case "BUDGET_STATUS": {
      const wedding = await db.wedding.findUnique({ where: { id: weddingId } });
      if (!wedding) return { text: "I couldn't find your wedding budget." };
      const pctSpent = wedding.budgetTotal > 0 ? Math.round((wedding.budgetSpent / wedding.budgetTotal) * 100) : 0;
      const remaining = wedding.budgetTotal - wedding.budgetSpent;
      return {
        text: `You've spent ₹${(wedding.budgetSpent / 100000).toFixed(1)}L of your ₹${(wedding.budgetTotal / 100000).toFixed(1)}L budget (${pctSpent}%). ₹${(remaining / 100000).toFixed(1)}L remaining.`,
        actions: [{ label: "Open Payments", href: "/app/payments" }],
      };
    }

    case "FOLLOWUP": {
      const bookings = await db.vendorBooking.findMany({
        where: { weddingId },
        include: { vendor: true, milestones: true },
      });
      const overdue = bookings
        .flatMap((b) => findOverdueMilestones(b.milestones).map((o) => ({ booking: b, ...o })))
        .sort((a, b) => b.daysOverdue - a.daysOverdue);
      if (overdue.length === 0) {
        return { text: "Nothing needs a follow-up right now — all vendor milestones are on track." };
      }
      const top = overdue[0];
      return {
        text: `${top.booking.vendor.name}'s "${top.milestone.title}" is overdue by ${top.daysOverdue} day${top.daysOverdue > 1 ? "s" : ""}. ${escalationRecommendation(top.daysOverdue)}`,
        actions: [{ label: "Open Messages", href: "/app/messages" }],
      };
    }

    case "FIND_VENDOR": {
      const categoryHints: Record<string, string> = {
        photographer: "PHOTOGRAPHER",
        caterer: "CATERER",
        decorator: "DECORATOR",
        makeup: "MAKEUP",
        venue: "VENUE",
        dj: "ENTERTAINMENT",
        florist: "FLORIST",
      };
      const found = Object.keys(categoryHints).find((k) => message.toLowerCase().includes(k));
      const category = found ? categoryHints[found] : undefined;
      return {
        text: category
          ? `Let's find you a ${found}. Opening vendor matches for that category.`
          : "Tell me which category you'd like backup options for, or open Vendors to browse.",
        actions: [{ label: "Open Vendors", href: category ? `/app/vendors?category=${category}` : "/app/vendors" }],
      };
    }

    case "PENDING_ITEMS": {
      const [criticalTasks, unconfirmedBookings, duePayments] = await Promise.all([
        db.weddingTask.count({ where: { weddingId, status: { in: ["AT_RISK", "DELAYED"] } } }),
        db.vendorBooking.count({ where: { weddingId, status: { notIn: ["CONFIRMED", "CANCELLED"] } } }),
        db.payment.count({ where: { weddingId, status: { in: ["DUE", "OVERDUE"] } } }),
      ]);
      return {
        text: `${criticalTasks} thing${criticalTasks === 1 ? "" : "s"} need attention, ${unconfirmedBookings} vendor booking${unconfirmedBookings === 1 ? "" : "s"} still in progress, and ${duePayments} payment${duePayments === 1 ? "" : "s"} due.`,
        actions: [{ label: "Open Control Tower", href: "/app/home" }],
      };
    }

    case "CHECKLIST":
      return {
        text: "Your checklist is organised by how far out you are from the wedding date. Open Plan to see what's next.",
        actions: [{ label: "Open Plan", href: "/app/plan" }],
      };

    default:
      return {
        text: "I can help with tasks, budget, vendor follow-ups, finding backup vendors, or what's pending. What would you like me to take care of?",
      };
  }
}
