import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AssessmentList } from "@/components/assessments/AssessmentList";
import { assessmentListQuery } from "@/lib/api/assessments";
import { assessmentHead } from "@/lib/assessments/rules";
export const Route = createFileRoute("/_authenticated/me_/assessments/")({
  head: () =>
    assessmentHead(
      "Skill assessments",
      "Account-private skill tests, verified proficiency and assessment history.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(assessmentListQuery()),
  component: Page,
});
function Page() {
  return (
    <AppShell>
      <AssessmentList />
    </AppShell>
  );
}
