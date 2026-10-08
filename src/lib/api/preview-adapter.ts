/**
 * DEMO DATA ADAPTER — NOT REAL DATA. Reads src/lib/mock.
 *
 * Used only when VITE_DATA_SOURCE=preview or before the Cloud database is configured.
 * Records are illustrative and generated deterministically; they are never
 * mixed with API data. The UI shows a "Preview data" badge whenever this is active.
 */
import type {
  AnalyticsOverview,
  ApiAdapter,
  Bucket,
  StudentRecord,
} from "./types";
import { GAP_THRESHOLD, SKILL_KEYS, skillLabel } from "../skills";
import { mockActivity, mockStudents, toSummary } from "../mock";

const RECORDS: StudentRecord[] = mockStudents;

const wait = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const avg = (xs: (number | null | undefined)[]) => {
  const v = xs.filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
function bucketize(values: number[], edges: number[], fmt: (a: number, b: number) => string): Bucket[] {
  return edges.slice(0, -1).map((a, i) => {
    const b = edges[i + 1]!;
    return { label: fmt(a, b), count: values.filter((v) => v >= a && (i === edges.length - 2 ? v <= b : v < b)).length };
  });
}

export const previewAdapter: ApiAdapter = {
  kind: "preview",
  async listStudents(p) {
    await wait();
    const q = p.q?.toLowerCase().trim();
    let items = RECORDS.map(toSummary).filter((s) => {
      if (q && ![s.student_id, s.full_name, s.city, s.branch, s.specialization, s.role].some((f) => f?.toLowerCase().includes(q))) return false;
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
  async getAnalytics(f): Promise<AnalyticsOverview> {
    await wait();
    const ALL = RECORDS;
    const RS = ALL.filter((r) => (!f?.degree || r.student.degree === f.degree) && (!f?.branch || r.student.branch === f.branch));
    const cg = RS.map((r) => r.student.cgpa ?? 0);
    const rd = RS.map((r) => r.goals?.career_readiness_score ?? 0);
    const domains = new Map<string, number>();
    RS.forEach((r) => {
      const d = r.recommendation?.recommended_career_domain ?? "Unknown";
      domains.set(d, (domains.get(d) ?? 0) + 1);
    });
    const count = (xs: string[]) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
    const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))].sort();
    return {
      student_count: RS.length,
      avg_cgpa: avg(cg),
      avg_readiness: avg(rd),
      avg_match: avg(RS.map((r) => r.recommendation?.career_match_score)),
      avg_gap: avg(RS.map((r) => r.recommendation?.skill_gap_score)),
      cgpa_distribution: bucketize(cg, [5, 6, 7, 8, 9, 10], (a, b) => `${a}–${b}`),
      readiness_distribution: bucketize(rd, [0, 20, 40, 60, 80, 100], (a, b) => `${a}–${b}`),
      domains: [...domains].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      avg_skills: SKILL_KEYS.map((key) => ({ key, value: avg(RS.map((r) => r.skills?.[key])) ?? 0 })),
      interests: count(RS.map((r) => r.preferences?.primary_interest ?? "Unknown")),
      common_gaps: SKILL_KEYS.map((k) => ({ label: skillLabel(k), count: RS.filter((r) => (r.skills?.[k] ?? 100) < GAP_THRESHOLD).length }))
        .filter((b) => b.count > 0).sort((a, b) => b.count - a.count).slice(0, 6),
      activity: mockActivity,
      degrees: uniq(ALL.map((r) => r.student.degree)),
      branches: uniq(ALL.map((r) => r.student.branch)),
    };
  },
};
