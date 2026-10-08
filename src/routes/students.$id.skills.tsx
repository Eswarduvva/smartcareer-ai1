import { createFileRoute } from "@tanstack/react-router";
import { SkillsView } from "@/components/journey/SkillsView";

export const Route = createFileRoute("/students/$id/skills")({
  head: ({ params }) => ({
    meta: [
      { title: `Skill intelligence ${params.id} — SmartCareer AI` },
      { name: "description", content: "All 19 skill scores, grouped into technical, reasoning, communication and behavioural." },
      { property: "og:title", content: `Skill intelligence ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "All skill scores grouped and compared." },
    ],
  }),
  component: SkillsView,
});
