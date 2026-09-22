"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_ITEMS } from "@/lib/nav";
import { MoreHorizontal } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-card/95 px-2 py-2 backdrop-blur md:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
      <Link href="/app/more" className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground">
        <MoreHorizontal className="size-5" />
        More
      </Link>
    </nav>
  );
}
