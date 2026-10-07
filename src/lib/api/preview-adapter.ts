/**
 * DEVELOPMENT PREVIEW ADAPTER — NOT REAL DATA.
 *
 * Used only while VITE_API_BASE_URL is unset so screens can be reviewed.
 * Records are illustrative and generated deterministically; they are never
 * mixed with API data. The UI shows a "Preview data" badge whenever this is active.
 */
import type {
  AnalyticsOverview,
  ApiAdapter,
  Bucket,
  SkillKey,
  StudentRecord,
} from "./types";
import { SKILL_KEYS } from "../skills";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PROFILES = [
  { degree: "B.Tech", branch: "Computer Science", spec: "Data Science", domain: "Data Science", role: "Data Analyst", city: "Hyderabad", state: "Telangana" },
  { degree: "B.Tech", branch: "Electronics", spec: "Embedded Systems", domain: "Software Engineering", role: "Backend Developer", city: "Pune", state: "Maharashtra" },
  { degree: "B.Sc", branch: "Statistics", spec: "Applied Statistics", domain: "Data Science", role: "Business Analyst", city: "Chennai", state: "Tamil Nadu" },
  { degree: "B.Tech", branch: "Information Technology", spec: "AI & ML", domain: "Artificial Intelligence", role: "Machine Learning Engineer", city: "Bengaluru", state: "Karnataka" },
  { degree: "BCA", branch: "Computer Applications", spec: "Web Technologies", domain: "Software Engineering", role: "Frontend Developer", city: "Kochi", state: "Kerala" },
  { degree: "MBA", branch: "Business Analytics", spec: "Marketing Analytics", domain: "Business Analytics", role: "Product Analyst", city: "Delhi", state: "Delhi" },
];

function build(i: number): StudentRecord {
  const r = rng(i * 7919 + 13);
  const p = PROFILES[i % PROFILES.length];
  const id = `PRV-${String(i + 1).padStart(3, "0")}`;
  const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;
  const skillEntries = SKILL_KEYS.map((k) => [k, round(35 + r() * 60)] as const);
  const skills = Object.fromEntries(skillEntries) as Record<SkillKey, number>;
  return {
    student: {
      student_id: id,
      age: 20 + Math.floor(r() * 5),
      gender: r() > 0.5 ? "Female" : "Male",
      city: p.city,
      state: p.state,
      degree: p.degree,
      branch: p.branch,
      specialization: p.spec,
      college_type: r() > 0.5 ? "Private" : "Government",
      graduation_year: 2025 + Math.floor(r() * 3),
      cgpa: round(6 + r() * 3.6, 2),
      backlogs: r() > 0.75 ? 1 : 0,
      higher_education_interest: r() > 0.6 ? "Yes" : "No",
    },
    skills: { student_id: id, ...skills },
    experience: {
      student_id: id,
      project_count: Math.floor(r() * 6),
      internship_count: Math.floor(r() * 3),
      certification_count: Math.floor(r() * 5),
      work_experience_months: Math.floor(r() * 10),
    },
    preferences: {
      student_id: id,
      primary_interest: p.domain,
      secondary_interest: "Research",
      preferred_industry: "Technology",
      preferred_work_role: p.role,
      preferred_work_mode: r() > 0.5 ? "Hybrid" : "On-site",
      preferred_location: p.city,
      willing_to_relocate: r() > 0.4 ? "Yes" : "No",
    },
    goals: {
      student_id: id,
      career_goal: p.role,
      expected_salary: Math.round(4 + r() * 10) * 100000,
      study_hours_per_week: Math.round(6 + r() * 20),
      career_readiness_score: round(40 + r() * 50, 1),
    },
    recommendation: {
      student_id: id,
      recommended_career_domain: p.domain,
      recommended_role: p.role,
      career_match_score: round(55 + r() * 40, 1),
      skill_gap_score: round(10 + r() * 40, 1),
    },
  };
}

const RECORDS: StudentRecord[] = Array.from({ length: 12 }, (_, i) => build(i));

const wait = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const avg = (xs: (number | null | undefined)[]) => {
  const v = xs.filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
function bucketize(values: number[], edges: number[], fmt: (a: number, b: number) => string): Bucket[] {
  return edges.slice(0, -1).map((a, i) => {
    const b = edges[i + 1];
    return { label: fmt(a, b), count: values.filter((v) => v >= a && (i === edges.length - 2 ? v <= b : v < b)).length };
  });
}

export const previewAdapter: ApiAdapter = {
  kind: "preview",
  async listStudents(p) {
    await wait();
    const q = p.q?.toLowerCase().trim();
    let items = RECORDS.map((r) => r.student).filter((s) => {
      if (q && ![s.student_id, s.city, s.branch, s.specialization].some((f) => f?.toLowerCase().includes(q))) return false;
      if (p.degree && s.degree !== p.degree) return false;
      if (p.branch && s.branch !== p.branch) return false;
      if (p.minCgpa != null && (s.cgpa ?? 0) < p.minCgpa) return false;
      return true;
    });
    const total = items.length;
    const page = p.page ?? 1;
    const pageSize = p.pageSize ?? 25;
    items = items.slice((page - 1) * pageSize, page * pageSize);
    return { items, total, page, pageSize };
  },
  async getStudentRecord(id) {
    await wait();
    return RECORDS.find((r) => r.student.student_id === id) ?? null;
  },
  async getAnalytics(): Promise<AnalyticsOverview> {
    await wait();
    const cg = RECORDS.map((r) => r.student.cgpa ?? 0);
    const rd = RECORDS.map((r) => r.goals?.career_readiness_score ?? 0);
    const domains = new Map<string, number>();
    RECORDS.forEach((r) => {
      const d = r.recommendation?.recommended_career_domain ?? "Unknown";
      domains.set(d, (domains.get(d) ?? 0) + 1);
    });
    return {
      student_count: RECORDS.length,
      avg_cgpa: avg(cg),
      avg_readiness: avg(rd),
      avg_match: avg(RECORDS.map((r) => r.recommendation?.career_match_score)),
      avg_gap: avg(RECORDS.map((r) => r.recommendation?.skill_gap_score)),
      cgpa_distribution: bucketize(cg, [5, 6, 7, 8, 9, 10], (a, b) => `${a}–${b}`),
      readiness_distribution: bucketize(rd, [0, 20, 40, 60, 80, 100], (a, b) => `${a}–${b}`),
      domains: [...domains].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      avg_skills: SKILL_KEYS.map((key) => ({ key, value: avg(RECORDS.map((r) => r.skills?.[key])) ?? 0 })),
    };
  },
};
