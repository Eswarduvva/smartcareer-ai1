import { createFileRoute } from "@tanstack/react-router";
import { MatchView } from "@/components/journey/MatchView";

export const Route = createFileRoute("/me/match")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "My career match — SmartCareer" },
      { name: "description", content: "Your recommended career domain and role, with the strengths and gaps behind it." },
      { property: "og:title", content: "My career match — SmartCareer" },
      { property: "og:description", content: "Recommended career, match score and skill gap." },
    ],
  }),
  component: MatchView,
});
