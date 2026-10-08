import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { LoadingState } from "@/components/kit";
import { api, isPreviewData } from "@/lib/api/client";
import type { SkillKey } from "@/lib/api/types";
import { clearProfile, emptyProfile, loadProfile, MY_ID, saveProfile, type MyProfile } from "@/lib/my-profile";
import { GAP_THRESHOLD, GROUPS, SCORE_MAX, SKILLS, STRONG_THRESHOLD } from "@/lib/skills";
import { cn } from "@/lib/utils";
import { INTEREST_OPTIONS, ROLE_OPTIONS } from "@/lib/careers";
import { mockSampleProfileId } from "@/lib/mock";

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Build my career profile — SmartCareer" },
      { name: "description", content: "Five short steps: about you, skills, experience, interests and goals. Then see your career match." },
      { property: "og:title", content: "Build my career profile — SmartCareer" },
      { property: "og:description", content: "Tell SmartCareer about your studies, skills and goals in five steps." },
    ],
  }),
  component: () => (
    <AppShell>
      <Builder />
    </AppShell>
  ),
});

const STEPS = ["About you", "Your skills", "Experience", "Career interests", "Career goals"] as const;

const GROUP_HINT: Record<string, string> = {
  Technical: "Tools and methods you can apply hands-on.",
  Reasoning: "How you approach and solve problems.",
  Communication: "How clearly you explain and write.",
  Behavioural: "How you work with others and keep growing.",
};

const levelOf = (v: number) => (v < GAP_THRESHOLD ? ["Building", "text-gap"] : v < STRONG_THRESHOLD ? ["Developing", "text-primary"] : ["Strong", "text-strength"]);

