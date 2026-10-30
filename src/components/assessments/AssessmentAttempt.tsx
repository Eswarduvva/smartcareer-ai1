import { useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { assessmentQuery } from "@/lib/api/assessments";
import { saveAssessmentAnswer, submitAssessment } from "@/lib/api/assessments.functions";
import { SUBJECTS, MARKS } from "@/lib/assessments/rules";
export function AssessmentAttempt({ attempt, skill }: { attempt: string; skill: string }) {
  const { data } = useSuspenseQuery(assessmentQuery(attempt));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const save = useServerFn(saveAssessmentAnswer);
  const submit = useServerFn(submitAssessment);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [remaining, setRemaining] = useState(1500);
  const deadline = useRef(0);
  const submitting = useRef(false);
  const answered = data.questions.filter((q) => q.selected_option !== null).length;
  const question = data.questions[index];
  useEffect(() => {
    deadline.current =
      Date.now() + Date.parse(data.attempt.expires_at) - Date.parse(data.server_time);
    setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
  }, [data.server_time, data.attempt.expires_at]);
  useEffect(() => {
    if (data.attempt.status === "finalized")
      void navigate({
        to: "/me/assessments/results/$attemptId",
        params: { attemptId: attempt },
        replace: true,
      });
  }, [data.attempt.status, attempt, navigate]);
  async function finish() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await submit({ data: { attempt } });
      qc.setQueryData(["assessment", attempt], r);
      await qc.invalidateQueries({ queryKey: ["assessments"] });
      await navigate({
        to: "/me/assessments/results/$attemptId",
        params: { attemptId: attempt },
        replace: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      submitting.current = false;
      setBusy(false);
      setConfirm(false);
    }
  }
  useEffect(() => {
    if (data.attempt.status !== "active") return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0 && !submitting.current) void finish();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [data.attempt.status, attempt]);
  async function select(option: number) {
    if (busy || remaining === 0 || !question) return;
    setBusy(true);
    setError("");
    try {
      const r = await save({ data: { attempt, question: question.id, option } });
      qc.setQueryData(["assessment", attempt], r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Answer not saved.");
    } finally {
      setBusy(false);
    }
  }
  if (data.attempt.skill !== skill)
    return (
      <p role="alert">
        This attempt belongs to a different subject.{" "}
        <Link to="/me/assessments">Return to assessments</Link>
      </p>
    );
  if (!question) return null;
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Skill assessment</p>
          <h1 className="font-display text-2xl">{SUBJECTS.find((s) => s.id === skill)?.label}</h1>
        </div>
        <p
          role="timer"
          aria-label="Time remaining"
          className={`num flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xl ${remaining < 120 ? "text-gap" : "text-primary"}`}
        >
          <Clock className="h-5 w-5" />
          {Math.floor(remaining / 60)
            .toString()
            .padStart(2, "0")}
          :{(remaining % 60).toString().padStart(2, "0")}
        </p>
      </div>
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{answered} of 20 answered</span>
          <span>{Math.round((answered / 20) * 100)}%</span>
        </div>
        <Progress value={(answered / 20) * 100} />
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-gap">
          {error}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        <section>
          <p className="mb-3 text-xs text-muted-foreground">
            Question {index + 1} of 20 · {question.difficulty} · {MARKS[question.difficulty]}{" "}
            {MARKS[question.difficulty] === 1 ? "mark" : "marks"}
          </p>
          <h2 className="mb-6 whitespace-pre-wrap break-words font-mono text-base leading-relaxed">
            {question.prompt}
          </h2>
          <div role="group" aria-label="Answer options" className="space-y-3">
            {question.options.map((o, i) => (
              <Button
                key={i}
                variant="outline"
                aria-pressed={question.selected_option === i}
                disabled={busy || remaining === 0}
                onClick={() => void select(i)}
                className={`h-auto min-h-14 w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left ${question.selected_option === i ? "border-primary bg-accent text-accent-foreground" : ""}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                  {question.selected_option === i ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="min-w-0 break-words font-mono text-sm">{o}</span>
              </Button>
            ))}
          </div>
          <p className="mt-3 min-h-5 text-xs text-muted-foreground" aria-live="polite">
            {busy ? "Saving…" : question.selected_option !== null ? "Answer saved" : ""}
          </p>
          <div className="mt-6 flex justify-between gap-3">
            <Button
              variant="outline"
              disabled={index === 0 || busy}
              onClick={() => setIndex((i) => i - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={index === 19 || busy}
              onClick={() => setIndex((i) => i + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
        <aside className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h2 className="mb-4 text-sm font-medium">Questions</h2>
          <nav aria-label="Question navigation" className="grid grid-cols-5 gap-2">
            {data.questions.map((q, i) => (
              <Button
                key={q.id}
                variant={
                  index === i ? "default" : q.selected_option !== null ? "secondary" : "outline"
                }
                size="icon"
                aria-label={`Question ${i + 1}${q.selected_option !== null ? ", answered" : ""}`}
                aria-current={i === index ? "step" : undefined}
                disabled={busy}
                onClick={() => setIndex(i)}
                className="h-9 w-full"
              >
                {i + 1}
              </Button>
            ))}
          </nav>
          <Button
            disabled={busy || remaining === 0}
            onClick={() => setConfirm(true)}
            className="mt-6 w-full"
          >
            Submit assessment
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Answers are saved to your account. The 25-minute deadline continues if you leave.
          </p>
        </aside>
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Submit your assessment?</AlertDialogTitle>
          <AlertDialogDescription>
            {answered} of 20 answered. {20 - answered} unanswered questions will receive no marks.
            Answers cannot be changed after submission.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep working</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={() => void finish()}>
              Confirm submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
