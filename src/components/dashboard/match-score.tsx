import { cn } from "@/lib/utils";

export function MatchScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const tone = score >= 85 ? "text-success" : score >= 65 ? "text-warning" : "text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 font-medium text-gold-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
      )}
    >
      <span className={tone}>●</span> {score}% match
    </span>
  );
}
