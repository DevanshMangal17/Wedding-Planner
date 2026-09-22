"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { askAssistantAction } from "@/server/actions/assistant";
import type { AssistantAction } from "@/ai/assistant";

interface ChatEntry {
  role: "user" | "assistant";
  text: string;
  actions?: AssistantAction[];
}

const SUGGESTIONS = [
  "What's pending?",
  "Am I overspending?",
  "Follow up with a vendor",
  "Find a backup photographer",
];

export function AssistantLauncher({ weddingId }: { weddingId: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatEntry[]>([
    { role: "assistant", text: "What would you like me to take care of?" },
  ]);
  const [pending, startTransition] = useTransition();

  function send(message: string) {
    if (!message.trim()) return;
    setHistory((h) => [...h, { role: "user", text: message }]);
    setInput("");
    startTransition(async () => {
      const reply = await askAssistantAction(weddingId, message);
      setHistory((h) => [...h, { role: "assistant", text: reply.text, actions: reply.actions }]);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="icon"
            className="fixed bottom-20 right-5 z-40 size-14 rounded-full shadow-lg md:bottom-6"
          />
        }
      >
        <Sparkles className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold" /> AI Assistant
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {history.map((entry, i) => (
            <div key={i} className={entry.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  entry.role === "user"
                    ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-2xl bg-secondary px-4 py-2 text-sm"
                }
              >
                <p>{entry.text}</p>
                {entry.actions && entry.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.actions.map((a) => (
                      <Button
                        key={a.href}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        nativeButton={false} render={<Link href={a.href} onClick={() => setOpen(false)} />}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-secondary px-4 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your wedding..."
            />
            <Button type="submit" size="icon" disabled={pending}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
