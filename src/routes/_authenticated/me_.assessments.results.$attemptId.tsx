import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AssessmentResults } from "@/components/assessments/AssessmentResults";
import { assessmentQuery } from "@/lib/api/assessments";
import { assessmentHead } from "@/lib/assessments/rules";
export const Route = createFileRoute("/_authenticated/me_/assessments/results/$attemptId")({
  head: () =>
    assessmentHead(
      "Assessment results",
      "Your verified score, topic performance and explanations after submission.",
    ),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(assessmentQuery(params.attemptId)),
  component: Page,
});
function Page() {
  const { attemptId } = Route.useParams();
  return (
    <AppShell>
      <AssessmentResults attempt={attemptId} />
    </AppShell>
  );
}
