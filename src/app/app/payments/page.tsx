import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { PAYMENT_STATUS_LABELS, paymentStatusTone, formatDate, formatINR } from "@/lib/labels";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { MarkPaidButton } from "./mark-paid-button";

export default async function PaymentsPage() {
  const { wedding } = await requireWedding();
  const bookings = await db.vendorBooking.findMany({
    where: { weddingId: wedding.id, status: { not: "CANCELLED" } },
    include: { vendor: true, payments: { orderBy: { dueDate: "asc" } } },
  });

  const allPayments = bookings.flatMap((b) => b.payments);
  const duePayments = allPayments.filter((p) => p.status === "DUE" || p.status === "OVERDUE");
  const pctSpent = wedding.budgetTotal > 0 ? Math.round((wedding.budgetSpent / wedding.budgetTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every rupee tracked against a vendor milestone.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total budget" value={formatINR(wedding.budgetTotal)} icon={Wallet} />
        <StatCard label="Spent so far" value={`${formatINR(wedding.budgetSpent)} (${pctSpent}%)`} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Due / overdue"
          value={formatINR(duePayments.reduce((s, p) => s + p.amount, 0))}
          hint={`${duePayments.length} payment${duePayments.length === 1 ? "" : "s"}`}
          icon={AlertTriangle}
          tone={duePayments.length > 0 ? "warning" : "success"}
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <Progress value={Math.min(100, pctSpent)} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{pctSpent}% of budget committed and paid.</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const total = booking.payments.reduce((s, p) => s + p.amount, 0);
          return (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base font-medium">
                  <span>{booking.vendor.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">Total {formatINR(total)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2.5">
                    <div>
                      <p className="text-sm">{p.milestoneLabel}</p>
                      <p className="text-xs text-muted-foreground">Due {formatDate(p.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatINR(p.amount)}</span>
                      <StatusBadge label={PAYMENT_STATUS_LABELS[p.status]} tone={paymentStatusTone(p.status)} />
                      {p.status !== "PAID" && <MarkPaidButton paymentId={p.id} label={`${booking.vendor.name} — ${p.milestoneLabel}`} amount={p.amount} />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {bookings.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No vendor bookings yet — payments will appear here once you book a vendor.
          </p>
        )}
      </div>
    </div>
  );
}
