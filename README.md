# Shehnai — Wedding Operations & Vendor Management Platform

> "You plan the wedding. We run the operations."

Shehnai is a prototype **Wedding Control Tower**: an AI-assisted operations layer that coordinates the fragmented wedding vendor supply chain (venue, catering, decor, photography, makeup, logistics, payments...) on behalf of the couple, instead of just listing vendors like a marketplace.

This is a working MVP built to demonstrate the full customer journey end-to-end with seeded demo data — see **Known limitations** below for what's stubbed vs. real.

---

## 1. Running locally

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db (SQLite) and applies the schema
npm run db:seed          # seeds vendors + 7 persona demo weddings (migrate dev also auto-runs this on a fresh DB)
npm run dev              # http://localhost:3000
```

No external services or accounts are required to run the full app locally — see [AI provider](#5-ai-provider) below.

### Environment variables

Copy `.env.example` to `.env` (already done in this checkout) and adjust if needed:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file path, defaults to `file:./dev.db` |
| `AUTH_SECRET` | Yes | Session signing secret for NextAuth. Generate with `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | No | If set, AI copy (match explanations, follow-up messages, plan summaries) is generated live via Claude. If unset, a deterministic mock provider produces the same copy from templates — the app is fully functional either way |

### Database

- **Engine:** SQLite via Prisma (zero-dependency local setup — no external database or account needed to run this app on your own machine).
- **Prisma version:** pinned to `6.19.3`. Prisma 7 (the `latest` npm tag) requires driver adapters and a new `prisma.config.ts` workflow — too much moving-parts risk for an MVP, so we stayed on the well-documented 6.x line.
- Schema: `prisma/schema.prisma`. Seed script: `prisma/seed.ts` (deterministic — re-running it wipes and regenerates all demo data the same way every time).

### Deploying live (optional)

SQLite's local-file approach doesn't survive serverless hosting (Vercel, etc.) — every write would fail once deployed, since there's no persistent disk. Deploying live is possible but requires switching `prisma/schema.prisma`'s datasource to `postgresql` and pointing `DATABASE_URL` at a hosted Postgres instance (Neon and Vercel Postgres are the easiest pairings). This is a deliberate, separate step from local development, not something to do by default — ask if you want to go down that path again.

### Demo credentials

Password for all seven: `demo1234`. Seven personas, not one template — chosen to exercise different guest-count, budget, and geography scenarios rather than seven variations of the same mid-size wedding:

| Email | Wedding | Persona |
|---|---|---|
| `demo1@weddingops.app` | Priya & Dev, Mumbai | Planning, mid-checklist — original control-tower reference case (overdue decorator quotation, upcoming milestones) |
| `demo2@weddingops.app` | Ananya & Karan, Jaipur | Execution, ~18 days out — has an **open Wedding SOS case** (makeup artist cancelled) |
| `demo3@weddingops.app` | Meera & Arjun, Bengaluru | Post-wedding — checklist mostly complete, final payments outstanding |
| `demo4@weddingops.app` | Kavya & Rohan, Udaipur | **Destination wedding** — 85% outstation guests, vendors flown in, heavy accommodation/travel coordination |
| `demo5@weddingops.app` | Naina & Aditya, Bengaluru | **Small & intimate** — 60 guests, two functions, minimal decor |
| `demo6@weddingops.app` | Simran & Yuvraj, Alibaug | **Large outdoor** — 700 guests, five functions, has an **open Wedding SOS case** (caterer backed out) |
| `demo7@weddingops.app` | Ritika & Kabir, Mumbai | **Theme wedding** — vintage-Bollywood theme, a dedicated theme-decor vendor |

You can also sign up as a brand new user from the landing page to go through the conversational onboarding flow from scratch.

---

## 2. Main features implemented

