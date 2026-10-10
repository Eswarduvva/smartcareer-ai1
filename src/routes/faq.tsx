import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, publicHead } from "@/components/PublicLayout";

const QA = [
  ["Is SmartCareer free for students?", "Pricing depends on your institution's arrangement. Contact us for details."],
  ["How are careers recommended?", "SmartCareer uses rule-based career recommendation: your skill scores are compared with the key skills of five career tracks. It is not AI and does not guarantee outcomes."],
  ["Which careers are covered?", "Software Developer, Data Analyst, Data Scientist, UI/UX Designer and Cloud/DevOps Engineer."],
  ["Do I need an account?", "Yes. Sign up to save your profile and roadmap progress to your account so it is available on any device."],
  ["Who can see my profile?", "Only you can see the profile you enter. Mentors see only students assigned to them, and administrators manage the platform."],
  ["How do I become a mentor?", "Every new account starts as a student. An administrator assigns mentor roles."],
  ["Can I change my answers?", "Yes. Open My Profile at any time; results update immediately."],
  ["How do I reset my password?", "Use “Forgot password” on the sign-in page and follow the email link."],
] as const;

export const Route = createFileRoute("/faq")({
  head: () => publicHead("FAQ", "Answers to common questions about SmartCareer accounts, recommendations and privacy."),
  component: () => (
    <PublicLayout eyebrow="FAQ" title="Frequently asked questions">
      <div className="divide-y divide-border border-y border-border">
        {QA.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="cursor-pointer list-none text-base text-foreground marker:hidden">
              <span className="mr-3 inline-block font-mono text-gold transition-transform group-open:rotate-45">+</span>{q}
            </summary>
            <p className="mt-2 pl-7 text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
      <p className="text-muted-foreground">Still have a question? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.</p>
    </PublicLayout>
  ),
});
