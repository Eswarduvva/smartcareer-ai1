import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeSelector } from "./ThemeSelector";


const FOOTER_COLS = [
  { title: "Quick links", links: [
    { to: "/", label: "Home" }, { to: "/build", label: "Build Profile" }, { to: "/me", label: "My Results" },
    { to: "/me/gaps", label: "Skill Gaps" }, { to: "/me/roadmap", label: "Career Roadmap" }, { to: "/learn", label: "Learning" },
  ] },
  { title: "Portals", links: [
    { to: "/me", label: "Student Portal" }, { to: "/mentor", label: "Mentor / Trainer Portal" }, { to: "/admin", label: "Admin / Owner Portal" },
  ] },
  { title: "Company", links: [
    { to: "/about", label: "About SmartCareer" }, { to: "/how-it-works", label: "How It Works" }, { to: "/contact", label: "Contact Us" },
    { to: "/faq", label: "FAQ" }, { to: "/feedback", label: "Feedback" },
  ] },
] as const;

const linkCls = "text-muted-foreground transition-colors hover:text-gold focus-visible:text-gold outline-none";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 pt-14 pb-8 text-sm md:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.2fr_1fr_1.3fr]">
        <div className="space-y-4">
          <Link to="/" className="font-display text-2xl tracking-tight text-foreground">Smart<span className="text-gold-gradient italic">Career</span></Link>
          <p className="max-w-xs leading-relaxed text-muted-foreground">A career guidance platform using rule-based career recommendation to help students understand their skills, explore suitable career paths, and plan their professional growth.</p>
          <p className="text-xs text-muted-foreground">Operated by Y. Gopi Krishna, Eeswar Duvva and Akhil · Hyderabad, India</p>
        </div>
        {FOOTER_COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="eyebrow mb-4 text-gold">{c.title}</p>
            <ul className="space-y-2.5">
              {c.links.map((l) => <li key={l.label}><Link to={l.to} className={linkCls}>{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
        <nav aria-label="Support and legal">
          <p className="eyebrow mb-4 text-gold">Support &amp; legal</p>
          <ul className="space-y-2.5">
            <li><Link to="/privacy" className={linkCls}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={linkCls}>Terms &amp; Conditions</Link></li>
            <li><a href="mailto:y.gopikrishna0214@gmail.com" className={`${linkCls} break-all`}>y.gopikrishna0214@gmail.com</a></li>
            <li><a href="tel:+917981511588" className={linkCls}>Phone: +91 79815 11588</a></li>
            <li><a href="https://wa.me/919746463687" target="_blank" rel="noopener noreferrer" className={linkCls}>WhatsApp: +91 97464 63687</a></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} SmartCareer. All rights reserved.</span>
        <span>Rule-based career recommendation</span>
      </div>
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
