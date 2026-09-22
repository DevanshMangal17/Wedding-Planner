"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { markPaymentPaidAction } from "@/server/actions/payments";
import { formatINR } from "@/lib/labels";

export function MarkPaidButton({ paymentId, label, amount }: { paymentId: string; label: string; amount: number }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Mark as paid</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark &quot;{label}&quot; as paid?</DialogTitle>
          <DialogDescription>
            This records a simulated payment of {formatINR(amount)}. No real payment provider is connected — this is
            a demo action for the prototype.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={pending}
            className="gap-2"
            onClick={() =>
              startTransition(async () => {
                await markPaymentPaidAction(paymentId);
                setOpen(false);
              })
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />} Confirm payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
