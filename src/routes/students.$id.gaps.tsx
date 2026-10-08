import { createFileRoute } from "@tanstack/react-router";
import { GapsView } from "@/components/journey/GapsView";

export const Route = createFileRoute("/students/$id/gaps")({
  head: ({ params }) => ({
    meta: [
      { title: `Skill gaps ${params.id} — SmartCareer AI` },
      { name: "description", content: "Skills below the gap threshold, ranked by distance to close." },
      { property: "og:title", content: `Skill gaps ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "Skills below the gap threshold, ranked." },
    ],
  }),
  component: GapsView,
});