- **Landing page** — premium/warm positioning distinct from a generic vendor marketplace.
- **Auth** — email/password (NextAuth v5, credentials provider, JWT sessions).
- **Conversational onboarding** — progressive chat-style Q&A (not a giant form) that creates the wedding profile and an AI-drafted plan summary + budget allocation preview before you confirm. City is picked from a searchable, state-filterable combobox of ~75 Indian cities (`src/lib/indianCities.ts`), not free text — so it's always a value the matching engine can actually geolocate.
- **Wedding Control Tower (Home)** — overall on-track %, planning/budget/vendor/logistics readiness, upcoming deadlines, and an "attention required" feed computed live from tasks/milestones/payments.
- **Plan** — dynamic checklist generated from wedding date, guest count, functions, religion/culture and existing vendors; grouped by 6-months/3-months/1-month/1-week/wedding-day/post-wedding; status editable inline.
- **Vendors** — seeded catalogue of 41 fictional "Demo Vendor" listings across all 14 categories (including outdoor-estate, beachfront-destination, theme-decor, and 5 pan-India "travels nationwide" specialists); category filter; AI match score with a full breakdown (budget/style/**real distance in km**/availability/reliability/rating) and a plain-English reason; hard capacity filtering (a venue/caterer whose stated capacity can't hold the guest count is excluded from Wedding SOS results and heavily downranked in browse, not just soft-scored); 2–4 way comparison with Best overall / Best value / Best premium summary.
  - **Geographic matching**: location scoring is Haversine distance between the wedding city and each vendor's city (both resolved via the city dataset above), not a flat "same city or not" check — a vendor 40km away clearly outranks one 600km away. Vendors flagged `isPanIndia` skip distance scoring entirely and show "Travels pan-India" instead, so a city with a thin local catalogue (a destination wedding, a smaller town) still surfaces usable options rather than defaulting to whichever seeded vendors happen to exist. Every vendor card, detail page, comparison row, and Wedding SOS option shows the actual distance or pan-India status — never silently hidden.
- **Pricing** (`/pricing`) — a three-tier model (Essentials/Basic, Signature/Pro, Concierge/Pro+), marketing-only, no billing wired up.
- **Booking workflow** — 8-step procurement pipeline (requirement → quotation → negotiation → contract → advance → confirmed) with milestone tracking, simulated vendor messages, and a confirmation dialog before any booking is created (nothing consequential happens without an explicit click).
- **Payments** — milestone-linked payment schedule per booking, budget utilisation tracking, "mark as paid" simulated-payment flow (clearly labeled as simulated, gated behind confirmation).
- **Follow-up agent** — detects genuinely overdue milestones (date-math, not guesswork), drafts a follow-up message, and lets you send it or jump to alternatives.
- **Logistics** — people/materials tracker with status (planned → picked up → in transit → delivered/delayed).
- **Messages** — per-vendor conversation log (simulated) with inline follow-up actions.
- **Wedding SOS** — raise an issue, get 3 labeled alternatives (Premium / Best value / Closest match) with trade-off explanations, compare them, contact all, or book one (with confirmation).
- **AI Assistant** — persistent chat panel answering from live wedding data (tasks due this week, budget status, pending follow-ups, "find me a photographer", etc.) — grounded in real queries, not free-floating chat.
- **Profile** — wedding health summary (planning completion, budget utilisation, critical tasks, vendor confirmations) plus an editable preferences form.

### AI architecture

`src/ai/` contains the domain services (`weddingPlanner`, `vendorMatcher`, `taskGenerator`, `followUpAgent`, `sosAgent`, `assistant`), all going through a single provider abstraction (`src/ai/provider.ts`). Critical logic — task generation rules, vendor match scoring, overdue detection, SOS candidate search — is plain deterministic TypeScript, not an LLM call, so it's reproducible and can't hallucinate a wrong number. The LLM (when `ANTHROPIC_API_KEY` is set) is only ever used to rephrase already-computed facts into warmer prose. Consequential actions (booking, payment, cancellation) always require an explicit confirm click — the AI recommends, you approve, the system executes.

---

## 3. Data model

See `prisma/schema.prisma`. Core entities: `User`, `Wedding`, `WeddingMember`, `WeddingFunction`, `WeddingTask`, `TaskDependency`, `Vendor`, `VendorAvailability`, `VendorBooking`, `VendorMilestone`, `Payment`, `LogisticsItem`, `Guest`, `Message`, `FollowUp`, `SOSCase`, `SOSOption`, `AIRecommendation`, `Notification`, `AuditLog`. `VendorCategory` is modeled as an enum rather than a table — it's a fixed system taxonomy, and an enum gives compile-time safety in the matching engine without a needless join.

---

## 4. Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui on **Base UI** primitives (this shadcn registry uses `@base-ui/react`, not Radix — composition uses a `render={<Element/>}` prop rather than `asChild`) · Prisma 6 + SQLite · NextAuth v5 (credentials/JWT) · Zod · Anthropic SDK (optional).

## 5. AI provider

No API key is required. Set `ANTHROPIC_API_KEY` in `.env` to switch on live Claude-generated copy for match explanations, follow-up message drafts, and plan summaries; without it, the app runs on deterministic templates that produce the same shape of output.

---

## 6. Known limitations

- **City dataset is curated, not exhaustive.** ~75 major Indian cities with hand-entered approximate coordinates, not a geocoding API — good enough for realistic km estimates, not survey-grade. A city typed outside this list (not possible via the picker, but a real gap if free text ever comes back) falls back to "Distance unknown" rather than guessing.
- **Vendor communications are simulated.** No real email/WhatsApp/SMS is sent — `Message` rows are created directly. Clearly labeled as such in the UI.
- **Payments are mocked.** No payment gateway is connected; "mark as paid" just records a `Payment` row and increments the wedding's spent total, behind an explicit confirmation dialog.
- **Milestone "overdue" status doesn't self-update over real time.** It's computed live (correctly) wherever the control tower, assistant, and follow-up logic read it, but the `VendorMilestone.status` column itself is only set at creation/seed time — there's no background job that flips a milestone to `OVERDUE` as its date silently passes between visits. Within a single session everything is consistent; this would need a scheduled job in a real deployment.
- **Single active wedding per account.** A user's dashboard always shows their most recently created wedding; there's no multi-wedding switcher (a planner managing several couples would need one).
- **No document/contract storage, real maps, or calendar integrations** — out of scope for this MVP, called out in the spec as Phase 2/3 work.
- **Auth is intentionally simple** (credentials + JWT, no OAuth/social login, no password reset flow) — sufficient for a prototype, not production-hardened.
- **Optimistic-only route protection.** Next.js 16 deprecated using Proxy (formerly Middleware) as a full session gate — actual authorization happens per-request in each server component/action via `requireSession()`/`requireWedding()`, which is the framework-recommended pattern.

## 7. Business model & event-type expansion

Three team questions — is the demo realistic, what would a subscription actually cost, and should this expand past weddings — are worked through in a separate strategy memo (persona rationale, a pricing/unit-economics model, and a phased feasibility proposal for engagements/baby showers/etc.), shared alongside this repo rather than committed here.

One small piece of that proposal is already shipped: **Engagement** is now a selectable function during onboarding (alongside Mehendi, Haldi, Sangeet, Reception) with its own checklist rules — proof that events *within* an existing wedding need no schema change. Standalone events with no upcoming wedding (a baby shower, an anniversary) would need the `Wedding` model generalised to a proper `Event` with an `eventType` field — a real migration, scoped in the memo rather than done speculatively here.

## 8. Recommended next steps

1. Real vendor communication channel (WhatsApp Business API) behind the existing `Message`/`FollowUp` model — the data model doesn't need to change, just the send-path.
2. A scheduled job to recompute milestone/task "at risk"/"overdue" status server-side instead of only at read time.
3. Real payment gateway (Razorpay/Stripe) behind the existing `Payment` milestone model.
4. Vendor-side portal so vendors can respond to quotation requests directly instead of the couple manually advancing booking status.
5. Multi-wedding support for planners/family members managing more than one wedding.
6. Move from SQLite to Postgres for a live/multi-instance deployment (schema is portable — only the Prisma `datasource` provider and connection string change; see **Deploying live** above).
