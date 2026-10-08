import type { CareerRecommendation, SkillKey, StudentExperience, StudentSkillScores } from "./api/types";
import { GAP_THRESHOLD, SCORE_MAX, SKILLS, STRONG_THRESHOLD } from "./skills";
import { CAREER_TRACKS, type CareerTrack } from "./careers";

/**
 * RULE-BASED RECOMMENDATION — not a model, not AI.
 * A future recommendation engine replaces these functions with the same output shape.
 */
export { CAREER_TRACKS, type CareerTrack };

const round1 = (n: number) => Math.round(n * 10) / 10;

export function scoreTrack(skills: StudentSkillScores, t: CareerTrack) {
  const vals = t.skills.map((k) => skills[k] ?? 0);
  const match = (vals.reduce((a, v) => a + Math.min(v / STRONG_THRESHOLD, 1), 0) / vals.length) * 100;
  const gap = vals.reduce((a, v) => a + Math.max(STRONG_THRESHOLD - v, 0), 0) / vals.length;
  return { match: round1(match), gap: round1(gap) };
}

export interface RankedTrack {
  track: CareerTrack;
  match: number;
  gap: number;
  met: SkillKey[];
  missing: SkillKey[];
}

/** All tracks, best match first; ties go to the stated primary interest. */
export function rankTracks(skills: StudentSkillScores, primaryInterest?: string | null): RankedTrack[] {
  const pi = (primaryInterest ?? "").toLowerCase();
  return CAREER_TRACKS.map((track) => ({
    track,
    ...scoreTrack(skills, track),
    met: track.skills.filter((k) => (skills[k] ?? 0) >= STRONG_THRESHOLD),
    missing: track.skills.filter((k) => (skills[k] ?? 0) < STRONG_THRESHOLD),
  })).sort((a, b) => {
    if (b.match !== a.match) return b.match - a.match;
    return Number(b.track.domain.toLowerCase() === pi) - Number(a.track.domain.toLowerCase() === pi);
  });
}

export function recommend(skills: StudentSkillScores, primaryInterest?: string | null): CareerRecommendation {
  const best = rankTracks(skills, primaryInterest)[0]!;
  return {
    student_id: skills.student_id,
    recommended_career_domain: best.track.domain,
    recommended_role: best.track.role,
    career_match_score: best.match,
    skill_gap_score: best.gap,
  };
}

/**
 * Career readiness (0–100), rule-based:
 * 70% average skill score + projects (3 pts each, max 4) + internships (6 each, max 2) + certifications (2 each, max 3).
 */
export function readinessScore(skills: StudentSkillScores | null, exp: StudentExperience | null): number | null {
  if (!skills) return null;
  const vals = SKILLS.map((s) => skills[s.key]).filter((v): v is number => typeof v === "number");
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const e = exp ?? { project_count: 0, internship_count: 0, certification_count: 0 };
  const bonus =
    Math.min(e.project_count ?? 0, 4) * 3 + Math.min(e.internship_count ?? 0, 2) * 6 + Math.min(e.certification_count ?? 0, 3) * 2;
  return round1(Math.min(100, (avg / SCORE_MAX) * 70 + bonus));
}

export type GapPriority = "High" | "Medium" | "Low";

/**
 * Gap priority rule:
 * High = key skill for the recommended career below GAP_THRESHOLD.
 * Medium = key skill between GAP_THRESHOLD and STRONG_THRESHOLD, or any other skill below GAP_THRESHOLD.
 * Low = any other skill below STRONG_THRESHOLD.
 */
export function gapPriority(score: number, isKey: boolean): GapPriority | null {
  if (score >= STRONG_THRESHOLD) return null;
  if (isKey) return score < GAP_THRESHOLD ? "High" : "Medium";
  return score < GAP_THRESHOLD ? "Medium" : "Low";
}
