import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { getControlTowerData } from "@/server/queries/controlTower";
import { formatINR, formatDate } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { CalendarClock, Wallet, AlertTriangle, Store, Bell } from "lucide-react";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { wedding } = await requireWedding();
  const data = await getControlTowerData(wedding.id);
  const functions = await db.weddingFunction.findMany({ where: { weddingId: wedding.id }, orderBy: { date: "asc" } });
  const members = await db.weddingMember.findMany({ where: { weddingId: wedding.id } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium">
          {wedding.brideName.toUpperCase()} & {wedding.groomName.toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {wedding.city} · {formatDate(wedding.weddingDate)} · {wedding.guestCount} guests · {formatINR(wedding.budgetTotal)} budget ·{" "}
          {functions.length} function{functions.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Planning completion" value={`${data.readinessPct}%`} icon={CalendarClock} />
        <StatCard label="Budget utilisation" value={`${data.budgetPct}%`} icon={Wallet} />
        <StatCard label="Critical tasks" value={`${data.criticalTasksCount}`} icon={AlertTriangle} tone={data.criticalTasksCount > 0 ? "warning" : "success"} />
        <StatCard label="Vendor confirmations" value={`${data.vendorConfirmed} / ${data.vendorTotal}`} icon={Store} />
        <StatCard label="Upcoming deadlines" value={`${data.upcoming.length}`} icon={Bell} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Functions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {functions.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 text-sm">
              <span className="font-medium">{f.name}</span>
              <span className="text-muted-foreground">{formatDate(f.date)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family & planning team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 text-sm">
              <span>{m.name}</span>
              <span className="text-xs text-muted-foreground">{m.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm wedding={wedding} />
        </CardContent>
      </Card>
    </div>
  );
}
