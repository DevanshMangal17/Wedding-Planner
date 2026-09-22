"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validations/auth";

export interface AuthActionResult {
  error?: string;
}

export async function signupAction(_prev: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Could not sign in after signup." };
    throw error;
  }
  return {};
}

export async function loginAction(_prev: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/app/home",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Incorrect email or password." };
    throw error;
  }
  return {};
}
