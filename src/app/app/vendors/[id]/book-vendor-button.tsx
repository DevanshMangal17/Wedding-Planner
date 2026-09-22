"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { startBookingAction } from "@/server/actions/vendors";
import { formatINR } from "@/lib/labels";

export function BookVendorButton({
  weddingId,
  vendorId,
  vendorName,
  estimatedAmount,
}: {
  weddingId: string;
  vendorId: string;
  vendorName: string;
  estimatedAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function confirm() {
    startTransition(async () => {
      const result = await startBookingAction(weddingId, vendorId);
      setOpen(false);
      router.push(`/app/vendors/bookings/${result.bookingId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Request Quotation</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a booking with {vendorName}?</DialogTitle>
          <DialogDescription>
            We&apos;ll create a booking request, an estimated payment schedule (~{formatINR(estimatedAmount)} total),
            and start tracking milestones. This doesn&apos;t charge you anything yet — nothing is paid until you
            confirm a payment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={confirm} disabled={pending} className="gap-2">
            {pending && <Loader2 className="size-4 animate-spin" />} Confirm & request quotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
