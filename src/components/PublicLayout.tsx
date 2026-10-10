import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeSelector } from "./ThemeSelector";

const INFO = [
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/feedback", label: "Feedback" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap justify-between gap-4 border-t border-border px-6 py-8 text-xs text-muted-foreground md:px-12">
      <span>© 2026 SmartCareer · Rule-based career recommendation</span>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/build" className="hover:text-foreground">Build profile</Link>
        <Link to="/me" className="hover:text-foreground">My results</Link>
        {INFO.map((l) => (
          <Link key={l.to} to={l.to} className="hover:text-foreground">{l.label}</Link>
        ))}
      </nav>
    </footer>
  );
}

export function PublicLayout({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-5 md:px-12">
        <Link to="/" className="font-display text-2xl tracking-tight text-foreground">Smart<span className="text-gold-gradient italic">Career</span></Link>
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link to="/how-it-works" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">How it works</Link>
          <Link to="/me" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">My results</Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
          <ThemeSelector />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="h-px w-6 bg-gold" />{eyebrow}</p>
        <h1 className="mb-4 text-3xl tracking-tight md:text-[2.8rem] md:leading-[1.05]">{title}</h1>
        {intro && <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>}
        <div className="space-y-8 text-sm leading-relaxed">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

/** Visible marker for details the owner must still supply. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="rounded border border-dashed border-gap/60 bg-gap-soft/30 px-1.5 py-0.5 font-mono text-[11px] text-foreground">[{children}]</span>;
}

export function publicHead(title: string, description: string) {
  const t = `${title} — SmartCareer`;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
