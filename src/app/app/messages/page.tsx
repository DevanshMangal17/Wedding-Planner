import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { MilestoneActions } from "../vendors/bookings/[bookingId]/booking-actions";
import { Sparkles } from "lucide-react";

export default async function MessagesPage() {
  const { wedding } = await requireWedding();
  const bookings = await db.vendorBooking.findMany({
    where: { weddingId: wedding.id, status: { not: "CANCELLED" } },
    include: {
      vendor: true,
      messages: { orderBy: { sentAt: "asc" } },
      milestones: { where: { status: "OVERDUE" } },
    },
  });

  const withMessages = bookings.filter((b) => b.messages.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vendor communications and follow-ups — simulated for this prototype.
        </p>
      </div>

      <div className="space-y-4">
        {withMessages.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="text-base font-medium">{booking.vendor.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.messages.map((m) => (
                <div key={m.id} className={cn("flex", m.direction === "OUTBOUND" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                      m.direction === "OUTBOUND" ? "bg-primary text-primary-foreground" : "bg-secondary",
                    )}
                  >
                    {m.aiGenerated && (
                      <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide opacity-70">
                        <Sparkles className="size-3" /> AI drafted
                      </p>
                    )}
                    <p>{m.body}</p>
                    <p className="mt-1 text-[10px] opacity-60">{formatDate(m.sentAt)}</p>
                  </div>
                </div>
              ))}
              {booking.milestones.length > 0 && (
                <div className="border-t border-border/60 pt-3">
                  <p className="mb-2 text-xs text-danger">{booking.milestones[0].title} is overdue.</p>
                  <MilestoneActions bookingId={booking.id} milestoneId={booking.milestones[0].id} category={booking.category} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {withMessages.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No messages yet — they&apos;ll appear here once you book a vendor.
          </p>
        )}
      </div>
    </div>
  );
}
