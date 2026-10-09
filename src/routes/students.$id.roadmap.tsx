import { createFileRoute } from "@tanstack/react-router";
import { RoadmapView } from "@/components/journey/RoadmapView";

export const Route = createFileRoute("/students/$id/roadmap")({
  head: ({ params }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Career roadmap ${params.id} — SmartCareer` },
      { name: "description", content: "Rule-based next steps from the student's weakest skills and experience." },
      { property: "og:title", content: `Career roadmap ${params.id} — SmartCareer` },
      { property: "og:description", content: "Rule-based next steps toward the recommended career." },
    ],
  }),
  component: RoadmapView,
});
