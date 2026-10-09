import { createFileRoute } from "@tanstack/react-router";
import { GapsView } from "@/components/journey/GapsView";

export const Route = createFileRoute("/students/$id/gaps")({
  head: ({ params }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Skill gaps ${params.id} — SmartCareer` },
      { name: "description", content: "Skills below the gap threshold, ranked by distance to close." },
      { property: "og:title", content: `Skill gaps ${params.id} — SmartCareer` },
      { property: "og:description", content: "Skills below the gap threshold, ranked." },
    ],
  }),
  component: GapsView,
});
