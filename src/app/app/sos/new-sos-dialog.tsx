"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VENDOR_CATEGORY_LABELS } from "@/lib/labels";
import { createSOSCaseAction, generateSOSOptionsAction } from "@/server/actions/sos";
import type { VendorCategory } from "@prisma/client";

export function NewSOSDialog({ weddingId }: { weddingId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState<VendorCategory>("MAKEUP");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neededInDays, setNeededInDays] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      const created = await createSOSCaseAction(weddingId, { category, title, description, neededInDays });
      if ("error" in created && created.error) {
        setError(created.error);
        return;
      }
      if ("sosCaseId" in created && created.sosCaseId) {
        await generateSOSOptionsAction(created.sosCaseId);
      }
      setOpen(false);
      setTitle("");
      setDescription("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" className="gap-2" />}>
        <Siren className="size-4" /> Raise Wedding SOS
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <Siren className="size-5" /> What went wrong?
          </DialogTitle>
          <DialogDescription>
            Tell us what happened — we&apos;ll search vetted replacements and explain the trade-offs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as VendorCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(v: VendorCategory) => VENDOR_CATEGORY_LABELS[v]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VENDOR_CATEGORY_LABELS) as VendorCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {VENDOR_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Short title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Makeup artist cancelled" />
          </div>
          <div className="space-y-1.5">
            <Label>What happened?</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="My makeup artist just cancelled for tomorrow's function..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Needed by (days from now)</Label>
            <Input type="number" min={0} max={60} value={neededInDays} onChange={(e) => setNeededInDays(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={pending || !title.trim() || !description.trim()} className="gap-2" onClick={submit}>
            {pending && <Loader2 className="size-4 animate-spin" />} Find replacements
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