function Builder() {
  const nav = useNavigate();
  const [p, setP] = useState<MyProfile | null>(null);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setP(loadProfile()?.profile ?? emptyProfile());
  }, []);
  useEffect(() => {
    if (p) saveProfile(p, loadProfile()?.complete ?? false);
  }, [p]);

  if (!p) return <LoadingState />;

  const set = <K extends keyof MyProfile>(sec: K, field: string, value: unknown) =>
    setP((cur) => (cur ? { ...cur, [sec]: { ...(cur[sec] as object), [field]: value } } : cur));

  const s = p.student;
  const validate = () => {
    if (step === 0) {
      if (!s.degree || !s.branch) return "Add your degree and branch.";
      if (s.cgpa == null || s.cgpa < 0 || s.cgpa > 10) return "Enter a CGPA between 0 and 10.";
    }
    if (step === 3 && !p.preferences?.primary_interest) return "Choose a primary interest.";
    return null;
  };
  const next = () => {
    const v = validate();
    setErr(v);
    if (v) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else {
      saveProfile(p, true);
      nav({ to: "/me" });
    }
  };

  const loadSample = async () => {
    const rec = await api.getStudentRecord(mockSampleProfileId);
    if (!rec) return;
    const { recommendation: _r, ...rest } = rec;
    const withId = <T extends object>(o: T | null) => (o ? { ...o, student_id: MY_ID } : o);
    setP({
      student: { ...rest.student, student_id: MY_ID },
      skills: withId(rest.skills),
      experience: withId(rest.experience),
      preferences: withId(rest.preferences),
      goals: rest.goals ? { ...rest.goals, student_id: MY_ID, career_readiness_score: null } : null,
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-3"><span className="h-px w-6 bg-primary" />Build my career profile</p>
          <h1 className="text-3xl font-medium tracking-tight md:text-[2.6rem] md:leading-[1.05]">{STEPS[step]}</h1>
        </div>
        <div className="flex gap-4 font-mono text-[11px] uppercase tracking-wider">
          {isPreviewData && (
            <button onClick={loadSample} className="text-primary hover:underline">Fill with a sample profile</button>
          )}
          <button onClick={() => { clearProfile(); setP(emptyProfile()); setStep(0); }} className="text-muted-foreground hover:text-foreground">Start over</button>
        </div>
      </div>

      {/* stepper */}
      <ol className="mb-10 grid grid-cols-5 border-y border-border">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                "flex w-full flex-col gap-1 border-t-2 px-1 py-3 text-left md:px-3",
                i === step ? "border-primary" : i < step ? "border-strength" : "border-transparent",
              )}
            >
              <span className={cn("num text-[11px]", i < step ? "text-strength" : "text-muted-foreground")}>{i < step ? "✓" : `0${i + 1}`}</span>
              <span className={cn("hidden text-xs md:block", i === step ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Fields>
          <Text label="Degree" value={s.degree} onChange={(v) => set("student", "degree", v)} options={["B.Tech", "B.E", "B.Sc", "BCA", "M.Tech", "MCA", "MBA"]} required />
          <Text label="Branch" value={s.branch} onChange={(v) => set("student", "branch", v)} options={["Computer Science", "Information Technology", "Electronics", "Mechanical", "Statistics", "Business Analytics"]} required />
          <Text label="Specialization" value={s.specialization} onChange={(v) => set("student", "specialization", v)} />
          <Choice label="College type" value={s.college_type} onChange={(v) => set("student", "college_type", v)} options={["Government", "Private", "Deemed", "Autonomous"]} />
          <Num label="CGPA" hint="out of 10" step={0.01} value={s.cgpa} onChange={(v) => set("student", "cgpa", v)} required />
          <Num label="Backlogs" value={s.backlogs} onChange={(v) => set("student", "backlogs", v)} />
          <Num label="Graduation year" value={s.graduation_year} onChange={(v) => set("student", "graduation_year", v)} />
          <Num label="Age" value={s.age} onChange={(v) => set("student", "age", v)} />
          <Choice label="Gender" value={s.gender} onChange={(v) => set("student", "gender", v)} options={["Female", "Male", "Other", "Prefer not to say"]} />
          <Text label="City" value={s.city} onChange={(v) => set("student", "city", v)} />
          <Text label="State" value={s.state} onChange={(v) => set("student", "state", v)} />
          <Choice label="Interested in higher education?" value={s.higher_education_interest} onChange={(v) => set("student", "higher_education_interest", v)} options={["Yes", "No", "Maybe"]} />
        </Fields>
      )}

      {step === 1 && (
        <div className="space-y-12">
          <p className="max-w-xl text-sm text-muted-foreground">
            Rate yourself honestly from 0 to {SCORE_MAX}. Under {GAP_THRESHOLD} is <span className="text-gap">building</span>, {GAP_THRESHOLD}–{STRONG_THRESHOLD - 1} is <span className="text-primary">developing</span>, {STRONG_THRESHOLD}+ is <span className="text-strength">strong</span>.
          </p>
          {GROUPS.map((g) => (
            <section key={g} className="grid gap-6 md:grid-cols-[200px_1fr]">
              <div>
                <p className="eyebrow">{g}</p>
                <p className="mt-2 text-xs text-muted-foreground">{GROUP_HINT[g]}</p>
              </div>
              <ul className="divide-y divide-border border-y border-border">
                {SKILLS.filter((k) => k.group === g).map((k) => {
                  const v = (p.skills?.[k.key as SkillKey] as number | null) ?? 50;
                  const [lvl, tone] = levelOf(v);
                  return (
                    <li key={k.key} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 md:grid-cols-[150px_1fr_110px]">
                      <label htmlFor={k.key} className="text-sm">{k.label}</label>
                      <span className="text-right font-mono text-xs md:order-last"><span className="num text-foreground">{v}</span> <span className={tone}>{lvl}</span></span>
                      <input
                        id={k.key}
                        type="range"
                        min={0}
                        max={SCORE_MAX}
                        value={v}
                        onChange={(e) => set("skills", k.key, Number(e.target.value))}
                        className="col-span-2 w-full accent-primary md:col-span-1"
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {step === 2 && (
        <Fields>
          <Num label="Projects completed" value={p.experience?.project_count} onChange={(v) => set("experience", "project_count", v)} />
          <Num label="Internships" value={p.experience?.internship_count} onChange={(v) => set("experience", "internship_count", v)} />
          <Num label="Certifications" value={p.experience?.certification_count} onChange={(v) => set("experience", "certification_count", v)} />
          <Num label="Work experience" hint="months" value={p.experience?.work_experience_months} onChange={(v) => set("experience", "work_experience_months", v)} />
        </Fields>
      )}

      {step === 3 && (
        <Fields>
          <Choice label="Primary interest" value={p.preferences?.primary_interest} onChange={(v) => set("preferences", "primary_interest", v)} options={INTEREST_OPTIONS} required />
          <Text label="Secondary interest" value={p.preferences?.secondary_interest} onChange={(v) => set("preferences", "secondary_interest", v)} options={INTEREST_OPTIONS} />
          <Text label="Preferred industry" value={p.preferences?.preferred_industry} onChange={(v) => set("preferences", "preferred_industry", v)} options={["Technology", "Finance", "Healthcare", "Consulting", "E-commerce"]} />
          <Text label="Preferred role" value={p.preferences?.preferred_work_role} onChange={(v) => set("preferences", "preferred_work_role", v)} options={ROLE_OPTIONS} />
          <Choice label="Work mode" value={p.preferences?.preferred_work_mode} onChange={(v) => set("preferences", "preferred_work_mode", v)} options={["On-site", "Hybrid", "Remote"]} />
          <Text label="Preferred location" value={p.preferences?.preferred_location} onChange={(v) => set("preferences", "preferred_location", v)} />
          <Choice label="Willing to relocate?" value={p.preferences?.willing_to_relocate} onChange={(v) => set("preferences", "willing_to_relocate", v)} options={["Yes", "No"]} />
        </Fields>
      )}

      {step === 4 && (
        <Fields>
          <Text label="Career goal" value={p.goals?.career_goal} onChange={(v) => set("goals", "career_goal", v)} options={ROLE_OPTIONS} />
          <Num label="Expected salary" hint="₹ per year" step={10000} value={p.goals?.expected_salary} onChange={(v) => set("goals", "expected_salary", v)} />
          <Num label="Study hours per week" value={p.goals?.study_hours_per_week} onChange={(v) => set("goals", "study_hours_per_week", v)} />
          <div className="border-l border-border pl-4 text-xs text-muted-foreground md:col-span-2">
            Career readiness is calculated by SmartCareer, not entered by you. It appears once your profile is analysed from the database.
          </div>
        </Fields>
      )}

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
        <button
          onClick={() => { setErr(null); setStep(Math.max(0, step - 1)); }}
          disabled={step === 0}
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          ← Back
        </button>
        <div className="flex items-center gap-6">
          {err && <p role="alert" className="text-sm text-gap">{err}</p>}
          <p className="hidden text-[11px] text-muted-foreground md:block">Saved on this device</p>
          <button onClick={next} className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">
            {step === STEPS.length - 1 ? "Analyse my profile →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Fields({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">{children}</div>;
}

const inputCls = "w-full border-0 border-b border-input bg-transparent px-0 py-2 text-base outline-none focus:border-primary";

function Field({ label, hint, required, children }: { label: string; hint?: string | undefined; required?: boolean | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow flex justify-between">
        <span>{label}{required && <span className="text-gap"> *</span>}</span>
        {hint && <span className="normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Text({ label, value, onChange, options, required }: { label: string; value: string | null | undefined; onChange: (v: string | null) => void; options?: string[]; required?: boolean }) {
  const list = options ? `dl-${label.replace(/\W/g, "")}` : undefined;
  return (
    <Field label={label} required={required}>
      <input className={inputCls} value={value ?? ""} list={list} onChange={(e) => onChange(e.target.value || null)} />
      {options && <datalist id={list}>{options.map((o) => <option key={o} value={o} />)}</datalist>}
    </Field>
  );
}

function Num({ label, value, onChange, hint, step = 1, required }: { label: string; value: number | null | undefined; onChange: (v: number | null) => void; hint?: string; step?: number; required?: boolean }) {
  return (
    <Field label={label} hint={hint} required={required}>
      <input
        type="number"
        min={0}
        step={step}
        className={cn(inputCls, "num")}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </Field>
  );
}

function Choice({ label, value, onChange, options, required }: { label: string; value: string | null | undefined; onChange: (v: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <p className="eyebrow">{label}{required && <span className="text-gap"> *</span>}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={cn("border px-3 py-1.5 text-sm transition-colors", value === o ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
