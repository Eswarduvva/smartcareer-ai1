import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Section, Placeholder, publicHead } from "@/components/PublicLayout";

export const Route = createFileRoute("/privacy")({
  head: () => publicHead("Privacy policy", "What data SmartCareer collects, why, and who can access it."),
  component: () => (
    <PublicLayout eyebrow="Legal" title="Privacy policy" intro="Draft for review. Have this policy checked by a qualified adviser before public launch.">
      <p className="text-muted-foreground">Last updated: <Placeholder>date</Placeholder> · Data controller: <Placeholder>organisation name and address</Placeholder></p>
      <Section title="Data we collect">
        <p>Account data (email, name), the career profile you enter (education, skill ratings, experience, interests, goals), roadmap progress, and messages you send through the contact or feedback forms.</p>
      </Section>
      <Section title="How we use it">
        <p>To produce your career match, skill gaps and roadmap; to let assigned mentors guide you; and to answer your messages. We do not sell personal data.</p>
      </Section>
      <Section title="Who can access it">
        <p>You can access your own profile. Mentors can access only students assigned to them. Administrators can manage accounts and messages. Access is enforced by database security rules.</p>
      </Section>
      <Section title="Retention and your rights">
        <p>Data is kept while your account is active, for <Placeholder>retention period</Placeholder>. To access, correct or delete your data, contact <Placeholder>privacy contact email</Placeholder>.</p>
      </Section>
      <Section title="Cookies and local storage">
        <p>We store your sign-in session and theme choice in your browser. We do not use advertising trackers.</p>
      </Section>
    </PublicLayout>
  ),
});
