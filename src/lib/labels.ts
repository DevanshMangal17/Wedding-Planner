import type { TaskPhase, TaskStatus, TaskPriority, BookingStatus, MilestoneStatus, PaymentStatus, LogisticsStatus, VendorCategory } from "@prisma/client";

export const PHASE_LABELS: Record<TaskPhase, string> = {
  SIX_MONTHS_BEFORE: "6 Months Before",
  THREE_MONTHS_BEFORE: "3 Months Before",
  ONE_MONTH_BEFORE: "1 Month Before",
  ONE_WEEK_BEFORE: "1 Week Before",
  WEDDING_DAY: "Wedding Day",
  POST_WEDDING: "Post-Wedding",
};

export const PHASE_ORDER: TaskPhase[] = [
  "SIX_MONTHS_BEFORE",
  "THREE_MONTHS_BEFORE",
  "ONE_MONTH_BEFORE",
  "ONE_WEEK_BEFORE",
  "WEDDING_DAY",
  "POST_WEDDING",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  WAITING_VENDOR: "Waiting on vendor",
  COMPLETED: "Completed",
  AT_RISK: "At risk",
  DELAYED: "Delayed",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "WAITING_VENDOR",
  "AT_RISK",
  "DELAYED",
  "COMPLETED",
];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  REQUIREMENT_CONFIRMED: "Requirement confirmed",
  QUOTATION_REQUESTED: "Quotation requested",
  QUOTATION_RECEIVED: "Quotation received",
  NEGOTIATION: "Negotiation",
  FINAL_QUOTE: "Final quote",
  CONTRACT: "Contract",
  ADVANCE_PAID: "Advance paid",
  CONFIRMED: "Booking confirmed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "REQUIREMENT_CONFIRMED",
  "QUOTATION_REQUESTED",
  "QUOTATION_RECEIVED",
  "NEGOTIATION",
  "FINAL_QUOTE",
  "CONTRACT",
  "ADVANCE_PAID",
  "CONFIRMED",
];

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PENDING: "Pending",
  ON_TRACK: "On track",
  OVERDUE: "Overdue",
  RECEIVED: "Received",
  COMPLETED: "Completed",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  DUE: "Due",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

export const LOGISTICS_STATUS_LABELS: Record<LogisticsStatus, string> = {
  PLANNED: "Planned",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
};

export const LOGISTICS_STATUS_ORDER: LogisticsStatus[] = ["PLANNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "DELAYED"];

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  VENUE: "Venue",
  PHOTOGRAPHER: "Photographer",
  VIDEOGRAPHER: "Videographer",
  DECORATOR: "Decorator",
  CATERER: "Caterer",
  MAKEUP: "Makeup",
  MEHENDI: "Mehendi",
  JEWELLERY: "Jewellery",
  INVITATIONS: "Invitations",
  TRANSPORTATION: "Transportation",
  ACCOMMODATION: "Accommodation",
  ENTERTAINMENT: "Entertainment",
  PRIEST: "Priest",
  FLORIST: "Florist",
};

export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export type Tone = "default" | "success" | "warning" | "danger";

export function taskStatusTone(status: TaskStatus): Tone {
  if (status === "COMPLETED") return "success";
  if (status === "DELAYED" || status === "AT_RISK") return "danger";
  if (status === "WAITING_VENDOR") return "warning";
  return "default";
}

export function milestoneStatusTone(status: MilestoneStatus): Tone {
  if (status === "COMPLETED" || status === "RECEIVED") return "success";
  if (status === "OVERDUE") return "danger";
  return "default";
}

export function paymentStatusTone(status: PaymentStatus): Tone {
  if (status === "PAID") return "success";
  if (status === "OVERDUE") return "danger";
  if (status === "DUE") return "warning";
  return "default";
}

export function logisticsStatusTone(status: LogisticsStatus): Tone {
  if (status === "DELIVERED") return "success";
  if (status === "DELAYED") return "danger";
  if (status === "IN_TRANSIT") return "warning";
  return "default";
}
