"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CityPicker } from "@/components/city-picker";
import { createWeddingFromOnboarding, previewPlanAction } from "@/server/actions/onboarding";
import type { OnboardingInput } from "@/lib/validations/onboarding";

interface FormState {
  brideName: string;
  groomName: string;
  city: string;
  weddingDate: string;
  guestCount: string;
  budgetTotal: string;
  functionNames: string[];
  religion: string;
  style: string;
  colorTheme: string;
  cuisinePrefs: string[];
  photographyStyle: string;
  decorStyle: string;
  makeupPrefs: string;
  entertainmentPrefs: string;
  outstationGuestPct: string;
  needsAccommodation: boolean;
  needsTransportation: boolean;
  multiCity: boolean;
  existingVendorsRaw: string;
}

const initialState: FormState = {
  brideName: "",
  groomName: "",
  city: "",
  weddingDate: "",
  guestCount: "200",
  budgetTotal: "2000000",
  functionNames: ["Wedding", "Reception"],
  religion: "Hindu",
  style: "",
  colorTheme: "",
  cuisinePrefs: [],
  photographyStyle: "",
  decorStyle: "",
  makeupPrefs: "",
  entertainmentPrefs: "",
  outstationGuestPct: "20",
  needsAccommodation: false,
  needsTransportation: false,
  multiCity: false,
  existingVendorsRaw: "",
};

