"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { requireSession, getOwnedWeddingOrThrow } from "@/lib/session";
import { buildMatchCriteria } from "@/server/queries/vendors";
import { findSOSAlternatives } from "@/ai/sosAgent";
import { getMilestoneTemplates, getPaymentTemplates } from "@/lib/bookingTemplates";
import type { VendorCategory } from "@prisma/client";

const createSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(3).max(150),
  description: z.string().min(3).max(1000),
  neededInDays: z.coerce.number().int().min(0).max(60),
});

export async function createSOSCaseAction(weddingId: string, input: unknown) {
  const session = await requireSession();
  await getOwnedWeddingOrThrow(weddingId, session.user.id);
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const sosCase = await db.sOSCase.create({
    data: {
      weddingId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category as VendorCategory,
      neededByDate: addDays(new Date(), parsed.data.neededInDays),
      status: "OPEN",
    },
  });

  revalidatePath("/app/sos");
  return { sosCaseId: sosCase.id };
}

export async function generateSOSOptionsAction(sosCaseId: string) {
  const session = await requireSession();
  const sosCase = await db.sOSCase.findUniqueOrThrow({ where: { id: sosCaseId }, include: { wedding: true } });
  if (sosCase.wedding.ownerId !== session.user.id) return { error: "Not found" };

  const candidates = await db.vendor.findMany({ where: { category: sosCase.category } });
  const availability = await db.vendorAvailability.findMany({ where: { vendorId: { in: candidates.map((v) => v.id) } } });
  const availabilityByVendor = new Map<string, typeof availability>();
  for (const a of availability) {
    availabilityByVendor.set(a.vendorId, [...(availabilityByVendor.get(a.vendorId) ?? []), a]);
  }

  const criteria = { ...buildMatchCriteria(sosCase.wedding, sosCase.category), weddingDate: sosCase.neededByDate };
  const results = findSOSAlternatives(candidates, availabilityByVendor, criteria, 3);

  await db.sOSOption.deleteMany({ where: { sosCaseId } });
  await db.sOSOption.createMany({
    data: results.map((r) => ({
      sosCaseId,
      vendorId: r.vendor.id,
      label: r.label,
      price: r.price,
      reason: r.reason,
    })),
  });
  await db.sOSCase.update({ where: { id: sosCaseId }, data: { status: results.length > 0 ? "OPTIONS_PROVIDED" : "OPEN" } });

  revalidatePath("/app/sos");
  return { count: results.length };
}

export async function bookSOSOptionAction(sosCaseId: string, optionId: string) {
  const session = await requireSession();
  const sosCase = await db.sOSCase.findUniqueOrThrow({ where: { id: sosCaseId }, include: { wedding: true } });
  if (sosCase.wedding.ownerId !== session.user.id) return { error: "Not found" };
  const option = await db.sOSOption.findUniqueOrThrow({ where: { id: optionId }, include: { vendor: true } });

  const booking = await db.vendorBooking.create({
    data: {
      weddingId: sosCase.weddingId,
      vendorId: option.vendorId,
      category: sosCase.category,
      status: "CONFIRMED",
      quotedAmount: option.price,
      finalAmount: option.price,
      matchReason: `Booked via Wedding SOS: ${option.reason}`,
    },
  });

  const now = new Date();
  for (const mt of getMilestoneTemplates(sosCase.category)) {
    await db.vendorMilestone.create({
      data: { bookingId: booking.id, title: mt.title, expectedDate: now, status: "COMPLETED" },
    });
  }
  for (const pt of getPaymentTemplates(sosCase.category)) {
    await db.payment.create({
      data: {
        weddingId: sosCase.weddingId,
        bookingId: booking.id,
        milestoneLabel: pt.label,
        amount: Math.round(option.price * pt.pct),
        dueDate: addDays(now, 2),
        status: "DUE",
      },
    });
  }

  await db.sOSOption.update({ where: { id: optionId }, data: { isSelected: true } });
  await db.sOSCase.update({ where: { id: sosCaseId }, data: { status: "RESOLVED", resolvedAt: now } });
  await db.message.create({
    data: {
      weddingId: sosCase.weddingId,
      bookingId: booking.id,
      direction: "OUTBOUND",
      body: `Hi ${option.vendor.contactName.split(" ")[0]}, confirming your booking as an urgent replacement for ${sosCase.title.toLowerCase()}.`,
      aiGenerated: true,
    },
  });

  revalidatePath("/app/sos");
  revalidatePath("/app/vendors");
  revalidatePath("/app/payments");
  return { bookingId: booking.id };
}

export async function contactAllSOSOptionsAction(sosCaseId: string) {
  const session = await requireSession();
  const sosCase = await db.sOSCase.findUniqueOrThrow({ where: { id: sosCaseId }, include: { wedding: true } });
  if (sosCase.wedding.ownerId !== session.user.id) return { error: "Not found" };
  const options = await db.sOSOption.findMany({ where: { sosCaseId }, include: { vendor: true } });

  for (const o of options) {
    await db.message.create({
      data: {
        weddingId: sosCase.weddingId,
        direction: "OUTBOUND",
        body: `Hi ${o.vendor.contactName.split(" ")[0]}, we have an urgent requirement — ${sosCase.title.toLowerCase()}. Are you available and can you share pricing?`,
        aiGenerated: true,
      },
    });
  }

  revalidatePath("/app/messages");
  return { count: options.length };
}
