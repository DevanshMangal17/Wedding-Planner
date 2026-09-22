import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const TIERS = [
  {
    key: "basic",
    name: "Essentials",
    tagline: "Basic",
    price: "₹999",
    cadence: "/month while planning",
    description: "For couples who want the checklist and vendor matching without the full ops layer.",
    features: [
      "AI wedding plan & dynamic checklist",
      "Vendor discovery with AI match scores",
      "Compare up to 2 vendors at a time",
      "Manual payment & budget tracking",
      "1 active wedding profile",
    ],
    cta: "Start with Essentials",
    highlight: false,
  },
  {
    key: "pro",
    name: "Signature",
    tagline: "Pro",
    price: "₹2,999",
    cadence: "/month while planning",
    description: "The full control tower — booking workflows, automated follow-ups, and the AI assistant.",
    features: [
      "Everything in Essentials",
      "Unlimited vendor comparison",
      "Full booking workflow & milestone tracking",
      "Automated vendor follow-up agent",
      "Logistics tracker (guests & materials)",
      "AI assistant, unlimited queries",
      "Wedding SOS — up to 2 cases",
    ],
    cta: "Start with Signature",
    highlight: true,
  },
  {
    key: "proplus",
    name: "Concierge",
    tagline: "Pro+",
    price: "₹5,999",
    cadence: "/month while planning",
    description: "For destination, large-scale, or high-stakes weddings that need a safety net.",
    features: [
      "Everything in Signature",
      "Unlimited Wedding SOS",
      "Dedicated backup ops manager (human)",
      "Destination / multi-city logistics coordination",
      "Guest travel & accommodation concierge",
      "Priority vendor response SLA",
      "Post-wedding documentation service",
    ],
    cta: "Start with Concierge",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
            Shehnai
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>Plan My Wedding</Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
          One control tower, priced for how long you actually need it.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Billed monthly for as long as you&apos;re actively planning — not a lifetime subscription. Cancel any
          time; most couples run this for 4–8 months.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={
                tier.highlight
                  ? "flex flex-col rounded-2xl border-2 border-gold bg-card p-6 shadow-md"
                  : "flex flex-col rounded-2xl border border-border bg-card p-6"
              }
            >
              {tier.highlight && (
                <span className="mb-3 inline-block w-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold-foreground">
                  Most popular
                </span>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tier.tagline}</p>
              <h2 className="font-heading mt-1 text-2xl font-medium">{tier.name}</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-medium">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6" variant={tier.highlight ? "default" : "outline"} nativeButton={false} render={<Link href="/signup" />}>
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          This is a prototype pricing page — no billing is connected. All plans currently behave identically in this
          demo.
        </p>
      </section>
    </div>
  );
}
