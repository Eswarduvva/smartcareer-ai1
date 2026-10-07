import { queryOptions } from "@tanstack/react-query";
import { api } from "./client";
import type { AnalyticsFilters, StudentListParams } from "./types";

export const studentsQuery = (p: StudentListParams) =>
  queryOptions({
    queryKey: ["students", p],
    queryFn: () => api.listStudents(p),
    staleTime: 60_000,
  });

export const studentRecordQuery = (id: string) =>
  queryOptions({
    queryKey: ["student", id],
    queryFn: () => api.getStudentRecord(id),
    staleTime: 60_000,
  });

export const analyticsQuery = (f: AnalyticsFilters = {}) =>
  queryOptions({
    queryKey: ["analytics", f],
    queryFn: () => api.getAnalytics(f),
    staleTime: 5 * 60_000,
  });
