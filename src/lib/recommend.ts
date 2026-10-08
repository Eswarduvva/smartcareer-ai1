import type { CareerRecommendation, SkillKey, StudentSkillScores } from "./api/types";
import { STRONG_THRESHOLD } from "./skills";

/**
 * RULE-BASED RECOMMENDATION — not a model, not AI.
 * Used only for self-entered profiles that have no career_recommendations row.
 * A future recommendation engine replaces `recommend()` with the same output shape.
 */
export interface CareerTrack {
  domain: string;
  role: string;
  skills: SkillKey[];
}

/** Each required skill targets STRONG_THRESHOLD. */
export const CAREER_TRACKS: CareerTrack[] = [
  { domain: "AI & Machine Learning", role: "Machine Learning Engineer", skills: ["python_score", "machine_learning_score", "deep_learning_score", "statistics_score", "programming_score"] },
  { domain: "Data Science", role: "Data Analyst", skills: ["data_analysis_score", "sql_score", "statistics_score", "python_score", "analytical_thinking_score"] },
  { domain: "Software Engineering", role: "Software Developer", skills: ["programming_score", "technical_score", "problem_solving_score", "logical_reasoning_score", "teamwork_score"] },
  { domain: "Business Analytics", role: "Business Analyst", skills: ["data_analysis_score", "communication_score", "analytical_thinking_score", "english_score", "sql_score"] },
  { domain: "Product Management", role: "Associate Product Manager", skills: ["communication_score", "leadership_score", "analytical_thinking_score", "creativity_score", "problem_solving_score"] },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

export function scoreTrack(skills: StudentSkillScores, t: CareerTrack) {
  const vals = t.skills.map((k) => skills[k] ?? 0);
  const match = (vals.reduce((a, v) => a + Math.min(v / STRONG_THRESHOLD, 1), 0) / vals.length) * 100;
  const gap = vals.reduce((a, v) => a + Math.max(STRONG_THRESHOLD - v, 0), 0) / vals.length;
  return { match: round1(match), gap: round1(gap) };
}

/** Highest match wins; ties go to the track matching the stated primary interest. */
export function recommend(skills: StudentSkillScores, primaryInterest?: string | null): CareerRecommendation {
  const ranked = CAREER_TRACKS.map((t) => ({ t, ...scoreTrack(skills, t) })).sort((a, b) => {
    if (b.match !== a.match) return b.match - a.match;
    const pi = (primaryInterest ?? "").toLowerCase();
    return Number(b.t.domain.toLowerCase() === pi) - Number(a.t.domain.toLowerCase() === pi);
  });
  const best = ranked[0]!;
  return {
    student_id: skills.student_id,
    recommended_career_domain: best.t.domain,
    recommended_role: best.t.role,
    career_match_score: best.match,
    skill_gap_score: best.gap,
  };
}
