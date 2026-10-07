// Mirrors the six normalized tables in smartcareer_db.

export interface Student {
  student_id: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  degree: string | null;
  branch: string | null;
  specialization: string | null;
  college_type: string | null;
  graduation_year: number | null;
  cgpa: number | null;
  backlogs: number | null;
  higher_education_interest: string | null;
}

export interface StudentSkillScores {
  student_id: string;
  python_score: number | null;
  sql_score: number | null;
  data_analysis_score: number | null;
  statistics_score: number | null;
  machine_learning_score: number | null;
  deep_learning_score: number | null;
  programming_score: number | null;
  technical_score: number | null;
  aptitude_score: number | null;
  logical_reasoning_score: number | null;
  problem_solving_score: number | null;
  communication_score: number | null;
  english_score: number | null;
  analytical_thinking_score: number | null;
  creativity_score: number | null;
  leadership_score: number | null;
  teamwork_score: number | null;
  adaptability_score: number | null;
  learning_interest_score: number | null;
}

export type SkillKey = Exclude<keyof StudentSkillScores, "student_id">;

export interface StudentExperience {
  student_id: string;
  project_count: number | null;
  internship_count: number | null;
  certification_count: number | null;
  work_experience_months: number | null;
}

export interface CareerPreferences {
  student_id: string;
  primary_interest: string | null;
  secondary_interest: string | null;
  preferred_industry: string | null;
  preferred_work_role: string | null;
  preferred_work_mode: string | null;
  preferred_location: string | null;
  willing_to_relocate: string | null;
}

export interface CareerGoals {
  student_id: string;
  career_goal: string | null;
  expected_salary: number | null;
  study_hours_per_week: number | null;
  career_readiness_score: number | null;
}

export interface CareerRecommendation {
  student_id: string;
  recommended_career_domain: string | null;
  recommended_role: string | null;
  career_match_score: number | null;
  skill_gap_score: number | null;
}

/** Everything known about one student, joined client-side from the per-table endpoints. */
export interface StudentRecord {
  student: Student;
  skills: StudentSkillScores | null;
  experience: StudentExperience | null;
  preferences: CareerPreferences | null;
  goals: CareerGoals | null;
  recommendation: CareerRecommendation | null;
}

export interface StudentListParams {
  q?: string | undefined;
  degree?: string | undefined;
  branch?: string | undefined;
  minCgpa?: number | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export interface StudentListResult {
  items: Student[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Bucket {
  label: string;
  count: number;
}

export interface AnalyticsOverview {
  student_count: number;
  avg_cgpa: number | null;
  avg_readiness: number | null;
  avg_match: number | null;
  avg_gap: number | null;
  cgpa_distribution: Bucket[];
  readiness_distribution: Bucket[];
  domains: Bucket[];
  avg_skills: { key: SkillKey; value: number }[];
}

export interface ApiAdapter {
  readonly kind: "http" | "preview";
  listStudents(params: StudentListParams): Promise<StudentListResult>;
  getStudentRecord(id: string): Promise<StudentRecord | null>;
  getAnalytics(): Promise<AnalyticsOverview>;
}
