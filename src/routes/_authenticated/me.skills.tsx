import { createFileRoute } from "@tanstack/react-router";
import { SkillsView } from "@/components/journey/SkillsView";

export const Route = createFileRoute("/_authenticated/me/skills")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "My skills — SmartCareer" },
      { name: "description", content: "Your 19 skill scores grouped into technical, reasoning, communication and behavioural." },
      { property: "og:title", content: "My skills — SmartCareer" },
      { property: "og:description", content: "Your skill scores, grouped and compared." },
    ],
  }),
  component: SkillsView,
});
