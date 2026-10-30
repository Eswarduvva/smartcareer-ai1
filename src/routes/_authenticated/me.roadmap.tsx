import { createFileRoute } from "@tanstack/react-router";
import { RoadmapView } from "@/components/journey/RoadmapView";
import { PersonalizedRoadmap } from '@/components/learn/PersonalizedLearning';
import { curriculumQuery } from '@/lib/api/personalized-learning';

export const Route = createFileRoute("/_authenticated/me/roadmap")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "My career roadmap — SmartCareer" },
      { name: "description", content: "Rule-based next steps from your weakest skills and your experience." },
      { property: "og:title", content: "My career roadmap — SmartCareer" },
      { property: "og:description", content: "Your next steps toward your recommended career." },
    ],
  }),
  loader: ({context}) => context.queryClient.ensureQueryData(curriculumQuery()),
  component: Page,
});
function Page(){return <><PersonalizedRoadmap/><RoadmapView/></>;}
