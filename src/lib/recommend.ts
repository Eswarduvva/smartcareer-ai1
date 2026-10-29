import type { CareerRecommendation, SkillKey, StudentExperience, StudentSkillScores } from "./api/types";
import { GAP_THRESHOLD, SCORE_MAX, SKILLS, STRONG_THRESHOLD } from "./skills";
import { CAREER_TRACKS, type CareerTrack } from "./careers";

/**
 * RULE-BASED RECOMMENDATION — not a model, not AI.
 * A future recommendation engine replaces these functions with the same output shape.
 */
export { CAREER_TRACKS, type CareerTrack };

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** A skill value is usable only if it is a finite number on the 0–SCORE_MAX scale. */
export const validSkill = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= SCORE_MAX;

/**
 * Match = mean over key skills of min(score / STRONG_THRESHOLD, 1) × 100. Gap = mean shortfall below STRONG_THRESHOLD.
 * Missing or out-of-range key skills are NOT replaced with 0; any such skill makes the track unscored (null).
 */
export function scoreTrack(skills: StudentSkillScores, t: CareerTrack): { match: number | null; gap: number | null; unscored: SkillKey[] } {
  const unscored = t.skills.filter((k) => !validSkill(skills[k]));
  if (unscored.length) return { match: null, gap: null, unscored };
  const vals = t.skills.map((k) => skills[k] as number);
  const match = (vals.reduce((a, v) => a + Math.min(v / STRONG_THRESHOLD, 1), 0) / vals.length) * 100;
  const gap = vals.reduce((a, v) => a + Math.max(STRONG_THRESHOLD - v, 0), 0) / vals.length;
  return { match: round2(match), gap: round2(gap), unscored };
}

export interface RankedTrack {
  track: CareerTrack;
  match: number | null;
  gap: number | null;
  met: SkillKey[];
  missing: SkillKey[];
  /** Key skills missing or outside 0–100; the track cannot be scored until fixed. */
  unscored: SkillKey[];
}

/** All tracks, best match first (unscored last); ties go to the stated primary interest. */
export function rankTracks(skills: StudentSkillScores, primaryInterest?: string | null): RankedTrack[] {
  const pi = (primaryInterest ?? "").toLowerCase();
  return CAREER_TRACKS.map((track) => {
    const s = scoreTrack(skills, track);
    return {
      track,
      ...s,
      met: track.skills.filter((k) => validSkill(skills[k]) && (skills[k] as number) >= STRONG_THRESHOLD),
      missing: track.skills.filter((k) => validSkill(skills[k]) && (skills[k] as number) < STRONG_THRESHOLD),
    };
  }).sort((a, b) => {
    const am = a.match ?? -1, bm = b.match ?? -1;
    if (bm !== am) return bm - am;
    return Number(b.track.domain.toLowerCase() === pi) - Number(a.track.domain.toLowerCase() === pi);
  });
}

export function recommend(skills: StudentSkillScores, primaryInterest?: string | null): CareerRecommendation {
  const best = rankTracks(skills, primaryInterest)[0]!;
  const ok = best.match !== null;
  return {
    student_id: skills.student_id,
    recommended_career_domain: ok ? best.track.domain : null,
    recommended_role: ok ? best.track.role : null,
    career_match_score: best.match,
    skill_gap_score: best.gap,
  };
}

/**
 * Dataset domains → closest catalog track (by field name). Domains without an equivalent
 * (e.g. Cybersecurity, Business & Product) return undefined and are never borrowed from another track.
 */
const DATASET_DOMAIN_TRACK: Record<string, string> = {
  "software development": "software-developer",
  "software engineering": "software-developer",
  "data & analytics": "data-analyst",
  "data analytics": "data-analyst",
  "ai & machine learning": "data-scientist",
  "data science & ml": "data-scientist",
  "cloud & devops": "cloud-devops",
  "cloud & infrastructure": "cloud-devops",
  "product design": "ui-ux-designer",
};
export function trackForRecorded(role?: string | null, domain?: string | null): CareerTrack | undefined {
  const byRole = CAREER_TRACKS.find((t) => t.role.toLowerCase() === (role ?? "").toLowerCase());
  if (byRole) return byRole;
  const id = DATASET_DOMAIN_TRACK[(domain ?? "").toLowerCase()];
  return CAREER_TRACKS.find((t) => t.id === id);
}

/** A recorded dataset score is shown only when it is finite and on the 0–100 scale; otherwise null (never defaulted). */
export const validPercent = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100 ? round2(v) : null);

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
