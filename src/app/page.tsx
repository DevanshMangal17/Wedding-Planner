import Link from "next/link";
import {
  ArrowRight,
  Radar,
  MessageSquareText,
  Wallet,
  Truck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const capabilities = [
  {
    icon: Radar,
    title: "One control tower, every vendor",
    body: "Venue, caterer, decorator, photographer and a dozen more — tracked in one place instead of a dozen chat threads.",
  },
  {
    icon: MessageSquareText,
    title: "Follow-ups that don't wait on you",
    body: "When a vendor goes quiet, we detect it, draft the nudge, and escalate to backups if they don't respond.",
  },
  {
    icon: Wallet,
    title: "Payments tied to milestones",
    body: "Every rupee is linked to a deliverable — so vendors stay accountable and you always know what's actually due.",
  },
  {
    icon: Truck,
    title: "Logistics, tracked end to end",
    body: "Guests, gifts, outfits, decor material — know what's moving, where, and whether it's on time.",
  },
  {
    icon: ShieldAlert,
    title: "Wedding SOS",
    body: "A vendor cancels the night before? Get vetted replacements with trade-offs explained, in minutes.",
  },
  {
    icon: Sparkles,
    title: "AI that recommends, you decide",
    body: "Every consequential action — booking, payment, cancellation — is proposed by AI and confirmed by you.",
  },
];

const steps = [
  { n: "01", title: "Tell us about your wedding", body: "A short conversation, not a form. Date, city, guests, budget, culture, style." },
  { n: "02", title: "Get a plan and a checklist", body: "A personalised timeline and task list, generated from your specifics — not a generic template." },
  { n: "03", title: "We run point on vendors", body: "Matching, comparison, follow-ups and milestones — you approve, we handle the coordination." },
  { n: "04", title: "Stay ahead, not behind", body: "One control tower shows what's on track, what needs attention, and what we're already doing about it." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
            Shehnai
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Button variant="ghost" nativeButton={false} render={<Link href="/pricing" />}>
              Pricing
            </Button>
            <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
              Log in
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>Plan My Wedding</Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <Badge variant="secondary" className="mb-6 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
          Your AI Wedding Operations Manager
        </Badge>
        <h1 className="font-heading mx-auto max-w-3xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Your wedding deserves memories, not management.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Your AI Wedding Operations Manager coordinates vendors, tasks, payments and logistics — so you don&apos;t have to.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2" nativeButton={false} render={<Link href="/signup" />}>
            Plan My Wedding <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="#how-it-works" />}>
            See How It Works
          </Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-medium sm:text-3xl">
              Not another vendor marketplace.
            </h2>
            <p className="mt-4 text-muted-foreground">
              A marketplace says <em>&ldquo;here are vendors.&rdquo;</em> We say: here&apos;s what needs to happen,
              who needs to do it, whether they&apos;re doing it, and what we&apos;ll do if they don&apos;t.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-heading text-center text-2xl font-medium sm:text-3xl">How it works</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="font-heading text-3xl text-gold">{s.n}</div>
              <h3 className="mt-3 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button size="lg" className="gap-2" nativeButton={false} render={<Link href="/signup" />}>
            Plan My Wedding <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          Shehnai — a wedding operations prototype. All vendor listings are demo data.
        </div>
      </footer>
    </div>
  );
}
