import { createFileRoute } from "@tanstack/react-router";
import { GapsView } from "@/components/journey/GapsView";

export const Route = createFileRoute("/me/gaps")({
  head: () => ({
    meta: [
      { title: "My skill gaps — SmartCareer" },
      { name: "description", content: "Which of your skills sit below the bar, and how far each is from the next level." },
      { property: "og:title", content: "My skill gaps — SmartCareer" },
      { property: "og:description", content: "Your skill gaps, ranked by distance to close." },
    ],
  }),
  component: GapsView,
});
