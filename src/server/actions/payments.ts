"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/** Simulated payment only — no real payment provider is configured. Clearly
 * gated behind explicit confirmation in the UI since marking something paid
 * is a consequential, hard-to-reverse action (§23). */
export async function markPaymentPaidAction(paymentId: string) {
  const session = await requireSession();
  const payment = await db.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { wedding: true } });
  if (payment.wedding.ownerId !== session.user.id) return { error: "Not found" };
  if (payment.status === "PAID") return {};

  await db.$transaction([
    db.payment.update({ where: { id: paymentId }, data: { status: "PAID", paidDate: new Date() } }),
    db.wedding.update({
      where: { id: payment.weddingId },
      data: { budgetSpent: { increment: payment.amount } },
    }),
  ]);

  revalidatePath("/app/payments");
  revalidatePath("/app/home");
  revalidatePath(`/app/vendors/bookings/${payment.bookingId}`);
  return {};
}
