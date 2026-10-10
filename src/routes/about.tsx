import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, Section, Placeholder, publicHead } from "@/components/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => publicHead("About", "What SmartCareer is, who it is for and how its rule-based career recommendation works."),
  component: () => (
    <PublicLayout eyebrow="About" title="About SmartCareer" intro="SmartCareer is a student career intelligence platform. It helps students understand their skills, discover careers that fit, and plan the steps to get there.">
      <Section title="What we do">
        <p>Students build a short profile — education, skills, experience, interests and goals. SmartCareer compares it with five career tracks and shows the best match, the skills to strengthen and a staged roadmap.</p>
        <p>Recommendations use transparent, rule-based scoring. They are guidance, not a guarantee of employment or admission.</p>
      </Section>
      <Section title="Who it is for">
        <p><strong className="text-foreground">Students</strong> plan their own path. <strong className="text-foreground">Mentors and trainers</strong> follow the students assigned to them. <strong className="text-foreground">Administrators</strong> manage accounts, roles and the student dataset.</p>
      </Section>
      <Section title="Organisation">
        <p>SmartCareer is operated by <Placeholder>Organisation / owner name</Placeholder>, based in <Placeholder>City, Country</Placeholder>.</p>
      </Section>
      <p><Link to="/how-it-works" className="text-primary hover:underline">See how it works →</Link></p>
    </PublicLayout>
  ),
});
