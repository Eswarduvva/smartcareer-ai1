import { supabase } from "@/integrations/supabase/client";
import type { AnalyticsOverview, ApiAdapter, StudentRecord } from "./types";

export class DataError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
  }
}

const UNREACHABLE = "Unable to connect to SmartCareer data.";

function fail(e: unknown): never {
  if (typeof console !== "undefined") console.error("[data]", e);
  throw new DataError(UNREACHABLE, e);
}

const num = (v: unknown) => (v == null ? null : Number(v));

function numerify<T extends Record<string, unknown>>(row: T | null, skip: string[] = []): T | null {
  if (!row) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = skip.includes(k) || typeof v !== "string" || isNaN(Number(v)) ? v : Number(v);
  }
  return out as T;
}

const one = <T,>(x: T | T[] | null | undefined): T | null => (Array.isArray(x) ? (x[0] ?? null) : (x ?? null));

/** Production adapter: reads the six normalized tables in Lovable Cloud. Read-only. */
export const supabaseAdapter: ApiAdapter = {
  kind: "supabase",
  async listStudents(p) {
    const size = p.pageSize ?? 25;
    const page = p.page ?? 1;
    let q = supabase.from("students").select("*", { count: "exact" });
    if (p.q) {
      const t = p.q.replace(/[,%()]/g, " ").trim();
      if (t) q = q.or(`student_id.ilike.%${t}%,branch.ilike.%${t}%,city.ilike.%${t}%,degree.ilike.%${t}%`);
    }
    if (p.degree) q = q.eq("degree", p.degree);
    if (p.branch) q = q.eq("branch", p.branch);
    if (p.minCgpa != null) q = q.gte("cgpa", p.minCgpa);
    const { data, error, count } = await q.order("student_id").range((page - 1) * size, page * size - 1);
    if (error) fail(error);
    return {
      items: (data ?? []).map((s) => ({ ...s, cgpa: num(s.cgpa) })),
      total: count ?? 0,
      page,
      pageSize: size,
    };
  },
  async getStudentRecord(id) {
    const { data, error } = await supabase
      .from("students")
      .select("*, student_skill_scores(*), student_experience(*), career_preferences(*), career_goals(*), career_recommendations(*)")
      .eq("student_id", id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const { student_skill_scores, student_experience, career_preferences, career_goals, career_recommendations, ...student } = data as Record<string, unknown>;
    return {
      student: { ...(student as StudentRecord["student"]), cgpa: num(student["cgpa"]) },
      skills: numerify(one(student_skill_scores as never), ["student_id"]),
      experience: numerify(one(student_experience as never), ["student_id"]),
      preferences: one(career_preferences as never),
      goals: numerify(one(career_goals as never), ["student_id", "career_goal"]),
      recommendation: numerify(one(career_recommendations as never), ["student_id", "recommended_career_domain", "recommended_role"]),
    } as StudentRecord;
  },
  async getAnalytics(f) {
    const { data, error } = await supabase.rpc("get_analytics", {
      p_degree: f?.degree ?? undefined,
      p_branch: f?.branch ?? undefined,
    } as never);
    if (error) fail(error);
    return data as unknown as AnalyticsOverview;
  },
};
