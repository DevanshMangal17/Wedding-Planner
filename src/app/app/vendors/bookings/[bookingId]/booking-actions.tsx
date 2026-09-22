"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { advanceBookingStatusAction, cancelBookingAction } from "@/server/actions/vendors";
import { sendFollowUpAction, ignoreFollowUpAction } from "@/server/actions/followups";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_ORDER } from "@/lib/labels";
import type { BookingStatus, VendorCategory } from "@prisma/client";
import Link from "next/link";

export function AdvanceBookingButton({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [pending, startTransition] = useTransition();
  const idx = BOOKING_STATUS_ORDER.indexOf(status);
  const next = BOOKING_STATUS_ORDER[idx + 1];
  if (!next) return null;

  return (
    <Button
      size="sm"
      disabled={pending}
      className="gap-2"
      onClick={() =>
        startTransition(async () => {
          await advanceBookingStatusAction(bookingId);
          toast.success(`Moved to: ${BOOKING_STATUS_LABELS[next]}`);
        })
      }
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      Mark &quot;{BOOKING_STATUS_LABELS[next]}&quot; done
    </Button>
  );
}

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-muted-foreground"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelBookingAction(bookingId);
          router.push("/app/vendors");
        })
      }
    >
      <X className="size-3.5" /> Cancel booking
    </Button>
  );
}

export function MilestoneActions({
  bookingId,
  milestoneId,
  category,
}: {
  bookingId: string;
  milestoneId: string;
  category: VendorCategory;
}) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending || sent}
        className="gap-1.5"
        onClick={() =>
          startTransition(async () => {
            const result = await sendFollowUpAction(bookingId, milestoneId);
            setSent(true);
            if (result.message) toast.success("Follow-up sent", { description: result.message });
          })
        }
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        {sent ? "Follow-up sent" : "Send Follow-up"}
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" nativeButton={false} render={<Link href={`/app/vendors?category=${category}`} />}>
        <Search className="size-3.5" /> Find Alternatives
      </Button>
    </div>
  );
}

export function IgnoreFollowUpButton({ followUpId }: { followUpId: string }) {
  const [pending, startTransition] = useTransition();
  const [ignored, setIgnored] = useState(false);
  if (ignored) return <span className="text-xs text-muted-foreground">Ignored</span>;
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await ignoreFollowUpAction(followUpId);
          setIgnored(true);
        })
      }
    >
      Ignore
    </Button>
  );
}
