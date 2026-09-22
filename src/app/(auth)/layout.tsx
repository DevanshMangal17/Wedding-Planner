import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="font-heading mb-8 text-2xl font-semibold tracking-tight">
        Shehnai
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
