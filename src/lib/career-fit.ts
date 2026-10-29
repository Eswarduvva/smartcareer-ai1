import type { CareerGoals, CareerPreferences, SkillKey, Student, StudentExperience, StudentSkillScores } from "./api/types";
import { CAREER_TRACKS, type CareerTrack } from "./careers";
import { scoreTrack, validSkill } from "./recommend";
import { STRONG_THRESHOLD } from "./skills";

/**
 * OVERALL CAREER FIT — rule-based, not AI, not a probability of career success.
 * Separate from the skill match (scoreTrack) and from the dataset's recorded career_match_score,
 * which are both left unchanged. Weights and tables below are configurable project assumptions,
 * not validated measures.
 */
export const FIT_WEIGHTS = { technical: 0.4, interest: 0.25, education: 0.15, experience: 0.1, aptitude: 0.1 } as const;
export type FitFactor = keyof typeof FIT_WEIGHTS;
export const FIT_FACTOR_LABELS: Record<FitFactor, string> = {
  technical: "Skill Match",
  interest: "Career Interest Alignment",
  education: "Education Relevance",
  experience: "Experience Relevance",
  aptitude: "Aptitude & Soft Skills",
};

/** Interest / work-role keywords that point to each track (lowercase, exact match). */
const INTEREST_TRACKS: Record<string, string[]> = {
  "software-developer": ["software development", "web development", "programming", "software engineering", "technical"],
  "data-analyst": ["data analytics", "business intelligence", "business analysis", "analytics"],
  "data-scientist": ["data science", "machine learning", "deep learning", "artificial intelligence", "research", "data science & ml"],
  "ui-ux-designer": ["product design", "ui/ux", "design", "product management", "product"],
  "cloud-devops": ["cloud computing", "devops", "infrastructure", "cloud & infrastructure"],
};

/** Branch relevance (0–100) per track — guidance heuristic, not eligibility. Unlisted branch = 30. */
const EDUCATION_RELEVANCE: Record<string, Record<string, number>> = {
  "software-developer": { cse: 100, it: 95, "computer science": 95, "computer applications": 90, "ai & ds": 80, ece: 60 },
  "data-analyst": { "ai & ds": 100, cse: 80, it: 80, "computer science": 80, "computer applications": 75, ece: 60 },
  "data-scientist": { "ai & ds": 100, cse: 85, "computer science": 80, it: 75, "computer applications": 65, ece: 55 },
  "ui-ux-designer": { cse: 65, it: 65, "computer science": 65, "computer applications": 65, "ai & ds": 55, ece: 45 },
  "cloud-devops": { cse: 95, it: 100, "computer science": 85, "computer applications": 85, ece: 75, "ai & ds": 75 },
};
const UNLISTED_BRANCH = 30;

/** Role-specific aptitude and soft skills (always includes general aptitude). */
const SOFT_SKILLS: Record<string, SkillKey[]> = {
  "software-developer": ["aptitude_score", "teamwork_score", "adaptability_score"],
  "data-analyst": ["aptitude_score", "communication_score", "english_score"],
  "data-scientist": ["aptitude_score", "logical_reasoning_score", "learning_interest_score"],
  "ui-ux-designer": ["aptitude_score", "communication_score", "adaptability_score"],
  "cloud-devops": ["aptitude_score", "teamwork_score", "learning_interest_score"],
};

export interface FitInput {
  student: Pick<Student, "degree" | "branch"> | null;
  skills: StudentSkillScores | null;
  experience: StudentExperience | null;
  preferences: Pick<CareerPreferences, "primary_interest" | "secondary_interest" | "preferred_work_role"> | null;
  goals?: Pick<CareerGoals, "career_goal"> | null;
}

export interface FactorScore {
  factor: FitFactor;
  /** 0–100, or null = "Insufficient information". */
  value: number | null;
  weight: number;
  note: string;
}

