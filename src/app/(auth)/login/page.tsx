"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: AuthActionResult = {};

const DEMO_PERSONAS = [
  { email: "demo1@weddingops.app", label: "Mumbai · mid-planning" },
  { email: "demo2@weddingops.app", label: "Jaipur · active SOS case" },
  { email: "demo3@weddingops.app", label: "Bengaluru · post-wedding" },
  { email: "demo4@weddingops.app", label: "Udaipur · destination" },
  { email: "demo5@weddingops.app", label: "Bengaluru · small & intimate" },
  { email: "demo6@weddingops.app", label: "Alibaug · large outdoor" },
  { email: "demo7@weddingops.app", label: "Mumbai · theme wedding" },
];

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to your wedding control tower.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="demo1@weddingops.app" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="demo1234" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
        <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="mb-1.5 font-medium text-foreground/80">Demo logins (password: demo1234)</p>
          <ul className="space-y-0.5">
            {DEMO_PERSONAS.map((p) => (
              <li key={p.email} className="flex justify-between gap-2">
                <span>{p.email}</span>
                <span className="text-right">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
