import Link from "next/link";
import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { buildMatchCriteria } from "@/server/queries/vendors";
import { scoreVendor } from "@/ai/vendorMatcher";
import { formatINR } from "@/lib/labels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function CompareVendorsPage({ searchParams }: PageProps<"/app/vendors/compare">) {
  const { wedding } = await requireWedding();
  const params = await searchParams;
  const idsParam = typeof params.ids === "string" ? params.ids : "";
  const ids = idsParam.split(",").filter(Boolean);

  const vendors = await db.vendor.findMany({ where: { id: { in: ids } } });
  const availability = await db.vendorAvailability.findMany({ where: { vendorId: { in: ids } } });

  const rows = ids
    .map((id) => vendors.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v))
    .map((vendor) => {
      const criteria = buildMatchCriteria(wedding, vendor.category);
      const match = scoreVendor(vendor, availability.filter((a) => a.vendorId === vendor.id), criteria);
      return { vendor, match };
    });

  if (rows.length < 2) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Select at least 2 vendors from the vendor list to compare.</p>
        <Button nativeButton={false} render={<Link href="/app/vendors" />}>Back to vendors</Button>
      </div>
    );
  }

  const bestOverall = rows.reduce((a, b) => (b.match.score > a.match.score ? b : a));
  const bestValue = rows.reduce((a, b) => (b.vendor.priceMin < a.vendor.priceMin ? b : a));
  const bestPremium = rows.reduce((a, b) => (b.vendor.rating > a.vendor.rating ? b : a));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/vendors" className="text-sm text-muted-foreground hover:underline">
          ← Back to vendors
        </Link>
        <h1 className="font-heading mt-2 text-2xl font-medium">Compare vendors</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Best overall" vendorName={bestOverall.vendor.name} detail={`${bestOverall.match.score}% match`} />
        <SummaryCard label="Best value" vendorName={bestValue.vendor.name} detail={formatINR(bestValue.vendor.priceMin)} />
        <SummaryCard label="Best premium option" vendorName={bestPremium.vendor.name} detail={`${bestPremium.vendor.rating.toFixed(1)}★`} />
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                {rows.map((r) => (
                  <TableHead key={r.vendor.id}>{r.vendor.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground">Match score</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id} className="font-medium">
                    {r.match.score}%
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Price range</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>
                    {formatINR(r.vendor.priceMin)}–{formatINR(r.vendor.priceMax)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Rating</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>
                    {r.vendor.rating.toFixed(1)}★ ({r.vendor.reviewCount})
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Location</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>{r.match.locationLabel}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Style</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>
                    <div className="flex flex-wrap gap-1">
                      {(JSON.parse(r.vendor.styleTags) as string[]).slice(0, 2).map((t) => (
                        <Badge key={t} variant="outline" className="text-[11px] font-normal">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Reliability</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>{r.vendor.reliabilityScore}/100</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Response time</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>~{r.vendor.avgResponseHours}h</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Availability on your date</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>{r.match.breakdown.availability === 100 ? "Available" : "Check with vendor"}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell />
                {rows.map((r) => (
                  <TableCell key={r.vendor.id}>
                    <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/app/vendors/${r.vendor.id}`} />}>
                      View & book
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, vendorName, detail }: { label: string; vendorName: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-gold/30 bg-gold-soft p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gold-foreground/70">{label}</p>
      <p className="mt-1 font-medium text-gold-foreground">{vendorName}</p>
      <p className="text-sm text-gold-foreground/80">{detail}</p>
    </div>
  );
}
