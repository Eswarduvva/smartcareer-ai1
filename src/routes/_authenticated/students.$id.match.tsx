import { createFileRoute } from "@tanstack/react-router";
import { MatchView } from "@/components/journey/MatchView";

export const Route = createFileRoute("/_authenticated/students/$id/match")({
  head: ({ params }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Career match ${params.id} — SmartCareer` },
      { name: "description", content: "Recommended career domain and role, with the strengths and gaps behind it." },
      { property: "og:title", content: `Career match ${params.id} — SmartCareer` },
      { property: "og:description", content: "Recommended career, match score and skill gap." },
    ],
  }),
  component: MatchView,
});
