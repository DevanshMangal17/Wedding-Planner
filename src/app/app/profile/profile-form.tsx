"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWeddingProfileAction, type ProfileActionResult } from "@/server/actions/profile";
import type { Wedding } from "@prisma/client";

const initialState: ProfileActionResult = {};

export function ProfileForm({ wedding }: { wedding: Wedding }) {
  const [state, formAction, pending] = useActionState(updateWeddingProfileAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("Profile updated");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="weddingId" value={wedding.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="guestCount">Guest count</Label>
          <Input id="guestCount" name="guestCount" type="number" defaultValue={wedding.guestCount} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budgetTotal">Total budget (₹)</Label>
          <Input id="budgetTotal" name="budgetTotal" type="number" defaultValue={wedding.budgetTotal} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="style">Style</Label>
          <Input id="style" name="style" defaultValue={wedding.style ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="colorTheme">Colour theme</Label>
          <Input id="colorTheme" name="colorTheme" defaultValue={wedding.colorTheme ?? ""} />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
