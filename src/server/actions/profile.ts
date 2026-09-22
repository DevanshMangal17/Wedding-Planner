"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const schema = z.object({
  weddingId: z.string().min(1),
  guestCount: z.coerce.number().int().min(1).max(5000),
  budgetTotal: z.coerce.number().int().min(100000),
  style: z.string().max(200).optional(),
  colorTheme: z.string().max(200).optional(),
});

export interface ProfileActionResult {
  error?: string;
  success?: boolean;
}

export async function updateWeddingProfileAction(_prev: ProfileActionResult, formData: FormData): Promise<ProfileActionResult> {
  const session = await requireSession();
  const parsed = schema.safeParse({
    weddingId: formData.get("weddingId"),
    guestCount: formData.get("guestCount"),
    budgetTotal: formData.get("budgetTotal"),
    style: formData.get("style"),
    colorTheme: formData.get("colorTheme"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const wedding = await db.wedding.findUnique({ where: { id: parsed.data.weddingId } });
  if (!wedding || wedding.ownerId !== session.user.id) return { error: "Not found" };

  await db.wedding.update({
    where: { id: wedding.id },
    data: {
      guestCount: parsed.data.guestCount,
      budgetTotal: parsed.data.budgetTotal,
      style: parsed.data.style,
      colorTheme: parsed.data.colorTheme,
    },
  });

  revalidatePath("/app/profile");
  revalidatePath("/app/home");
  return { success: true };
}
