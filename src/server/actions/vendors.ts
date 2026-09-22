"use server";

import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { requireSession, getOwnedWeddingOrThrow } from "@/lib/session";
import { getMilestoneTemplates, getPaymentTemplates } from "@/lib/bookingTemplates";
import { buildMatchCriteria } from "@/server/queries/vendors";
import { scoreVendor } from "@/ai/vendorMatcher";
import { BOOKING_STATUS_ORDER } from "@/lib/labels";
import type { BookingStatus } from "@prisma/client";

export async function startBookingAction(weddingId: string, vendorId: string) {
  const session = await requireSession();
  const wedding = await getOwnedWeddingOrThrow(weddingId, session.user.id);
  const vendor = await db.vendor.findUniqueOrThrow({ where: { id: vendorId } });

  const existing = await db.vendorBooking.findFirst({
    where: { weddingId, vendorId, status: { not: "CANCELLED" } },
  });
  if (existing) return { bookingId: existing.id };

  const availability = await db.vendorAvailability.findMany({ where: { vendorId } });
  const criteria = buildMatchCriteria(wedding, vendor.category);
  const match = scoreVendor(vendor, availability, criteria);
  const quotedAmount = Math.round((vendor.priceMin + vendor.priceMax) / 2);

  const booking = await db.vendorBooking.create({
    data: {
      weddingId,
      vendorId,
      category: vendor.category,
      status: "REQUIREMENT_CONFIRMED",
      quotedAmount,
      matchScore: match.score,
      matchBreakdown: JSON.stringify(match.breakdown),
      matchReason: match.reason,
    },
  });

  const now = new Date();
  for (const mt of getMilestoneTemplates(vendor.category)) {
    await db.vendorMilestone.create({
      data: { bookingId: booking.id, title: mt.title, expectedDate: addDays(now, mt.offsetDays), status: "ON_TRACK" },
    });
  }
  for (const pt of getPaymentTemplates(vendor.category)) {
    await db.payment.create({
      data: {
        weddingId,
        bookingId: booking.id,
        milestoneLabel: pt.label,
        amount: Math.round(quotedAmount * pt.pct),
        dueDate: addDays(now, pt.offsetDays),
        status: "PENDING",
      },
    });
  }
  await db.message.create({
    data: {
      weddingId,
      bookingId: booking.id,
      direction: "OUTBOUND",
      body: `Hi ${vendor.contactName.split(" ")[0]}, we'd like to confirm ${vendor.name} for our wedding. Could you share your quotation?`,
      aiGenerated: false,
    },
  });

  revalidatePath("/app/vendors");
  revalidatePath("/app/payments");
  return { bookingId: booking.id };
}

export async function advanceBookingStatusAction(bookingId: string) {
  const session = await requireSession();
  const booking = await db.vendorBooking.findUniqueOrThrow({ where: { id: bookingId }, include: { wedding: true } });
  if (booking.wedding.ownerId !== session.user.id) return { error: "Not found" };

  const idx = BOOKING_STATUS_ORDER.indexOf(booking.status);
  const next = BOOKING_STATUS_ORDER[idx + 1] as BookingStatus | undefined;
  if (!next) return { error: "Already at final step" };

  await db.vendorBooking.update({ where: { id: booking.id }, data: { status: next } });

  if (next === "CONFIRMED") {
    await db.notification.create({
      data: {
        weddingId: booking.weddingId,
        title: "Vendor booking confirmed",
        body: `Booking confirmed.`,
        severity: "INFO",
      },
    });
  }

  revalidatePath(`/app/vendors/bookings/${bookingId}`);
  revalidatePath("/app/vendors");
  revalidatePath("/app/home");
  return {};
}

export async function cancelBookingAction(bookingId: string) {
  const session = await requireSession();
  const booking = await db.vendorBooking.findUniqueOrThrow({ where: { id: bookingId }, include: { wedding: true } });
  if (booking.wedding.ownerId !== session.user.id) return { error: "Not found" };

  await db.vendorBooking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  revalidatePath("/app/vendors");
  return {};
}
