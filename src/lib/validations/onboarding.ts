import { z } from "zod";

export const existingVendorSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
});

export const onboardingSchema = z.object({
  brideName: z.string().min(1, "Required"),
  groomName: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  weddingDate: z.string().min(1, "Required"),
  guestCount: z.coerce.number().int().min(1).max(5000),
  budgetTotal: z.coerce.number().int().min(100000),
  functionNames: z.array(z.string().min(1)).min(1, "Add at least one function"),
  religion: z.string().optional(),
  traditions: z.array(z.string()).optional(),
  style: z.string().optional(),
  colorTheme: z.string().optional(),
  cuisinePrefs: z.array(z.string()).optional(),
  photographyStyle: z.string().optional(),
  decorStyle: z.string().optional(),
  makeupPrefs: z.string().optional(),
  entertainmentPrefs: z.string().optional(),
  outstationGuestPct: z.coerce.number().int().min(0).max(100).optional(),
  needsAccommodation: z.boolean().optional(),
  needsTransportation: z.boolean().optional(),
  multiCity: z.boolean().optional(),
  existingVendors: z.array(existingVendorSchema).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
