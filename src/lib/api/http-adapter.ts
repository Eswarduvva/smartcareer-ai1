import type {
  AnalyticsOverview,
  ApiAdapter,
  CareerGoals,
  CareerPreferences,
  CareerRecommendation,
  Student,
  StudentExperience,
  StudentListParams,
  StudentListResult,
  StudentSkillScores,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

/** Real adapter: talks to the FastAPI backend at VITE_API_BASE_URL. */
export function createHttpAdapter(baseUrl: string): ApiAdapter {
  const base = baseUrl.replace(/\/$/, "");

  async function get<T>(path: string, allow404 = false): Promise<T | null> {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, { headers: { Accept: "application/json" } });
    } catch {
      throw new ApiError("The SmartCareer API could not be reached.");
    }
    if (allow404 && res.status === 404) return null;
    if (!res.ok) throw new ApiError(`API request failed (${res.status})`, res.status);
    return (await res.json()) as T;
  }

  return {
    kind: "http",
    async listStudents(p: StudentListParams) {
      const qs = new URLSearchParams();
      if (p.q) qs.set("q", p.q);
      if (p.degree) qs.set("degree", p.degree);
      if (p.branch) qs.set("branch", p.branch);
      if (p.minCgpa != null) qs.set("min_cgpa", String(p.minCgpa));
      qs.set("page", String(p.page ?? 1));
      qs.set("page_size", String(p.pageSize ?? 25));
      const data = await get<StudentListResult | Student[]>(`/students?${qs}`);
      // Accept either a paginated envelope or a plain array.
      if (Array.isArray(data)) {
        return { items: data, total: data.length, page: 1, pageSize: data.length };
      }
      return data!;
    },
    async getStudentRecord(id) {
      const e = encodeURIComponent(id);
      const student = await get<Student>(`/students/${e}`, true);
      if (!student) return null;
      const [skills, experience, preferences, goals, recommendation] = await Promise.all([
        get<StudentSkillScores>(`/students/${e}/skills`, true),
        get<StudentExperience>(`/students/${e}/experience`, true),
        get<CareerPreferences>(`/students/${e}/preferences`, true),
        get<CareerGoals>(`/students/${e}/goals`, true),
        get<CareerRecommendation>(`/students/${e}/recommendations`, true),
      ]);
      return { student, skills, experience, preferences, goals, recommendation };
    },
    async getAnalytics() {
      return (await get<AnalyticsOverview>(`/analytics/overview`))!;
    },
  };
}
