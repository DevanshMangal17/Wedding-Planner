import Link from "next/link";
import { requireWedding } from "@/lib/session";
import { SidebarNav } from "@/components/nav/sidebar-nav";
import { MobileNav } from "@/components/nav/mobile-nav";
import { AssistantLauncher } from "@/components/assistant/assistant-launcher";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/server/actions/logout";
import { LogOut } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { wedding } = await requireWedding();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
          <div className="border-b border-sidebar-border px-5 py-5">
            <Link href="/app/home" className="font-heading text-lg font-semibold text-sidebar-foreground">
              Shehnai
            </Link>
            <p className="mt-0.5 text-xs text-sidebar-foreground/60">
              {wedding.brideName} & {wedding.groomName}
            </p>
          </div>
          <SidebarNav />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3 md:px-8">
            <div className="md:hidden">
              <span className="font-heading text-base font-semibold">Shehnai</span>
            </div>
            <div className="hidden text-sm text-muted-foreground md:block">
              {wedding.city} · {new Date(wedding.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <LogOut className="size-4" /> Log out
                </Button>
              </form>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
        </div>
      </div>

      <MobileNav />
      <AssistantLauncher weddingId={wedding.id} />
    </div>
  );
}
