import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { NewSOSDialog } from "./new-sos-dialog";
import { SOSCaseCard } from "./sos-case-card";

export default async function SOSPage() {
  const { wedding } = await requireWedding();
  const cases = await db.sOSCase.findMany({
    where: { weddingId: wedding.id },
    include: { options: { include: { vendor: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">Wedding SOS</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            A vendor let you down? Tell us what happened — we&apos;ll search vetted replacements, explain the
            trade-offs, and let you decide.
          </p>
        </div>
        <NewSOSDialog weddingId={wedding.id} />
      </div>

      <div className="space-y-4">
        {cases.map((c) => (
          <SOSCaseCard key={c.id} sosCase={c} />
        ))}
        {cases.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active issues. If a vendor cancels or goes quiet, raise it here and we&apos;ll take it from there.
          </p>
        )}
      </div>
    </div>
  );
}
