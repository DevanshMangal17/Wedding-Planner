import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package } from "lucide-react";
import { LogisticsStatusSelect } from "./logistics-status-select";
import type { LogisticsItem } from "@prisma/client";

export default async function LogisticsPage() {
  const { wedding } = await requireWedding();
  const items = await db.logisticsItem.findMany({ where: { weddingId: wedding.id }, orderBy: { expectedDate: "asc" } });

  const people = items.filter((i) => i.type === "PEOPLE");
  const materials = items.filter((i) => i.type === "MATERIAL");
  const delivered = items.filter((i) => i.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Logistics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {delivered}/{items.length} items delivered — guests, gifts, outfits and decor material in one place.
        </p>
      </div>

      <Section title="People" icon={Users} items={people} />
      <Section title="Materials" icon={Package} items={materials} />

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No logistics items yet.
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: LogisticsItem[];
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Icon className="size-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">
                {item.originLabel} → {item.destinationLabel} · {item.responsible} · expected {formatDate(item.expectedDate)}
              </p>
            </div>
            <LogisticsStatusSelect itemId={item.id} status={item.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

