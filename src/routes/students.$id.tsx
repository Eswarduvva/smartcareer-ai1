import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { studentRecordQuery } from "@/lib/api/queries";
import { ErrorState, LoadingState, StudentNotFound } from "@/components/kit";

export const Route = createFileRoute("/students/$id")({
  loader: async ({ context, params }) => {
    const rec = await context.queryClient.ensureQueryData(studentRecordQuery(params.id));
    if (!rec) throw notFound();
  },
  pendingComponent: () => <LoadingState />,
  errorComponent: ({ error }) => <ErrorState error={error} />,
  notFoundComponent: StudentNotFound,
  component: () => <Outlet />,
});
