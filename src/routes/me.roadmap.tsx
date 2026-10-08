import { createFileRoute } from "@tanstack/react-router";
import { RoadmapView } from "@/components/journey/RoadmapView";

export const Route = createFileRoute("/me/roadmap")({
  head: () => ({
    meta: [
      { title: "My career roadmap — SmartCareer" },
      { name: "description", content: "Rule-based next steps from your weakest skills and your experience." },
      { property: "og:title", content: "My career roadmap — SmartCareer" },
      { property: "og:description", content: "Your next steps toward your recommended career." },
    ],
  }),
  component: RoadmapView,
});
