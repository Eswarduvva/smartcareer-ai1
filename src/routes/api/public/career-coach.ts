import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/public/career-coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { careerCoachStream } = await import("@/lib/api/coach-stream.server");
        return careerCoachStream(request);
      },
    },
  },
});
