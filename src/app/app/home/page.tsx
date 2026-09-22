import Link from "next/link";
import { requireWedding } from "@/lib/session";
import { getControlTowerData } from "@/server/queries/controlTower";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarClock, Wallet, Store, Truck, ArrowRight, Siren } from "lucide-react";

export default async function HomePage() {
  const { wedding } = await requireWedding();
  const data = await getControlTowerData(wedding.id);
  const isPostWedding = wedding.stage === "POST_WEDDING" || wedding.stage === "COMPLETED";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Your Wedding Control Tower</p>
        <div className="mt-1 flex items-baseline gap-3">
          <h1 className="font-heading text-3xl font-medium">{data.overallStatusPct}% on track</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {wedding.brideName} & {wedding.groomName} · {wedding.city}
        </p>
      </div>

      {isPostWedding && (
        <div className="flex items-center justify-between rounded-2xl border border-gold/30 bg-gold-soft p-5">
          <div>
            <p className="text-sm font-medium text-gold-foreground">Congratulations! You&apos;re in the post-wedding phase.</p>
            <p className="text-xs text-gold-foreground/80">Album delivery, final payments, returns and documentation — tracked below.</p>
          </div>
          <Button size="sm" nativeButton={false} render={<Link href="/app/plan" />}>
            View post-wedding checklist
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Planning readiness" value={`${data.readinessPct}%`} icon={CalendarClock} />
        <StatCard
          label="Budget used"
          value={`${data.budgetPct}%`}
          hint={`₹${(data.budgetSpent / 100000).toFixed(1)}L of ₹${(data.budgetTotal / 100000).toFixed(1)}L`}
          icon={Wallet}
          tone={data.budgetStatus === "on_track" ? "success" : "warning"}
        />
        <StatCard label="Vendors confirmed" value={`${data.vendorConfirmed}/${data.vendorTotal}`} icon={Store} />
        <StatCard label="Logistics ready" value={`${data.logisticsReadinessPct}%`} icon={Truck} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing urgent in the next two weeks.</p>
            )}
            {data.upcoming.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
                <span className="text-sm">{item.label}</span>
                <span className="text-xs font-medium text-muted-foreground">{item.dateLabel}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs your attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attention.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing critical right now — you&apos;re ahead.</p>
            )}
            {data.attention.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 hover:bg-accent/50"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className={item.severity === "critical" ? "text-danger" : "text-warning"}>●</span>
                  {item.text}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-sm font-medium">Your full checklist</p>
            <p className="text-xs text-muted-foreground">Prioritised so you don&apos;t have to guess what matters.</p>
          </div>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/app/plan" />}>
            Open Plan
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-danger/30 bg-danger-soft p-5">
          <div>
            <p className="text-sm font-medium text-danger">A vendor let you down?</p>
            <p className="text-xs text-danger/80">Get vetted replacements in minutes.</p>
          </div>
          <Button variant="destructive" size="sm" className="gap-1.5" nativeButton={false} render={<Link href="/app/sos" />}>
            <Siren className="size-3.5" /> Wedding SOS
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <Progress value={data.readinessPct} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{data.readinessPct}% of your checklist is complete.</p>
      </div>
    </div>
  );
}
