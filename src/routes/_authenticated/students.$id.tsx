import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { studentRecordQuery } from "@/lib/api/queries";
import { ErrorState, LoadingState, StudentNotFound } from "@/components/kit";
import { RecordProvider } from "@/lib/use-record";
import type { StudentRecord } from "@/lib/api/types";

export const Route = createFileRoute("/_authenticated/students/$id")({
  loader: async ({ context, params }) => {
    const rec = await context.queryClient.ensureQueryData(studentRecordQuery(params.id));
    if (!rec) throw notFound();
  },
  pendingComponent: () => <LoadingState />,
  errorComponent: ({ error }) => <ErrorState error={error} />,
  notFoundComponent: StudentNotFound,
  component: StudentLayout,
});

function StudentLayout() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(studentRecordQuery(id));
  return (
    <RecordProvider record={data as StudentRecord} source="database">
      <Outlet />
    </RecordProvider>
  );
}
