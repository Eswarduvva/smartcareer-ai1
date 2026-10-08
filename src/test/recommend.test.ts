import { describe, expect, it } from "vitest";
import { recommend, scoreTrack, CAREER_TRACKS } from "@/lib/recommend";
import { SKILL_KEYS } from "@/lib/skills";
import type { StudentSkillScores } from "@/lib/api/types";

const base = (v: number, over: Partial<StudentSkillScores> = {}) =>
  ({ student_id: "T", ...Object.fromEntries(SKILL_KEYS.map((k) => [k, v])), ...over }) as StudentSkillScores;

describe("rule-based recommendation", () => {
  it("a skill at or above 75 counts fully toward the match", () => {
    expect(scoreTrack(base(90), CAREER_TRACKS[0]!)).toEqual({ match: 100, gap: 0 });
  });

  it("gap is the average shortfall below 75", () => {
    expect(scoreTrack(base(60), CAREER_TRACKS[0]!).gap).toBe(15);
  });

  it("picks the ML track when ML skills dominate", () => {
    const s = base(40, { python_score: 90, machine_learning_score: 90, deep_learning_score: 85, statistics_score: 80, programming_score: 85 });
    expect(recommend(s).recommended_role).toBe("Machine Learning Engineer");
  });

  it("breaks ties with the stated primary interest", () => {
    expect(recommend(base(80), "Product Management").recommended_career_domain).toBe("Product Management");
  });
});
