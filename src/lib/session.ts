import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Every authenticated page/action needs this pair — the real access check
 * lives here, not in proxy.ts, since Proxy is optimistic-only in Next 16. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireWedding() {
  const session = await requireSession();
  const wedding = await db.wedding.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!wedding) redirect("/onboarding");
  return { session, wedding };
}

export async function getOwnedWeddingOrThrow(weddingId: string, userId: string) {
  const wedding = await db.wedding.findFirst({ where: { id: weddingId, ownerId: userId } });
  if (!wedding) throw new Error("Wedding not found or not owned by this user");
  return wedding;
}
