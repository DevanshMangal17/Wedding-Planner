"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { generateTaskBlueprints, resolveDueDate } from "@/ai/taskGenerator";
import { generatePlanSummary, suggestBudgetAllocation } from "@/ai/weddingPlanner";

export interface OnboardingActionResult {
  error?: string;
}

export async function previewPlanAction(input: OnboardingInput) {
  await requireSession();
  const weddingDate = new Date(input.weddingDate);
  const summary = await generatePlanSummary({
    brideName: input.brideName,
    groomName: input.groomName,
    city: input.city,
    weddingDateLabel: weddingDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    guestCount: input.guestCount,
    budgetTotal: input.budgetTotal,
    functionNames: input.functionNames,
  });
  const allocation = suggestBudgetAllocation(input.budgetTotal);
  const taskCount = generateTaskBlueprints({
    weddingDate,
    guestCount: input.guestCount,
    functionNames: input.functionNames,
    religion: input.religion,
    outstationGuestPct: input.outstationGuestPct,
    needsAccommodation: input.needsAccommodation,
    needsTransportation: input.needsTransportation,
    multiCity: input.multiCity,
    existingVendorCategories: (input.existingVendors ?? []).map((v) => v.category.toUpperCase()),
  }).length;
  return { summary, allocation, taskCount };
}

function slugify(bride: string, groom: string) {
  const base = `${bride}-${groom}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

export async function createWeddingFromOnboarding(input: OnboardingInput): Promise<OnboardingActionResult> {
  const session = await requireSession();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const weddingDate = new Date(data.weddingDate);
  if (Number.isNaN(weddingDate.getTime())) return { error: "Enter a valid wedding date" };

  const wedding = await db.wedding.create({
    data: {
      slug: slugify(data.brideName, data.groomName),
      brideName: data.brideName,
      groomName: data.groomName,
      city: data.city,
      weddingDate,
      guestCount: data.guestCount,
      budgetTotal: data.budgetTotal,
      stage: "PLANNING",
      religion: data.religion,
      traditions: data.traditions ? JSON.stringify(data.traditions) : null,
      style: data.style,
      colorTheme: data.colorTheme,
      cuisinePrefs: data.cuisinePrefs ? JSON.stringify(data.cuisinePrefs) : null,
      photographyStyle: data.photographyStyle,
      decorStyle: data.decorStyle,
      makeupPrefs: data.makeupPrefs,
      entertainmentPrefs: data.entertainmentPrefs,
      outstationGuestPct: data.outstationGuestPct ?? 0,
      needsAccommodation: data.needsAccommodation ?? false,
      needsTransportation: data.needsTransportation ?? false,
      multiCity: data.multiCity ?? false,
      ownerId: session.user.id,
    },
  });

  await db.weddingMember.createMany({
    data: [
      { weddingId: wedding.id, userId: session.user.id, name: data.brideName, role: "BRIDE" },
      { weddingId: wedding.id, name: data.groomName, role: "GROOM" },
    ],
  });

  const functionRecords = await Promise.all(
    data.functionNames.map((name, i) =>
      db.weddingFunction.create({
        data: {
          weddingId: wedding.id,
          name,
          date: new Date(weddingDate.getTime() + (i - (data.functionNames.length - 2)) * 86400000),
          guestCount: data.guestCount,
        },
      }),
    ),
  );

  const existingVendorCategories = (data.existingVendors ?? []).map((v) => v.category.toUpperCase());
  const blueprints = generateTaskBlueprints({
    weddingDate,
    guestCount: data.guestCount,
    functionNames: data.functionNames,
    religion: data.religion,
    outstationGuestPct: data.outstationGuestPct,
    needsAccommodation: data.needsAccommodation,
    needsTransportation: data.needsTransportation,
    multiCity: data.multiCity,
    existingVendorCategories,
  });

  await db.weddingTask.createMany({
    data: blueprints.map((bp) => ({
      weddingId: wedding.id,
      title: bp.title,
      category: bp.category,
      description: bp.description,
      phase: bp.phase,
      dueDate: resolveDueDate(weddingDate, bp.phase),
      priority: bp.priority,
      functionId: functionRecords.find((f) => f.name === bp.functionName)?.id,
    })),
  });

  await db.notification.create({
    data: {
      weddingId: wedding.id,
      userId: session.user.id,
      title: "Your wedding control tower is ready",
      body: `We generated a ${blueprints.length}-item checklist for ${data.brideName} & ${data.groomName}'s wedding.`,
      severity: "INFO",
    },
  });

  redirect("/app/home");
}
