import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Section, Placeholder, publicHead } from "@/components/PublicLayout";

export const Route = createFileRoute("/terms")({
  head: () => publicHead("Terms and conditions", "The terms for using SmartCareer."),
  component: () => (
    <PublicLayout eyebrow="Legal" title="Terms and conditions" intro="Draft for review. Have these terms checked by a qualified adviser before public launch.">
      <p className="text-muted-foreground">Last updated: <Placeholder>date</Placeholder> · Provider: <Placeholder>organisation name</Placeholder></p>
      <Section title="Using SmartCareer">
        <p>Provide accurate information, keep your password private and use the platform only for career planning. Do not try to access other users' data.</p>
      </Section>
      <Section title="Recommendations">
        <p>Career matches, gaps and roadmaps come from rule-based career recommendation. They are guidance only and do not guarantee employment, admission or any other outcome.</p>
      </Section>
      <Section title="Accounts and roles">
        <p>New accounts are student accounts. Mentor and administrator roles are assigned only by authorised administrators. We may suspend accounts that misuse the platform.</p>
      </Section>
      <Section title="Liability and governing law">
        <p><Placeholder>Liability terms</Placeholder> · Governed by the laws of <Placeholder>jurisdiction</Placeholder>.</p>
      </Section>
    </PublicLayout>
  ),
});
