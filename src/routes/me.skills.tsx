import { createFileRoute } from "@tanstack/react-router";
import { SkillsView } from "@/components/journey/SkillsView";

export const Route = createFileRoute("/me/skills")({
  head: () => ({
    meta: [
      { title: "My skills — SmartCareer" },
      { name: "description", content: "Your 19 skill scores grouped into technical, reasoning, communication and behavioural." },
      { property: "og:title", content: "My skills — SmartCareer" },
      { property: "og:description", content: "Your skill scores, grouped and compared." },
    ],
  }),
  component: SkillsView,
});
