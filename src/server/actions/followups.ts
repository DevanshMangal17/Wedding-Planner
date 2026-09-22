"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { draftFollowUpMessage } from "@/ai/followUpAgent";
import { formatDate } from "@/lib/labels";

export async function sendFollowUpAction(bookingId: string, milestoneId: string) {
  const session = await requireSession();
  const booking = await db.vendorBooking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { wedding: true, vendor: true },
  });
  if (booking.wedding.ownerId !== session.user.id) return { error: "Not found" };
  const milestone = await db.vendorMilestone.findUniqueOrThrow({ where: { id: milestoneId } });

  const body = await draftFollowUpMessage({
    coupleNames: `${booking.wedding.brideName} & ${booking.wedding.groomName}`,
    weddingDate: formatDate(booking.wedding.weddingDate),
    vendorContactName: booking.vendor.contactName.split(" ")[0],
    milestoneTitle: milestone.title,
  });

  await db.message.create({
    data: { weddingId: booking.weddingId, bookingId: booking.id, direction: "OUTBOUND", body, aiGenerated: true },
  });

  const existingFollowUp = await db.followUp.findFirst({ where: { bookingId: booking.id, milestoneId } });
  if (existingFollowUp) {
    await db.followUp.update({ where: { id: existingFollowUp.id }, data: { status: "SENT" } });
  } else {
    await db.followUp.create({
      data: {
        weddingId: booking.weddingId,
        bookingId: booking.id,
        milestoneId,
        reason: `${milestone.title} follow-up`,
        status: "SENT",
        dueDate: new Date(),
      },
    });
  }

  revalidatePath("/app/messages");
  revalidatePath(`/app/vendors/bookings/${bookingId}`);
  return { message: body };
}

export async function ignoreFollowUpAction(followUpId: string) {
  const session = await requireSession();
  const followUp = await db.followUp.findUniqueOrThrow({ where: { id: followUpId }, include: { wedding: true } });
  if (followUp.wedding.ownerId !== session.user.id) return { error: "Not found" };

  await db.followUp.update({ where: { id: followUpId }, data: { status: "IGNORED" } });
  revalidatePath("/app/messages");
  return {};
}
