import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ClipboardCheck, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assessmentListQuery } from "@/lib/api/assessments";
import { startAssessment } from "@/lib/api/assessments.functions";
import { SUBJECTS } from "@/lib/assessments/rules";
export function AssessmentList() {
  const { data } = useSuspenseQuery(assessmentListQuery());
  const start = useServerFn(startAssessment);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState("");
  async function begin(skill: (typeof SUBJECTS)[number]["id"]) {
    setBusy(skill);
    setError("");
    try {
      const attempt = await start({ data: { skill } });
      await qc.invalidateQueries({ queryKey: ["assessments"] });
      await navigate({ to: "/me/assessments/$skill", params: { skill }, search: { attempt } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start assessment.");
    } finally {
      setBusy(undefined);
    }
  }
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow mb-3">Your career · verified evidence</p>
      <h1 className="font-display text-3xl">Skill assessments</h1>
      <div className="my-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          20 questions
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          25 minutes
        </span>
        <span>40 weighted marks</span>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-gap">
          {error}
        </p>
      )}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => {
          const active = data.attempts.find((a) => a.skill === s.id && a.status === "active");
          const latest = data.latest.find((a) => a.skill === s.id);
          return (
            <article
              key={s.id}
              className="flex flex-col rounded-lg border border-border bg-card p-5"
            >
              <ClipboardCheck className="mb-5 h-6 w-6 text-primary" />
              <h2 className="font-display text-xl">{s.label}</h2>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">{s.topics}</p>
              <div className="my-5 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Latest verified proficiency</p>
                <p className="mt-1 text-sm">
                  {latest ? `${latest.percentage}% · ${latest.proficiency}` : "Not assessed"}
                </p>
              </div>
              <Button className="mt-auto w-full" disabled={!!busy} onClick={() => void begin(s.id)}>
                {busy === s.id ? "Preparing…" : active ? "Resume assessment" : "Start assessment"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </article>
          );
        })}
      </section>
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="mb-4 font-display text-xl">Assessment history</h2>
        {!data.attempts.length ? (
          <p className="text-sm text-muted-foreground">
            Your completed assessments will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.attempts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{SUBJECTS.find((s) => s.id === a.skill)?.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.started_at).toLocaleDateString()} ·{" "}
                    {a.status === "finalized"
                      ? `${a.percentage}% · ${a.proficiency}`
                      : "In progress"}
                  </p>
                </div>
                {a.status === "finalized" ? (
                  <Link
                    to="/me/assessments/results/$attemptId"
                    params={{ attemptId: a.id }}
                    className="text-sm text-primary hover:underline"
                  >
                    View results →
                  </Link>
                ) : (
                  <Link
                    to="/me/assessments/$skill"
                    params={{ skill: a.skill }}
                    search={{ attempt: a.id }}
                    className="text-sm text-primary hover:underline"
                  >
                    Resume →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        8 beginner questions × 1 mark · 8 intermediate × 2 · 4 advanced × 4. Unanswered questions
        earn no marks. Proficiency levels are project assessment bands, not professional
        certification. Predefined practice questions are automated-checked; independent educator
        review is pending.
      </p>
    </div>
  );
}
