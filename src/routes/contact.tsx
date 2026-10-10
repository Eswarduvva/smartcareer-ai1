import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Section, Placeholder, publicHead } from "@/components/PublicLayout";
import { SupportForm } from "@/components/SupportForm";

export const Route = createFileRoute("/contact")({
  head: () => publicHead("Contact us", "Send a question or support request to the SmartCareer team."),
  component: () => (
    <PublicLayout eyebrow="Contact" title="Contact us" intro="Questions about your account, your results or using SmartCareer at your institution? Send us a message.">
      <SupportForm kind="contact" />
      <Section title="Other ways to reach us">
        <p>Email: <Placeholder>supporyt email</Placeholder> <Placeholder>y.gopikrishna0214@gmail.com</Placeholder> · Phone: +91 79815 11588</p>
        <p>Address: Hyderabad</p>
      </Section>
    </PublicLayout>
  ),
});