export interface CareerFit {
  track: CareerTrack;
  /** 0–100, or null when any factor lacks information. */
  overall: number | null;
  factors: Record<FitFactor, FactorScore>;
  missingFactors: FitFactor[];
  strengths: SkillKey[];
  gaps: SkillKey[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
const count = (v: unknown, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? Math.min(v, max) : null);

function interestFactor(t: CareerTrack, p: FitInput["preferences"]): FactorScore {
  const base = { factor: "interest" as const, weight: FIT_WEIGHTS.interest };
  const primary = norm(p?.primary_interest), secondary = norm(p?.secondary_interest), role = norm(p?.preferred_work_role);
  if (!primary && !secondary && !role) return { ...base, value: null, note: "No interests or preferred role recorded." };
  const keys = [...(INTEREST_TRACKS[t.id] ?? []), norm(t.domain), norm(t.role)];
  const hits: string[] = [];
  let v = 0;
  if (primary && keys.includes(primary)) { v += 60; hits.push("primary interest"); }
  if (secondary && keys.includes(secondary)) { v += 25; hits.push("secondary interest"); }
  if (role && keys.includes(role)) { v += 15; hits.push("preferred work role"); }
  return { ...base, value: v, note: hits.length ? `Matches your ${hits.join(", ")}.` : "Your stated interests point to other fields." };
}

function educationFactor(t: CareerTrack, s: FitInput["student"]): FactorScore {
  const base = { factor: "education" as const, weight: FIT_WEIGHTS.education };
  const branch = norm(s?.branch);
  if (!branch) return { ...base, value: null, note: "Branch of study not recorded." };
  const v = EDUCATION_RELEVANCE[t.id]?.[branch];
  return { ...base, value: v ?? UNLISTED_BRANCH, note: `${[s?.degree, s?.branch].filter(Boolean).join(" · ")} — ${v === undefined ? "not a typical route (guidance only)" : v >= 85 ? "a common route" : v >= 60 ? "a related route" : "a less direct route"}.` };
}

function experienceFactor(e: FitInput["experience"]): FactorScore {
  const base = { factor: "experience" as const, weight: FIT_WEIGHTS.experience };
  const p = count(e?.project_count, 4), i = count(e?.internship_count, 2), c = count(e?.certification_count, 3);
  if (p === null || i === null || c === null) return { ...base, value: null, note: "Projects, internships or certifications missing or invalid." };
  return { ...base, value: round1((p / 4) * 50 + (i / 2) * 35 + (c / 3) * 15), note: `${e!.project_count} projects, ${e!.internship_count} internships, ${e!.certification_count} certifications.` };
}

function aptitudeFactor(t: CareerTrack, sk: StudentSkillScores | null): FactorScore {
  const base = { factor: "aptitude" as const, weight: FIT_WEIGHTS.aptitude };
  const keys = SOFT_SKILLS[t.id] ?? ["aptitude_score"];
  if (!sk || keys.some((k) => !validSkill(sk[k]))) return { ...base, value: null, note: "Aptitude or soft-skill scores missing or outside 0–100." };
  const v = keys.reduce((a, k) => a + Math.min((sk[k] as number) / STRONG_THRESHOLD, 1), 0) / keys.length * 100;
  return { ...base, value: round1(v), note: `Based on ${keys.length} role-relevant scores, each counted up to ${STRONG_THRESHOLD}.` };
}

/** Pure, deterministic Overall Career Fit for one track. */
export function careerFit(input: FitInput, t: CareerTrack): CareerFit {
  const sm = input.skills ? scoreTrack(input.skills, t) : null;
  const factors: Record<FitFactor, FactorScore> = {
    technical: { factor: "technical", weight: FIT_WEIGHTS.technical, value: sm?.match ?? null, note: sm?.match != null ? `Your ${t.skills.length} key ${t.role} skills, each counted up to ${STRONG_THRESHOLD}.` : "Key skill scores missing or outside 0–100." },
    interest: interestFactor(t, input.preferences),
    education: educationFactor(t, input.student),
    experience: experienceFactor(input.experience),
    aptitude: aptitudeFactor(t, input.skills),
  };
  const missingFactors = (Object.keys(factors) as FitFactor[]).filter((f) => factors[f].value === null);
  const overall = missingFactors.length ? null : round1((Object.values(factors) as FactorScore[]).reduce((a, f) => a + (f.value as number) * f.weight, 0));
  const sk = input.skills;
  const valid = t.skills.filter((k) => sk && validSkill(sk[k]));
  return {
    track: t,
    overall: overall === null ? null : Math.max(0, Math.min(100, overall)),
    factors,
    missingFactors,
    strengths: valid.filter((k) => (sk![k] as number) >= STRONG_THRESHOLD),
    gaps: valid.filter((k) => (sk![k] as number) < STRONG_THRESHOLD).sort((a, b) => (sk![a] as number) - (sk![b] as number)),
  };
}

/** All tracks by Overall Career Fit (insufficient last), ties by skill match then catalog order. */
export function rankCareerFit(input: FitInput): CareerFit[] {
  return CAREER_TRACKS.map((t, i) => ({ fit: careerFit(input, t), i }))
    .sort((a, b) => (b.fit.overall ?? -1) - (a.fit.overall ?? -1) || (b.fit.factors.technical.value ?? -1) - (a.fit.factors.technical.value ?? -1) || a.i - b.i)
    .map((x) => x.fit);
}
