import { describe, expect, it } from "vitest";
import { careerFit, rankCareerFit, type FitInput } from "@/lib/career-fit";
import { trackById } from "@/lib/careers";
import { SKILL_KEYS } from "@/lib/skills";
import type { StudentSkillScores } from "@/lib/api/types";

const skills = (base: number, over: Partial<Record<string, number | null>> = {}) =>
  ({ student_id: "s", ...Object.fromEntries(SKILL_KEYS.map((k) => [k, base])), ...over }) as unknown as StudentSkillScores;
const profile = (over: Partial<FitInput> = {}): FitInput => ({
  student: { degree: "B.Tech", branch: "AI & DS" },
  skills: skills(65),
  experience: { student_id: "s", project_count: 2, internship_count: 1, certification_count: 1, work_experience_months: 0 },
  preferences: { primary_interest: "Data Analytics", secondary_interest: null, preferred_work_role: "Analytics" },
  ...over,
});
// The reported case: strong soft/design skills but a Data Analyst goal.
const designerSkills = skills(62, { creativity_score: 84, communication_score: 80, problem_solving_score: 78, analytical_thinking_score: 76, teamwork_score: 80 });

describe("Overall Career Fit", () => {
  it("uses 40/25/15/10/10 weights", () => {
    const f = careerFit(profile(), trackById("data-analyst")!);
    const v = f.factors;
    expect(f.overall).toBeCloseTo(v.technical.value! * 0.4 + v.interest.value! * 0.25 + v.education.value! * 0.15 + v.experience.value! * 0.1 + v.aptitude.value! * 0.1, 1);
  });
  it("Data Analytics interest lifts Data Analyst above UI/UX despite 100% UI/UX skill match", () => {
    const ranked = rankCareerFit(profile({ skills: designerSkills }));
    const uiux = ranked.find((f) => f.track.id === "ui-ux-designer")!;
    expect(uiux.factors.technical.value).toBe(100);
    expect(ranked[0]!.track.id).toBe("data-analyst");
  });
  it("interest alone does not give a high score", () => {
    const f = careerFit(profile({ skills: skills(20), experience: { student_id: "s", project_count: 0, internship_count: 0, certification_count: 0, work_experience_months: 0 } }), trackById("data-analyst")!);
    expect(f.factors.interest.value).toBe(75);
    expect(f.overall!).toBeLessThan(50);
  });
  it("strong skills still matter: no interest match but strong skills beats weak skills", () => {
    const strong = careerFit(profile({ skills: skills(90), preferences: { primary_interest: "Cybersecurity", secondary_interest: null, preferred_work_role: null } }), trackById("data-analyst")!);
    const weak = careerFit(profile({ skills: skills(30) }), trackById("data-analyst")!);
    expect(strong.overall!).toBeGreaterThan(weak.overall!);
  });
  it("weak skills produce gaps ordered weakest first", () => {
    const f = careerFit(profile({ skills: skills(80, { sql_score: 30, python_score: 50 }) }), trackById("data-analyst")!);
    expect(f.gaps).toEqual(["sql_score", "python_score"]);
  });
  it("scores stay within 0–100", () => {
    for (const b of [0, 100]) for (const f of rankCareerFit(profile({ skills: skills(b) }))) {
      expect(f.overall!).toBeGreaterThanOrEqual(0);
      expect(f.overall!).toBeLessThanOrEqual(100);
    }
  });
  it("missing data is insufficient, never zero", () => {
    const f = careerFit(profile({ experience: null, preferences: null }), trackById("data-analyst")!);
    expect(f.overall).toBeNull();
    expect(f.factors.experience.value).toBeNull();
    expect(f.factors.interest.value).toBeNull();
    expect(f.missingFactors).toEqual(["interest", "experience"]);
  });
  it("invalid scores are not capped", () => {
    const f = careerFit(profile({ skills: skills(70, { sql_score: 140 }) }), trackById("data-analyst")!);
    expect(f.factors.technical.value).toBeNull();
    expect(f.overall).toBeNull();
  });
  it("is deterministic", () => {
    expect(rankCareerFit(profile())).toEqual(rankCareerFit(profile()));
  });
});
