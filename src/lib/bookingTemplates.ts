import type { VendorCategory } from "@prisma/client";

export interface MilestoneTemplate {
  title: string;
  /** days after booking creation the milestone is expected to be resolved by */
  offsetDays: number;
}

const EXTRA_MILESTONE: Partial<Record<VendorCategory, MilestoneTemplate>> = {
  PHOTOGRAPHER: { title: "Shot list shared", offsetDays: 10 },
  VIDEOGRAPHER: { title: "Shot list shared", offsetDays: 10 },
  CATERER: { title: "Final menu confirmed", offsetDays: 14 },
  DECORATOR: { title: "Mood board approval", offsetDays: 7 },
  MAKEUP: { title: "Trial run", offsetDays: 20 },
  VENUE: { title: "Guest count lock", offsetDays: 30 },
};

export function getMilestoneTemplates(category: VendorCategory): MilestoneTemplate[] {
  const templates: MilestoneTemplate[] = [{ title: "Quotation", offsetDays: 5 }];
  const extra = EXTRA_MILESTONE[category];
  if (extra) templates.push(extra);
  templates.push({ title: "Contract & advance payment", offsetDays: 15 });
  templates.push({ title: "Final confirmation", offsetDays: 25 });
  return templates;
}

export interface PaymentTemplate {
  label: string;
  pct: number; // fraction of the booking's final/quoted amount
  offsetDays: number; // days after booking creation the payment is due
}

const CAMERA_PAYMENTS: PaymentTemplate[] = [
  { label: "Booking advance", pct: 0.2, offsetDays: 15 },
  { label: "Pre-wedding shoot", pct: 0.2, offsetDays: 45 },
  { label: "Wedding day", pct: 0.4, offsetDays: 90 },
  { label: "Album delivery", pct: 0.2, offsetDays: 120 },
];

const DEFAULT_PAYMENTS: PaymentTemplate[] = [
  { label: "Advance", pct: 0.4, offsetDays: 15 },
  { label: "Balance", pct: 0.6, offsetDays: 60 },
];

export function getPaymentTemplates(category: VendorCategory): PaymentTemplate[] {
  if (category === "PHOTOGRAPHER" || category === "VIDEOGRAPHER") return CAMERA_PAYMENTS;
  return DEFAULT_PAYMENTS;
}
