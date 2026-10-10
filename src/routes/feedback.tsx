import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, publicHead } from "@/components/PublicLayout";
import { SupportForm } from "@/components/SupportForm";

export const Route = createFileRoute("/feedback")({
  head: () => publicHead("Feedback", "Tell us what works and what could be better in SmartCareer."),
  component: () => (
    <PublicLayout eyebrow="Feedback" title="Share your feedback" intro="Your feedback helps us improve the profile builder, recommendations and roadmap.">
      <SupportForm kind="feedback" />
    </PublicLayout>
  ),
});
