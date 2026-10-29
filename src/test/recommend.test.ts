import { describe, expect, it } from "vitest";
import { gapPriority, readinessScore, recommend, scoreTrack, trackForRecorded, validPercent, CAREER_TRACKS } from "@/lib/recommend";
import { SKILL_KEYS } from "@/lib/skills";
import type { StudentSkillScores } from "@/lib/api/types";

const base = (v: number, over: Partial<StudentSkillScores> = {}) =>
  ({ student_id: "T", ...Object.fromEntries(SKILL_KEYS.map((k) => [k, v])), ...over }) as StudentSkillScores;

describe("rule-based recommendation", () => {
  it("a skill at or above 75 counts fully toward the match", () => {
    expect(scoreTrack(base(90), CAREER_TRACKS[0]!)).toEqual({ match: 100, gap: 0, unscored: [] });
  });

  it("gap is the average shortfall below 75", () => {
    expect(scoreTrack(base(60), CAREER_TRACKS[0]!).gap).toBe(15);
  });

  it("picks Data Scientist when ML skills dominate", () => {
    const s = base(40, { python_score: 90, machine_learning_score: 90, deep_learning_score: 85, statistics_score: 80, data_analysis_score: 85 });
    expect(recommend(s).recommended_role).toBe("Data Scientist");
  });

  it("breaks ties with the stated primary interest", () => {
    expect(recommend(base(80), "Product Design").recommended_role).toBe("UI/UX Designer");
  });

  it("offers the five career tracks", () => {
    expect(CAREER_TRACKS.map((t) => t.role)).toEqual(["Software Developer", "Data Analyst", "Data Scientist", "UI/UX Designer", "Cloud/DevOps Engineer"]);
  });
});

describe("readiness and gap priority", () => {
  it("readiness = 70% of average skill plus capped experience points", () => {
    expect(readinessScore(base(100), { student_id: "T", project_count: 9, internship_count: 5, certification_count: 9, work_experience_months: 0 })).toBe(100);
    expect(readinessScore(base(50), { student_id: "T", project_count: 1, internship_count: 0, certification_count: 0, work_experience_months: 0 })).toBe(38);
  });

  it("key skills below 60 are high priority", () => {
    expect(gapPriority(55, true)).toBe("High");
    expect(gapPriority(65, true)).toBe("Medium");
    expect(gapPriority(55, false)).toBe("Medium");
    expect(gapPriority(65, false)).toBe("Low");
    expect(gapPriority(80, true)).toBeNull();
  });
});

describe("career match score validation", () => {
  it("a missing key skill leaves the track unscored instead of counting as zero", () => {
    const r = scoreTrack(base(80, { programming_score: null }), CAREER_TRACKS[0]!);
    expect(r.match).toBeNull();
    expect(r.unscored).toEqual(["programming_score"]);
  });
  it("a key skill above 100 is invalid, not clamped", () => {
    expect(scoreTrack(base(80, { programming_score: 140 }), CAREER_TRACKS[0]!).match).toBeNull();
  });
  it("scores round to two decimals", () => {
    // four skills at 75 (100%) + one at 70 (93.333…%) → 98.67
    expect(scoreTrack(base(75, { teamwork_score: 70 }), CAREER_TRACKS[0]!).match).toBe(98.67);
  });
  it("recorded scores outside 0–100 are rejected, valid ones kept", () => {
    expect(validPercent(80.52)).toBe(80.52);
    expect(validPercent(120)).toBeNull();
    expect(validPercent(NaN)).toBeNull();
    expect(validPercent(null)).toBeNull();
  });
  it("dataset fields without an equivalent track are not mapped to another track", () => {
    expect(trackForRecorded("SOC Analyst", "Cybersecurity")).toBeUndefined();
    expect(trackForRecorded("Cloud Engineer", "Cloud & DevOps")?.id).toBe("cloud-devops");
  });
  it("no recommendation is made when every track is unscored", () => {
    const r = recommend(base(Number.NaN));
    expect(r.recommended_role).toBeNull();
    expect(r.career_match_score).toBeNull();
  });
});
