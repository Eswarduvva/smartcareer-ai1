import { createFileRoute } from "@tanstack/react-router";
import { MatchView } from "@/components/journey/MatchView";

export const Route = createFileRoute("/students/$id/match")({
  head: ({ params }) => ({
    meta: [
      { title: `Career match ${params.id} — SmartCareer AI` },
      { name: "description", content: "Recommended career domain and role, with the strengths and gaps behind it." },
      { property: "og:title", content: `Career match ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "Recommended career, match score and skill gap." },
    ],
  }),
  component: MatchView,
});
