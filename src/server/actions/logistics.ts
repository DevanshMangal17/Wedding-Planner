"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const schema = z.object({
  itemId: z.string().min(1),
  status: z.enum(["PLANNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "DELAYED"]),
});

export async function updateLogisticsStatusAction(itemId: string, status: string) {
  const session = await requireSession();
  const parsed = schema.safeParse({ itemId, status });
  if (!parsed.success) return { error: "Invalid input" };

  const item = await db.logisticsItem.findUnique({ where: { id: parsed.data.itemId }, include: { wedding: true } });
  if (!item || item.wedding.ownerId !== session.user.id) return { error: "Not found" };

  await db.logisticsItem.update({ where: { id: item.id }, data: { status: parsed.data.status } });
  revalidatePath("/app/logistics");
  revalidatePath("/app/home");
  return {};
}
