"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { Siren } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-2 border-t border-sidebar-border pt-3">
        <Link
          href="/app/sos"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            pathname.startsWith("/app/sos")
              ? "bg-danger text-danger-foreground"
              : "bg-danger-soft text-danger hover:bg-danger hover:text-danger-foreground",
          )}
        >
          <Siren className="size-4" />
          Wedding SOS
        </Link>
      </div>
    </nav>
  );
}
