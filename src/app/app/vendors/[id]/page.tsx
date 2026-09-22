import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Clock, ShieldCheck, Plane, Navigation } from "lucide-react";
import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { buildMatchCriteria } from "@/server/queries/vendors";
import { scoreVendor, explainMatch } from "@/ai/vendorMatcher";
import { formatINR, VENDOR_CATEGORY_LABELS } from "@/lib/labels";
import { MatchScore } from "@/components/dashboard/match-score";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookVendorButton } from "./book-vendor-button";

export default async function VendorDetailPage({ params }: PageProps<"/app/vendors/[id]">) {
  const { id } = await params;
  const { wedding } = await requireWedding();
  const vendor = await db.vendor.findUnique({ where: { id } });
  if (!vendor) notFound();

  const availability = await db.vendorAvailability.findMany({ where: { vendorId: vendor.id } });
  const criteria = buildMatchCriteria(wedding, vendor.category);
  const match = scoreVendor(vendor, availability, criteria);
  const reason = await explainMatch(vendor, match);

  const existingBooking = await db.vendorBooking.findFirst({
    where: { weddingId: wedding.id, vendorId: vendor.id, status: { not: "CANCELLED" } },
  });

  const styleTags: string[] = JSON.parse(vendor.styleTags);
  const services: { name: string; price: number }[] = JSON.parse(vendor.services);
  const breakdown = [
    { label: "Budget fit", value: match.breakdown.budgetFit },
    { label: "Style fit", value: match.breakdown.styleFit },
    { label: "Availability", value: match.breakdown.availability },
    { label: "Location", value: match.breakdown.location },
    { label: "Reliability", value: match.breakdown.reliability },
    { label: "Rating", value: match.breakdown.rating },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/vendors" className="text-sm text-muted-foreground hover:underline">
        ← Back to vendors
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-2xl">{vendor.imageEmoji}</div>
            <div>
              <h1 className="font-heading text-2xl font-medium">{vendor.name}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{VENDOR_CATEGORY_LABELS[vendor.category]}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {vendor.city}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-current text-gold" /> {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
        <MatchScore score={match.score} size="lg" />
      </div>

      <div className="flex flex-wrap gap-2">
        {vendor.isDemo && (
          <Badge variant="secondary" className="font-normal">
            Demo Vendor — seeded sample data for this prototype
          </Badge>
        )}
        {vendor.isPanIndia ? (
          <Badge className="gap-1 bg-gold-soft font-normal text-gold-foreground hover:bg-gold-soft">
            <Plane className="size-3" /> Travels pan-India — no fixed home base
          </Badge>
        ) : (
          match.distanceKm !== null &&
          match.distanceKm > 0 && (
            <Badge variant="outline" className="gap-1 font-normal">
              <Navigation className="size-3" />
              {match.distanceKm} km from {wedding.city}
              {match.distanceKm > 300 ? " — confirm travel & stay costs with the vendor" : ""}
            </Badge>
          )
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed">{reason}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {breakdown.map((b) => (
              <div key={b.label}>
                <p className="text-xs text-muted-foreground">{b.label}</p>
                <p className="text-lg font-medium">{b.value}%</p>
                {b.label === "Location" && <p className="text-xs text-muted-foreground">{match.locationLabel}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="text-sm font-medium">About</h3>
            <p className="text-sm text-muted-foreground">{vendor.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {styleTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Reliability score {vendor.reliabilityScore}/100 · {vendor.pastBookings} past bookings
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> Typically responds in ~{vendor.avgResponseHours}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="text-sm font-medium">Services & pricing</h3>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">{formatINR(s.price)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Price range {formatINR(vendor.priceMin)} – {formatINR(vendor.priceMax)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        {existingBooking ? (
          <Button nativeButton={false} render={<Link href={`/app/vendors/bookings/${existingBooking.id}`} />}>View booking</Button>
        ) : (
          <BookVendorButton
            weddingId={wedding.id}
            vendorId={vendor.id}
            vendorName={vendor.name}
            estimatedAmount={Math.round((vendor.priceMin + vendor.priceMax) / 2)}
          />
        )}
      </div>
    </div>
  );
}
