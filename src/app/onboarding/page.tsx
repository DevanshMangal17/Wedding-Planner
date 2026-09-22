import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const session = await requireSession();
  const existing = await db.wedding.findFirst({ where: { ownerId: session.user.id } });
  if (existing) redirect("/app/home");

  return (
    <div className="min-h-screen bg-background">
      <OnboardingFlow userName={session.user.name ?? "there"} />
    </div>
  );
}
