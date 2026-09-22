"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const updateSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "WAITING_VENDOR", "COMPLETED", "AT_RISK", "DELAYED"]),
});

export async function updateTaskStatusAction(taskId: string, status: string) {
  const session = await requireSession();
  const parsed = updateSchema.safeParse({ taskId, status });
  if (!parsed.success) return { error: "Invalid input" };

  const task = await db.weddingTask.findUnique({ where: { id: parsed.data.taskId }, include: { wedding: true } });
  if (!task || task.wedding.ownerId !== session.user.id) return { error: "Not found" };

  await db.weddingTask.update({ where: { id: task.id }, data: { status: parsed.data.status } });
  revalidatePath("/app/plan");
  revalidatePath("/app/home");
  return {};
}
