import { queryOptions } from "@tanstack/react-query";
import { api } from "./client";
import type { StudentListParams } from "./types";

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

export const analyticsQuery = () =>
  queryOptions({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(),
    staleTime: 5 * 60_000,
  });
