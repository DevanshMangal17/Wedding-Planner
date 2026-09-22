import { differenceInCalendarDays } from "date-fns";
import { db } from "@/lib/db";

export interface AttentionItem {
  severity: "critical" | "warning";
  text: string;
  href: string;
}

export interface UpcomingItem {
  label: string;
  dateLabel: string;
  date: Date;
}

export interface ControlTowerData {
  readinessPct: number;
  budgetTotal: number;
  budgetSpent: number;
  budgetPct: number;
  budgetStatus: "on_track" | "at_risk";
  vendorConfirmed: number;
  vendorTotal: number;
  criticalTasksCount: number;
  delayedCount: number;
  upcomingPaymentsAmount: number;
  logisticsReadinessPct: number;
  upcoming: UpcomingItem[];
  attention: AttentionItem[];
  overallStatusPct: number;
}

export function relativeDateLabel(date: Date, now: Date = new Date()): string {
  const days = differenceInCalendarDays(date, now);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

export async function getControlTowerData(weddingId: string): Promise<ControlTowerData> {
  const now = new Date();
  const wedding = await db.wedding.findUniqueOrThrow({ where: { id: weddingId } });

  const [tasks, bookings, payments, logisticsItems] = await Promise.all([
    db.weddingTask.findMany({ where: { weddingId } }),
    db.vendorBooking.findMany({ where: { weddingId }, include: { vendor: true, milestones: true } }),
    db.payment.findMany({ where: { weddingId }, include: { booking: { include: { vendor: true } } } }),
    db.logisticsItem.findMany({ where: { weddingId } }),
  ]);

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const readinessPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const budgetPct = wedding.budgetTotal > 0 ? Math.round((wedding.budgetSpent / wedding.budgetTotal) * 100) : 0;
  const budgetStatus: ControlTowerData["budgetStatus"] = budgetPct <= 100 ? "on_track" : "at_risk";

  const vendorConfirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const vendorTotal = bookings.length;

  // "Critical" means genuinely time-sensitive right now — at risk/delayed,
  // or high-priority and due soon — not every high-priority task on the
  // whole checklist regardless of how far off its due date is. A fresh
  // onboarding with a wedding months away should not read as urgent.
  const criticalTasksCount = tasks.filter((t) => {
    if (t.status === "COMPLETED") return false;
    if (t.status === "AT_RISK" || t.status === "DELAYED") return true;
    if (t.priority !== "CRITICAL" && t.priority !== "HIGH") return false;
    return differenceInCalendarDays(t.dueDate, now) <= 30;
  }).length;
  const delayedCount = tasks.filter((t) => t.status === "DELAYED" || t.status === "AT_RISK").length;

  const upcomingPaymentsAmount = payments
    .filter((p) => p.status === "DUE" || (p.status === "PENDING" && differenceInCalendarDays(p.dueDate, now) <= 7))
    .reduce((sum, p) => sum + p.amount, 0);

  const deliveredLogistics = logisticsItems.filter((l) => l.status === "DELIVERED").length;
  const logisticsReadinessPct = logisticsItems.length > 0 ? Math.round((deliveredLogistics / logisticsItems.length) * 100) : 100;

  // Upcoming: nearest future tasks + milestones + payments, deduped by date proximity
  const upcomingCandidates: UpcomingItem[] = [];
  for (const t of tasks) {
    if (t.status === "COMPLETED") continue;
    const days = differenceInCalendarDays(t.dueDate, now);
    if (days >= 0 && days <= 14) upcomingCandidates.push({ label: t.title, dateLabel: relativeDateLabel(t.dueDate, now), date: t.dueDate });
  }
  for (const b of bookings) {
    for (const m of b.milestones) {
      if (m.status === "COMPLETED" || m.status === "RECEIVED") continue;
      const days = differenceInCalendarDays(m.expectedDate, now);
      if (days >= 0 && days <= 14) {
        upcomingCandidates.push({
          label: `${b.vendor.name.split(" ")[0]} — ${m.title.toLowerCase()}`,
          dateLabel: relativeDateLabel(m.expectedDate, now),
          date: m.expectedDate,
        });
      }
    }
  }
  const upcoming = upcomingCandidates.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);

  // Attention required: overdue milestones, at-risk/delayed tasks, due payments
  const attention: AttentionItem[] = [];
  for (const b of bookings) {
    for (const m of b.milestones) {
      if (m.status === "OVERDUE") {
        attention.push({
          severity: "critical",
          text: `${b.vendor.name}'s ${m.title.toLowerCase()} is overdue`,
          href: "/app/messages",
        });
      }
    }
  }
  const atRiskTasks = tasks.filter((t) => t.status === "AT_RISK" || t.status === "DELAYED");
  for (const t of atRiskTasks.slice(0, 3)) {
    attention.push({ severity: t.status === "DELAYED" ? "critical" : "warning", text: `${t.title} needs attention`, href: "/app/plan" });
  }
  const duePayments = payments.filter((p) => p.status === "DUE" || p.status === "OVERDUE");
  if (duePayments.length > 0) {
    attention.push({
      severity: duePayments.some((p) => p.status === "OVERDUE") ? "critical" : "warning",
      text: `${duePayments.length} vendor payment${duePayments.length > 1 ? "s" : ""} due this week`,
      href: "/app/payments",
    });
  }

  const overallStatusPct = Math.round(
    readinessPct * 0.4 +
      (budgetStatus === "on_track" ? 100 : 60) * 0.2 +
      (vendorTotal > 0 ? (vendorConfirmed / vendorTotal) * 100 : 100) * 0.2 +
      logisticsReadinessPct * 0.2,
  );

  return {
    readinessPct,
    budgetTotal: wedding.budgetTotal,
    budgetSpent: wedding.budgetSpent,
    budgetPct,
    budgetStatus,
    vendorConfirmed,
    vendorTotal,
    criticalTasksCount,
    delayedCount,
    upcomingPaymentsAmount,
    logisticsReadinessPct,
    upcoming,
    attention: attention.slice(0, 6),
    overallStatusPct: Math.min(100, Math.max(0, overallStatusPct)),
  };
}
