import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              tone === "success" && "bg-success-soft text-success",
              tone === "warning" && "bg-warning-soft text-warning",
              tone === "danger" && "bg-danger-soft text-danger",
              tone === "default" && "bg-gold-soft text-gold-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-2 font-heading text-2xl font-medium">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