const FUNCTION_OPTIONS = ["Engagement", "Mehendi", "Haldi", "Sangeet", "Wedding", "Reception"];
const CUISINE_OPTIONS = ["North Indian", "South Indian", "Rajasthani", "Continental", "Chinese", "Live counters"];
const RELIGION_OPTIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Interfaith", "Other"];

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function OnboardingFlow({ userName }: { userName: string }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<{ summary: string; taskCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const steps = [
    {
      question: `Hi ${userName.split(" ")[0]} — I'm here to help plan the wedding. Let's start with the basics: what are the bride and groom's names?`,
      canContinue: form.brideName.trim().length > 0 && form.groomName.trim().length > 0,
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Bride's name" value={form.brideName} onChange={(e) => set("brideName", e.target.value)} />
          <Input placeholder="Groom's name" value={form.groomName} onChange={(e) => set("groomName", e.target.value)} />
        </div>
      ),
      answerLabel: () => `${form.brideName} & ${form.groomName}`,
    },
    {
      question: "Where and when is the wedding?",
      canContinue: form.city.trim().length > 0 && form.weddingDate.length > 0,
      render: () => (
        <div className="space-y-3">
          <CityPicker value={form.city} onChange={(city) => set("city", city)} />
          <Input type="date" value={form.weddingDate} onChange={(e) => set("weddingDate", e.target.value)} />
        </div>
      ),
      answerLabel: () => `${form.city} · ${form.weddingDate}`,
    },
    {
      question: "Roughly how many guests, and which functions are you planning?",
      canContinue: form.functionNames.length > 0,
      render: () => (
        <div className="space-y-3">
          <Input
            type="number"
            min={1}
            placeholder="Guest count"
            value={form.guestCount}
            onChange={(e) => set("guestCount", e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {FUNCTION_OPTIONS.map((fn) => (
              <button
                key={fn}
                type="button"
                onClick={() => set("functionNames", toggleInArray(form.functionNames, fn))}
                className="focus:outline-none"
              >
                <Badge variant={form.functionNames.includes(fn) ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                  {fn}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      ),
      answerLabel: () => `${form.guestCount} guests · ${form.functionNames.join(", ")}`,
    },
    {
      question: "What's your overall budget for the wedding (in ₹)?",
      canContinue: Number(form.budgetTotal) >= 100000,
      render: () => (
        <Input
          type="number"
          min={100000}
          step={50000}
          placeholder="Total budget"
          value={form.budgetTotal}
          onChange={(e) => set("budgetTotal", e.target.value)}
        />
      ),
      answerLabel: () => `₹${(Number(form.budgetTotal) / 100000).toFixed(1)}L`,
    },
    {
      question: "Any religion or cultural traditions we should plan around?",
      canContinue: true,
      render: () => (
        <div className="flex flex-wrap gap-2">
          {RELIGION_OPTIONS.map((r) => (
            <button key={r} type="button" onClick={() => set("religion", r)} className="focus:outline-none">
              <Badge variant={form.religion === r ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                {r}
              </Badge>
            </button>
          ))}
        </div>
      ),
      answerLabel: () => form.religion || "Not specified",
    },
    {
      question: "What style and colour palette are you dreaming of? And what cuisines matter most?",
      canContinue: true,
      render: () => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Style (e.g. Modern traditional)" value={form.style} onChange={(e) => set("style", e.target.value)} />
            <Input placeholder="Colour theme (e.g. Ivory & Gold)" value={form.colorTheme} onChange={(e) => set("colorTheme", e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <button key={c} type="button" onClick={() => set("cuisinePrefs", toggleInArray(form.cuisinePrefs, c))} className="focus:outline-none">
                <Badge variant={form.cuisinePrefs.includes(c) ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                  {c}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      ),
      answerLabel: () => [form.style, form.colorTheme, form.cuisinePrefs.join(", ")].filter(Boolean).join(" · ") || "Open to suggestions",
    },
    {
      question: "Any preferences for photography, decor, makeup or entertainment?",
      canContinue: true,
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Photography style" value={form.photographyStyle} onChange={(e) => set("photographyStyle", e.target.value)} />
          <Input placeholder="Decor style" value={form.decorStyle} onChange={(e) => set("decorStyle", e.target.value)} />
          <Input placeholder="Makeup preferences" value={form.makeupPrefs} onChange={(e) => set("makeupPrefs", e.target.value)} />
          <Input placeholder="Entertainment preferences" value={form.entertainmentPrefs} onChange={(e) => set("entertainmentPrefs", e.target.value)} />
        </div>
      ),
      answerLabel: () => [form.photographyStyle, form.decorStyle, form.makeupPrefs, form.entertainmentPrefs].filter(Boolean).join(" · ") || "Open to suggestions",
    },
    {
      question: "Will you have outstation guests? Roughly what percentage, and do you need us to plan accommodation or transport for them?",
      canContinue: true,
      render: () => (
        <div className="space-y-3">
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="% outstation guests"
            value={form.outstationGuestPct}
            onChange={(e) => set("outstationGuestPct", e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => set("needsAccommodation", !form.needsAccommodation)} className="focus:outline-none">
              <Badge variant={form.needsAccommodation ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                Need accommodation
              </Badge>
            </button>
            <button type="button" onClick={() => set("needsTransportation", !form.needsTransportation)} className="focus:outline-none">
              <Badge variant={form.needsTransportation ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                Need transportation
              </Badge>
            </button>
            <button type="button" onClick={() => set("multiCity", !form.multiCity)} className="focus:outline-none">
              <Badge variant={form.multiCity ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                Multiple cities
              </Badge>
            </button>
          </div>
        </div>
      ),
      answerLabel: () =>
        `${form.outstationGuestPct}% outstation${form.needsAccommodation ? " · accommodation" : ""}${form.needsTransportation ? " · transport" : ""}${form.multiCity ? " · multi-city" : ""}`,
    },
    {
      question: "Have you already booked any vendors? List them as \"category: name\", one per line — or leave blank.",
      canContinue: true,
      render: () => (
        <Textarea
          placeholder={"Venue: The Ivory Courtyard\nCaterer: Spice Route Catering"}
          value={form.existingVendorsRaw}
          onChange={(e) => set("existingVendorsRaw", e.target.value)}
          rows={4}
        />
      ),
      answerLabel: () => (form.existingVendorsRaw.trim() ? `${form.existingVendorsRaw.trim().split("\n").length} vendor(s) noted` : "None yet"),
    },
  ];

  const isReview = step === steps.length;
  const progressPct = Math.round((step / steps.length) * 100);

  function buildInput(): OnboardingInput {
    return {
      brideName: form.brideName,
      groomName: form.groomName,
      city: form.city,
      weddingDate: form.weddingDate,
      guestCount: Number(form.guestCount),
      budgetTotal: Number(form.budgetTotal),
      functionNames: form.functionNames,
      religion: form.religion,
      style: form.style,
      colorTheme: form.colorTheme,
      cuisinePrefs: form.cuisinePrefs,
      photographyStyle: form.photographyStyle,
      decorStyle: form.decorStyle,
      makeupPrefs: form.makeupPrefs,
      entertainmentPrefs: form.entertainmentPrefs,
      outstationGuestPct: Number(form.outstationGuestPct || 0),
      needsAccommodation: form.needsAccommodation,
      needsTransportation: form.needsTransportation,
      multiCity: form.multiCity,
      existingVendors: form.existingVendorsRaw
        .split("\n")
        .map((line) => line.split(":"))
        .filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim())
        .map(([category, ...rest]) => ({ category: category.trim(), name: rest.join(":").trim() })),
    };
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    // last question answered — move to review, fetch AI preview
    setStep(steps.length);
    startTransition(async () => {
      const result = await previewPlanAction(buildInput());
      setPreview(result);
    });
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await createWeddingFromOnboarding(buildInput());
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <Progress value={isReview ? 100 : progressPct} className="mb-8 h-1.5" />

      <div className="flex-1 space-y-6">
        {steps.slice(0, step).map((s, i) => (
          <div key={i} className="space-y-2">
            <ChatBubble>{s.question}</ChatBubble>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                {s.answerLabel()}
              </div>
            </div>
          </div>
        ))}

        {!isReview && (
          <div className="space-y-4">
            <ChatBubble>{steps[step].question}</ChatBubble>
            <div className="pl-11">{steps[step].render()}</div>
          </div>
        )}

        {isReview && (
          <div className="space-y-4">
            <ChatBubble>Here&apos;s your personalised plan.</ChatBubble>
            <div className="ml-11 rounded-2xl border border-border bg-card p-5">
              {preview ? (
                <>
                  <p className="text-sm leading-relaxed">{preview.summary}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    We&apos;ve drafted a {preview.taskCount}-item checklist and category-wise budget allocation, ready as soon as you confirm.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Drafting your plan...
                </div>
              )}
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || pending}>
          Back
        </Button>
        {!isReview ? (
          <Button onClick={handleNext} disabled={!steps[step].canContinue || pending}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleConfirm} disabled={pending || !preview} className="gap-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Confirm & create my wedding
          </Button>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-foreground">
        <Sparkles className="size-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
