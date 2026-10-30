import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { assessmentQuery } from "@/lib/api/assessments";
import { SUBJECTS, MARKS } from "@/lib/assessments/rules";
export function AssessmentResults({ attempt }: { attempt: string }) {
  const { data } = useSuspenseQuery(assessmentQuery(attempt));
  const a = data.attempt;
  if (a.status !== "finalized")
    return (
      <div>
        <h1 className="font-display text-2xl">Assessment still in progress</h1>
        <Link
          to="/me/assessments/$skill"
          params={{ skill: a.skill }}
          search={{ attempt }}
          className="mt-4 inline-block text-primary"
        >
          Resume assessment →
        </Link>
      </div>
    );
  const topics = Array.from(new Set(data.questions.map((q) => q.topic))).map((topic) => {
    const questions = data.questions.filter((q) => q.topic === topic);
    return {
      topic,
      total: questions.reduce((s, q) => s + MARKS[q.difficulty], 0),
      marks: questions.reduce(
        (s, q) => s + (q.selected_option === q.correct_option ? MARKS[q.difficulty] : 0),
        0,
      ),
    };
  });
  const weak = topics.filter((t) => t.marks < t.total);
  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/me/assessments" className="text-sm text-primary hover:underline">
        ← Assessments
      </Link>
      <p className="eyebrow mb-3 mt-6">Verified assessment result</p>
      <h1 className="font-display text-3xl">{SUBJECTS.find((s) => s.id === a.skill)?.label}</h1>
      <section className="my-6 grid gap-5 border-y border-border py-6 sm:grid-cols-3">
        <div>
          <p className="num text-5xl text-primary">{a.percentage}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{a.marks} of 40 weighted marks</p>
        </div>
        <div>
          <p className="eyebrow">Proficiency</p>
          <p className="mt-3 text-xl">{a.proficiency}</p>
          <p className="mt-2 text-xs text-muted-foreground">Project assessment band</p>
        </div>
        <div>
          <p className="eyebrow">Finalized</p>
          <p className="mt-3 text-sm">
            {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : ""}
          </p>
        </div>
      </section>
      <section className="border-b border-border pb-6">
        <h2 className="mb-4 font-display text-xl">Topic-wise performance</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((t) => (
            <li
              key={t.topic}
              className="flex justify-between gap-4 border-b border-border py-2 text-sm"
            >
              <span>{t.topic}</span>
              <span className="num shrink-0">
                {t.marks} / {t.total} marks
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="py-6">
        <h2 className="mb-4 font-display text-xl">Improvement recommendations</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {weak.length ? (
            weak.map((t) => (
              <li key={t.topic}>
                Review {t.topic.toLowerCase()}, work through the explanations below, then solve
                three fresh examples before retesting.
              </li>
            ))
          ) : (
            <li>Build on this result with a practical project and more advanced exercises.</li>
          )}
        </ul>
      </section>
      <section className="border-t border-border pt-6">
        <h2 className="mb-5 font-display text-xl">Answers & explanations</h2>
        <ol className="space-y-6">
          {data.questions.map((q) => {
            const correct = q.selected_option === q.correct_option;
            return (
              <li key={q.id} className="border-b border-border pb-6">
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span className={correct ? "text-strength" : "text-gap"}>
                    {correct ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </span>
                  Question {q.position} · {q.topic} · {q.difficulty}
                </div>
                <p className="break-words font-mono text-sm leading-relaxed">{q.prompt}</p>
                <p className="mt-3 break-words text-sm text-muted-foreground">
                  Your answer:{" "}
                  {q.selected_option === null ? "Unanswered" : q.options[q.selected_option]}
                </p>
                <p className="mt-2 break-words text-sm text-strength">
                  Correct answer:{" "}
                  {q.correct_option === undefined ? "Unavailable" : q.options[q.correct_option]}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {q.explanation}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
      <p className="mt-6 text-xs text-muted-foreground">
        Building: below 40% · Developing: 40–69.99% · Strong: 70–100%. These bands do not change
        your career match.
      </p>
    </div>
  );
}
