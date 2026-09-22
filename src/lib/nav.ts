import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  Store,
  Wallet,
  Truck,
  MessageSquare,
  UserRound,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/app/home", label: "Home", icon: LayoutDashboard },
  { href: "/app/plan", label: "Plan", icon: ListChecks },
  { href: "/app/vendors", label: "Vendors", icon: Store },
  { href: "/app/payments", label: "Payments", icon: Wallet },
  { href: "/app/logistics", label: "Logistics", icon: Truck },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/app/home", label: "Home", icon: LayoutDashboard },
  { href: "/app/plan", label: "Plan", icon: ListChecks },
  { href: "/app/vendors", label: "Vendors", icon: Store },
  { href: "/app/payments", label: "Payments", icon: Wallet },
];
