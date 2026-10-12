import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { SiteFooter } from "@/components/PublicLayout";

export function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-5 sm:px-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl text-foreground">Smart<span className="text-gold-gradient italic">Career</span></Link>
          <ThemeSelector />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:px-12 md:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}