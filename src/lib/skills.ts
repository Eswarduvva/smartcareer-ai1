import type { SkillKey, StudentSkillScores } from "./api/types";

/**
 * Score scale assumed by the UI. Adjust if the database uses a different range.
 * Thresholds are display rules, stated in the UI — not model outputs.
 */
export const SCORE_MAX = 100;
export const GAP_THRESHOLD = 60;
export const STRONG_THRESHOLD = 75;

export type SkillGroup = "Technical" | "Reasoning" | "Communication" | "Behavioural";

export const SKILLS: { key: SkillKey; label: string; group: SkillGroup }[] = [
  { key: "python_score", label: "Python", group: "Technical" },
  { key: "sql_score", label: "SQL", group: "Technical" },
  { key: "data_analysis_score", label: "Data Analysis", group: "Technical" },
  { key: "statistics_score", label: "Statistics", group: "Technical" },
  { key: "machine_learning_score", label: "Machine Learning", group: "Technical" },
  { key: "deep_learning_score", label: "Deep Learning", group: "Technical" },
  { key: "programming_score", label: "Programming", group: "Technical" },
  { key: "technical_score", label: "Technical", group: "Technical" },
  { key: "aptitude_score", label: "Aptitude", group: "Reasoning" },
  { key: "logical_reasoning_score", label: "Logical Reasoning", group: "Reasoning" },
  { key: "problem_solving_score", label: "Problem Solving", group: "Reasoning" },
  { key: "analytical_thinking_score", label: "Analytical Thinking", group: "Reasoning" },
  { key: "communication_score", label: "Communication", group: "Communication" },
  { key: "english_score", label: "English", group: "Communication" },
  { key: "creativity_score", label: "Creativity", group: "Behavioural" },
  { key: "leadership_score", label: "Leadership", group: "Behavioural" },
  { key: "teamwork_score", label: "Teamwork", group: "Behavioural" },
  { key: "adaptability_score", label: "Adaptability", group: "Behavioural" },
  { key: "learning_interest_score", label: "Learning Interest", group: "Behavioural" },
];

export const SKILL_KEYS = SKILLS.map((s) => s.key);
export const GROUPS: SkillGroup[] = ["Technical", "Reasoning", "Communication", "Behavioural"];
export const skillLabel = (k: SkillKey) => SKILLS.find((s) => s.key === k)?.label ?? k;

export interface ScoredSkill {
  key: SkillKey;
  label: string;
  group: SkillGroup;
  score: number;
}

export function scoredSkills(s: StudentSkillScores | null): ScoredSkill[] {
  if (!s) return [];
  return SKILLS.flatMap((d) => {
    const v = s[d.key];
    return typeof v === "number" ? [{ ...d, score: v }] : [];
  });
}

export const sortDesc = (xs: ScoredSkill[]) => [...xs].sort((a, b) => b.score - a.score);

export function groupAverages(xs: ScoredSkill[]) {
  return GROUPS.map((g) => {
    const v = xs.filter((x) => x.group === g);
    return { group: g, value: v.length ? v.reduce((a, b) => a + b.score, 0) / v.length : null, count: v.length };
  });
}

export const fmt = (n: number | null | undefined, d = 1) =>
  typeof n === "number" ? n.toFixed(d).replace(/\.0+$/, "") : "—";
