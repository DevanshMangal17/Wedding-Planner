import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
  MILESTONE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  milestoneStatusTone,
  paymentStatusTone,
  formatDate,
  formatINR,
} from "@/lib/labels";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdvanceBookingButton, CancelBookingButton, MilestoneActions, IgnoreFollowUpButton } from "./booking-actions";

export default async function BookingDetailPage({ params }: PageProps<"/app/vendors/bookings/[bookingId]">) {
  const { bookingId } = await params;
  const { wedding } = await requireWedding();

  const booking = await db.vendorBooking.findUnique({
    where: { id: bookingId },
    include: {
      vendor: true,
      milestones: { orderBy: { expectedDate: "asc" } },
      payments: { orderBy: { dueDate: "asc" } },
    },
  });
  if (!booking || booking.weddingId !== wedding.id) notFound();

  const followUps = await db.followUp.findMany({ where: { bookingId: booking.id, status: "PENDING" } });
  const followUpByMilestone = new Map(followUps.map((f) => [f.milestoneId, f]));

  const currentIdx = BOOKING_STATUS_ORDER.indexOf(booking.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/app/vendors/${booking.vendorId}`} className="text-sm text-muted-foreground hover:underline">
        ← {booking.vendor.name}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium">{booking.vendor.name}</h1>
          <p className="text-sm text-muted-foreground">
            {booking.status === "CANCELLED" ? "Cancelled" : BOOKING_STATUS_LABELS[booking.status]}
          </p>
        </div>
        {booking.status !== "CANCELLED" && booking.status !== "CONFIRMED" && (
          <div className="flex items-center gap-2">
            <AdvanceBookingButton bookingId={booking.id} status={booking.status} />
            <CancelBookingButton bookingId={booking.id} />
          </div>
        )}
      </div>

      {booking.status !== "CANCELLED" && (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <ol className="flex min-w-max items-center gap-1">
              {BOOKING_STATUS_ORDER.map((s, i) => (
                <li key={s} className="flex items-center gap-1">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border text-xs font-medium",
                      i < currentIdx && "border-success bg-success text-success-foreground",
                      i === currentIdx && "border-primary bg-primary text-primary-foreground",
                      i > currentIdx && "border-border text-muted-foreground",
                    )}
                  >
                    {i < currentIdx ? <Check className="size-3.5" /> : i + 1}
                  </div>
                  <span className={cn("mr-2 text-xs whitespace-nowrap", i === currentIdx ? "font-medium" : "text-muted-foreground")}>
                    {BOOKING_STATUS_LABELS[s]}
                  </span>
                  {i < BOOKING_STATUS_ORDER.length - 1 && <div className="h-px w-4 bg-border" />}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {booking.milestones.map((m) => {
            const followUp = followUpByMilestone.get(m.id);
            return (
              <div key={m.id} className="rounded-xl border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">Expected {formatDate(m.expectedDate)}</p>
                  </div>
                  <StatusBadge label={MILESTONE_STATUS_LABELS[m.status]} tone={milestoneStatusTone(m.status)} />
                </div>
                {m.status === "OVERDUE" && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                    <p className="text-xs text-danger">
                      This has been pending for a while. Following up now is a good idea — if there&apos;s no response
                      within 6 hours, look for alternatives.
                    </p>
                    <div className="flex items-center gap-2">
                      <MilestoneActions bookingId={booking.id} milestoneId={m.id} category={booking.category} />
                      {followUp && <IgnoreFollowUpButton followUpId={followUp.id} />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {booking.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
              <div>
                <p className="text-sm">{p.milestoneLabel}</p>
                <p className="text-xs text-muted-foreground">Due {formatDate(p.dueDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{formatINR(p.amount)}</span>
                <StatusBadge label={PAYMENT_STATUS_LABELS[p.status]} tone={paymentStatusTone(p.status)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
