"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle as ADialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { VENDOR_CATEGORY_LABELS, formatINR, formatDate } from "@/lib/labels";
import { generateSOSOptionsAction, bookSOSOptionAction, contactAllSOSOptionsAction } from "@/server/actions/sos";
import type { SOSCase, SOSOption, Vendor } from "@prisma/client";

type CaseWithOptions = SOSCase & { options: (SOSOption & { vendor: Vendor })[] };

export function SOSCaseCard({ sosCase }: { sosCase: CaseWithOptions }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const resolvedOption = sosCase.options.find((o) => o.isSelected);

  return (
    <Card className={sosCase.status === "OPEN" || sosCase.status === "OPTIONS_PROVIDED" ? "border-danger/30" : undefined}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base font-medium">
          <span>{sosCase.title}</span>
          <StatusBadge
            label={sosCase.status.replace("_", " ")}
            tone={sosCase.status === "RESOLVED" ? "success" : sosCase.status === "OPEN" ? "danger" : "warning"}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{sosCase.description}</p>
        <p className="text-xs text-muted-foreground">
          {VENDOR_CATEGORY_LABELS[sosCase.category]} · needed by {formatDate(sosCase.neededByDate)}
        </p>

        {sosCase.status === "OPEN" && (
          <Button
            size="sm"
            disabled={pending}
            className="gap-2"
            onClick={() =>
              startTransition(async () => {
                await generateSOSOptionsAction(sosCase.id);
                router.refresh();
              })
            }
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />} Find replacements
          </Button>
        )}

        {sosCase.status === "OPTIONS_PROVIDED" && (
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="size-4 text-gold" /> We found {sosCase.options.length} potential replacement
              {sosCase.options.length > 1 ? "s" : ""}.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {sosCase.options.map((o) => (
                <div key={o.id} className="rounded-xl border border-border p-3">
                  <p className="text-xs font-medium text-gold-foreground">{o.label}</p>
                  <p className="mt-1 text-sm font-medium">{o.vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{formatINR(o.price)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{o.reason}</p>
                  <BookOptionButton sosCaseId={sosCase.id} option={o} />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                nativeButton={false} render={<Link href={`/app/vendors/compare?ids=${sosCase.options.map((o) => o.vendorId).join(",")}`} />}
              >
                Compare
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await contactAllSOSOptionsAction(sosCase.id);
                    toast.success(`Sent inquiries to ${result.count} vendors`);
                  })
                }
              >
                Contact all {sosCase.options.length}
              </Button>
            </div>
          </div>
        )}

        {sosCase.status === "RESOLVED" && resolvedOption && (
          <p className="text-sm text-success">Booked {resolvedOption.vendor.name} as a replacement.</p>
        )}
      </CardContent>
    </Card>
  );
}

function BookOptionButton({ sosCaseId, option }: { sosCaseId: string; option: SOSOption & { vendor: Vendor } }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="mt-2 w-full" />}>
        Book {option.label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <ADialogTitle>Book {option.vendor.name}?</ADialogTitle>
          <DialogDescription>
            This confirms {option.vendor.name} as your replacement at {formatINR(option.price)}, and creates a
            payment due in 2 days. This is a simulated booking for the prototype.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={pending}
            className="gap-2"
            onClick={() =>
              startTransition(async () => {
                const result = await bookSOSOptionAction(sosCaseId, option.id);
                setOpen(false);
                if ("bookingId" in result && result.bookingId) {
                  router.push(`/app/vendors/bookings/${result.bookingId}`);
                }
              })
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />} Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
