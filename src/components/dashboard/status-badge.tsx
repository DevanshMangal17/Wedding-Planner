import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/labels";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function StatusBadge({ label, tone = "default" }: { label: string; tone?: Tone }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONE_CLASSES[tone])}>
      {label}
    </span>
  );
}
