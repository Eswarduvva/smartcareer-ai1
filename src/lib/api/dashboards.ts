import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataError } from "./supabase-adapter";
import type { Bucket, StudentRecord } from "./types";

export const DASHBOARD_SKILLS = ["python_score", "sql_score", "data_analysis_score", "machine_learning_score", "communication_score"] as const;
export type DashboardSkill = (typeof DASHBOARD_SKILLS)[number];

export interface DashboardAnalytics {
  student_count: number;
  avg_cgpa: number | null;
  avg_readiness: number | null;
  avg_match: number | null;
  avg_gap: number | null;
  goals: Bucket[];
  readiness_by_degree: { label: string; value: number; count: number }[];
  domains: Bucket[];
  skills: Record<DashboardSkill, number | null>;
  degrees: string[];
  branches: string[];
}

export interface Benchmark { avg_readiness: number | null; avg_gap: number | null; avg_match: number | null; avg_cgpa: number | null }
export type MyCohort = { linked: false } | { linked: true; record: StudentRecord; benchmark: Benchmark };

const n = (v: unknown) => (v == null ? null : Number(v));

/** Cohort analytics scoped by the database's existing row policies (admins see all rows). */
export const dashboardQuery = (f: { degree?: string | undefined; branch?: string | undefined }) =>
  queryOptions({
    queryKey: ["dashboard-analytics", f],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<DashboardAnalytics> => {
      const { data, error } = await supabase.rpc("get_dashboard_analytics", { p_degree: f.degree ?? undefined, p_branch: f.branch ?? undefined } as never);
      if (error) throw new DataError("Unable to connect to SmartCareer data.", error);
      const d = data as unknown as DashboardAnalytics;
      return {
        ...d,
        avg_cgpa: n(d.avg_cgpa), avg_readiness: n(d.avg_readiness), avg_match: n(d.avg_match), avg_gap: n(d.avg_gap),
        readiness_by_degree: d.readiness_by_degree.map((x) => ({ ...x, value: Number(x.value) })),
        skills: Object.fromEntries(DASHBOARD_SKILLS.map((k) => [k, n(d.skills?.[k])])) as DashboardAnalytics["skills"],
        degrees: [...(d.degrees ?? [])].sort(), branches: [...(d.branches ?? [])].sort(),
      };
    },
  });

function numerify(row: Record<string, unknown> | null, keep: string[]) {
  if (!row) return null;
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, keep.includes(k) || v == null || isNaN(Number(v)) ? v : Number(v)]));
}

/** The signed-in student's admin-approved cohort record and aggregate benchmarks only. */
export const myCohortQuery = (uid: string | undefined) =>
  queryOptions({
    queryKey: ["my-cohort", uid],
    enabled: !!uid,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<MyCohort> => {
      const { data, error } = await supabase.rpc("get_my_cohort_dashboard" as never);
      if (error) throw new DataError("Unable to connect to SmartCareer data.", error);
      const d = data as unknown as { linked: boolean; record?: Record<string, Record<string, unknown> | null>; benchmark?: Record<string, unknown> };
      if (!d.linked || !d.record?.["student"]) return { linked: false };
      const r = d.record;
      const text = ["student_id", "gender", "city", "state", "degree", "branch", "specialization", "college_type", "higher_education_interest", "career_goal", "recommended_career_domain", "recommended_role"];
      return {
        linked: true,
        record: {
          student: numerify(r["student"]!, text),
          skills: numerify(r["skills"] ?? null, text),
          experience: numerify(r["experience"] ?? null, text),
          preferences: r["preferences"] ?? null,
          goals: numerify(r["goals"] ?? null, text),
          recommendation: numerify(r["recommendation"] ?? null, text),
        } as unknown as StudentRecord,
        benchmark: Object.fromEntries(Object.entries(d.benchmark ?? {}).map(([k, v]) => [k, n(v)])) as unknown as Benchmark,
      };
    },
  });
