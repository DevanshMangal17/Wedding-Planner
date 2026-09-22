import Link from "next/link";
import { Truck, MessageSquare, Siren, UserRound, LogOut } from "lucide-react";
import { logoutAction } from "@/server/actions/logout";

const links = [
  { href: "/app/logistics", label: "Logistics", icon: Truck },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/sos", label: "Wedding SOS", icon: Siren },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-md space-y-2">
      <h1 className="font-heading mb-4 text-2xl font-medium">More</h1>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
      <form action={logoutAction}>
        <button className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent">
          <LogOut className="size-4" /> Log out
        </button>
      </form>
    </div>
  );
}
