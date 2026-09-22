import Link from "next/link";
import { requireWedding } from "@/lib/session";
import { getAllVendorsScored, getVendorsForCategory } from "@/server/queries/vendors";
import { VENDOR_CATEGORY_LABELS } from "@/lib/labels";
import { VendorGrid } from "./vendor-grid";
import { cn } from "@/lib/utils";
import type { VendorCategory } from "@prisma/client";

export default async function VendorsPage({ searchParams }: PageProps<"/app/vendors">) {
  const { wedding } = await requireWedding();
  const params = await searchParams;
  const category = typeof params.category === "string" ? (params.category as VendorCategory) : undefined;

  const scored = category ? await getVendorsForCategory(wedding, category) : await getAllVendorsScored(wedding);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Find & book vendors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Matched to {wedding.brideName} & {wedding.groomName}&apos;s budget, style, date and location.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/vendors"
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium",
            !category ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent",
          )}
        >
          All categories
        </Link>
        {(Object.keys(VENDOR_CATEGORY_LABELS) as VendorCategory[]).map((c) => (
          <Link
            key={c}
            href={`/app/vendors?category=${c}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              category === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {VENDOR_CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      <VendorGrid scored={scored} />
    </div>
  );
}
