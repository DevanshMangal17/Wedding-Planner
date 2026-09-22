"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, Clock, Plane, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/dashboard/match-score";
import { formatINR } from "@/lib/labels";
import type { ScoredVendor } from "@/server/queries/vendors";

export function VendorGrid({ scored }: { scored: ScoredVendor[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map(({ vendor, match }) => (
          <div key={vendor.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-xl">{vendor.imageEmoji}</div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Checkbox checked={selected.includes(vendor.id)} onCheckedChange={() => toggle(vendor.id)} />
                Compare
              </label>
            </div>

            <h3 className="mt-3 font-medium">{vendor.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {vendor.city}
              </span>
              <span className="flex items-center gap-1">
                <Star className="size-3 fill-current text-gold" /> {vendor.rating.toFixed(1)} ({vendor.reviewCount})
              </span>
            </div>
            {vendor.isPanIndia ? (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-gold-foreground">
                <Plane className="size-3" /> Travels pan-India
              </p>
            ) : (
              match.distanceKm !== null &&
              match.distanceKm > 0 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Navigation className="size-3" /> {match.distanceKm} km from your wedding city
                </p>
              )
            )}
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{vendor.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(JSON.parse(vendor.styleTags) as string[]).slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px] font-normal">
                  {tag}
                </Badge>
              ))}
              {vendor.isDemo && (
                <Badge variant="secondary" className="text-[11px] font-normal">
                  Demo Vendor
                </Badge>
              )}
              {!match.meetsCapacity && (
                <Badge variant="destructive" className="text-[11px] font-normal">
                  Too small for your guest count
                </Badge>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {formatINR(vendor.priceMin)}–{formatINR(vendor.priceMax)}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" /> responds in ~{vendor.avgResponseHours}h
                </p>
              </div>
              <MatchScore score={match.score} size="sm" />
            </div>

            <Button variant="outline" size="sm" className="mt-4" nativeButton={false} render={<Link href={`/app/vendors/${vendor.id}`} />}>
              View & compare
            </Button>
          </div>
        ))}
      </div>

      {scored.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No vendors in this category yet.
        </p>
      )}

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center md:bottom-6">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
            <span className="text-sm">{selected.length} selected</span>
            <Button
              size="sm"
              disabled={selected.length < 2}
              onClick={() => router.push(`/app/vendors/compare?ids=${selected.join(",")}`)}
            >
              Compare
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
