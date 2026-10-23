import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState } from "@/components/kit";
import { RecordProvider } from "@/lib/use-record";
import { toRecord, useMyProfile } from "@/lib/my-profile";
import { useSession } from "@/lib/auth";
import { myCohortQuery } from "@/lib/api/dashboards";

export const Route = createFileRoute("/_authenticated/me")({
  component: MeLayout,
});

function MeLayout() {
  const mine = useMyProfile();
  const session = useSession();
  // An admin-approved cohort link takes precedence over the self-entered profile.
  const cohort = useQuery(myCohortQuery(session?.user.id));
  let body;
  if (mine === undefined || session === undefined || cohort.isLoading) body = <LoadingState />;
  else if (cohort.error) body = <ErrorState error={cohort.error} />;
  else if (cohort.data?.linked)
    body = (
      <RecordProvider record={cohort.data.record} source="database">
        <Outlet />
      </RecordProvider>
    );
  else if (!mine || !mine.complete) body = <NoProfile started={!!mine} />;
  else
    body = (
      <RecordProvider record={toRecord(mine.profile)} source="rule-based">
        <Outlet />
      </RecordProvider>
    );
  return <AppShell>{body}</AppShell>;
}

function NoProfile({ started }: { started: boolean }) {
  return (
    <div className="mx-auto mt-10 max-w-xl border-l-2 border-primary py-4 pl-8">
      <p className="eyebrow mb-4 text-primary">Career intelligence</p>
      <h1 className="mb-3 text-2xl font-medium tracking-tight">
        {started ? "Finish your profile to see your results" : "Start with your career profile"}
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
        Five short steps — about you, skills, experience, interests and goals. SmartCareer then lays out your career match, skill gaps and roadmap.
      </p>
      <Link to="/build" className="inline-block border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">
        {started ? "Continue my profile" : "Build my career profile"} →
      </Link>
    </div>
  );
}
