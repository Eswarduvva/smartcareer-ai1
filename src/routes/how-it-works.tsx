import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, publicHead } from "@/components/PublicLayout";

const STEPS = [
  ["Profile", "Five short steps: about you, your skills, experience, career interests and goals.", "/build"],
  ["Skills", "Your 19 skills grouped as technical, reasoning, communication and behaviour — each marked Building, Developing or Strong.", "/me/skills"],
  ["Career Match", "Each of five career tracks is scored against your skills. The best fit comes first, with the reasons shown.", "/me/match"],
  ["Skill Gaps", "Skills below the target for your matched career, ranked High, Medium or Low priority, with what to do next.", "/me/gaps"],
  ["Career Roadmap", "Staged tasks built from your gaps that you can tick off as you progress.", "/me/roadmap"],
] as const;

export const Route = createFileRoute("/how-it-works")({
  head: () => publicHead("How it works", "The SmartCareer student journey: Profile, Skills, Career Match, Skill Gaps and Career Roadmap."),
  component: () => (
    <PublicLayout eyebrow="How it works" title="From profile to roadmap" intro="Profile → Skills → Career Match → Skill Gaps → Career Roadmap. Every result is produced by rule-based career recommendation, so you can see why it was suggested.">
      <ol className="space-y-px border border-border bg-border">
        {STEPS.map(([t, d, to], i) => (
          <li key={t} className="flex gap-5 bg-background p-6">
            <span className="num font-mono text-sm text-gold">0{i + 1}</span>
            <div>
              <h2 className="mb-1 text-lg text-foreground">{t}</h2>
              <p className="text-muted-foreground">{d}</p>
              <Link to={to} className="mt-2 inline-block font-mono text-xs uppercase tracking-wider text-primary hover:underline">Open →</Link>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-muted-foreground">Mentors see the same journey for the students assigned to them and can leave feedback on skills, career choice and roadmap.</p>
    </PublicLayout>
  ),
});
