CREATE TABLE public.students (
  student_id text PRIMARY KEY,
  age integer, gender text, city text, state text, degree text, branch text,
  specialization text, college_type text, graduation_year integer,
  cgpa numeric(4,2), backlogs integer, higher_education_interest text
);
CREATE TABLE public.student_skill_scores (
  student_id text PRIMARY KEY REFERENCES public.students(student_id) ON DELETE CASCADE,
  python_score numeric, sql_score numeric, data_analysis_score numeric, statistics_score numeric,
  machine_learning_score numeric, deep_learning_score numeric, programming_score numeric,
  technical_score numeric, aptitude_score numeric, logical_reasoning_score numeric,
  problem_solving_score numeric, communication_score numeric, english_score numeric,
  analytical_thinking_score numeric, creativity_score numeric, leadership_score numeric,
  teamwork_score numeric, adaptability_score numeric, learning_interest_score numeric
);
CREATE TABLE public.student_experience (
  student_id text PRIMARY KEY REFERENCES public.students(student_id) ON DELETE CASCADE,
  project_count integer, internship_count integer, certification_count integer, work_experience_months integer
);
CREATE TABLE public.career_preferences (
  student_id text PRIMARY KEY REFERENCES public.students(student_id) ON DELETE CASCADE,
  primary_interest text, secondary_interest text, preferred_industry text, preferred_work_role text,
  preferred_work_mode text, preferred_location text, willing_to_relocate text
);
CREATE TABLE public.career_goals (
  student_id text PRIMARY KEY REFERENCES public.students(student_id) ON DELETE CASCADE,
  career_goal text, expected_salary numeric, study_hours_per_week numeric, career_readiness_score numeric
);
CREATE TABLE public.career_recommendations (
  student_id text PRIMARY KEY REFERENCES public.students(student_id) ON DELETE CASCADE,
  recommended_career_domain text, recommended_role text, career_match_score numeric, skill_gap_score numeric
);
CREATE TABLE public.smartcareer_staging (
  id bigserial PRIMARY KEY, raw jsonb NOT NULL, imported_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.students, public.student_skill_scores, public.student_experience,
  public.career_preferences, public.career_goals, public.career_recommendations TO anon, authenticated;
GRANT ALL ON public.students, public.student_skill_scores, public.student_experience,
  public.career_preferences, public.career_goals, public.career_recommendations, public.smartcareer_staging TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.smartcareer_staging_id_seq TO service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartcareer_staging ENABLE ROW LEVEL SECURITY;

-- Temporary demo policy: public read-only. Replace with role-scoped policies when auth ships.
CREATE POLICY "demo public read" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo public read" ON public.student_skill_scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo public read" ON public.student_experience FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo public read" ON public.career_preferences FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo public read" ON public.career_goals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo public read" ON public.career_recommendations FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX students_degree_idx ON public.students(degree);
CREATE INDEX students_branch_idx ON public.students(branch);
CREATE INDEX students_city_idx ON public.students(city);
CREATE INDEX students_cgpa_idx ON public.students(cgpa);

CREATE OR REPLACE FUNCTION public.get_analytics(p_degree text DEFAULT NULL, p_branch text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
WITH s AS (
  SELECT st.student_id, st.cgpa FROM students st
  WHERE (p_degree IS NULL OR st.degree = p_degree) AND (p_branch IS NULL OR st.branch = p_branch)
),
g AS (SELECT cg.career_readiness_score r FROM career_goals cg JOIN s USING (student_id)),
rc AS (SELECT r.* FROM career_recommendations r JOIN s USING (student_id)),
sk AS (SELECT k.* FROM student_skill_scores k JOIN s USING (student_id))
SELECT jsonb_build_object(
  'student_count', (SELECT count(*) FROM s),
  'avg_cgpa', (SELECT round(avg(cgpa),2) FROM s),
  'avg_readiness', (SELECT round(avg(r),1) FROM g),
  'avg_match', (SELECT round(avg(career_match_score),1) FROM rc),
  'avg_gap', (SELECT round(avg(skill_gap_score),1) FROM rc),
  'cgpa_distribution', COALESCE((SELECT jsonb_agg(jsonb_build_object('label', b, 'count', c) ORDER BY b) FROM
     (SELECT (floor(cgpa))::int::text || '–' || (floor(cgpa)+1)::int::text b, count(*) c FROM s WHERE cgpa IS NOT NULL GROUP BY 1) x), '[]'::jsonb),
  'readiness_distribution', COALESCE((SELECT jsonb_agg(jsonb_build_object('label', b, 'count', c) ORDER BY lo) FROM
     (SELECT (floor(r/10)*10)::int lo, (floor(r/10)*10)::int::text || '–' || (floor(r/10)*10+10)::int::text b, count(*) c FROM g WHERE r IS NOT NULL GROUP BY 1,2) x), '[]'::jsonb),
  'domains', COALESCE((SELECT jsonb_agg(jsonb_build_object('label', d, 'count', c) ORDER BY c DESC) FROM
     (SELECT recommended_career_domain d, count(*) c FROM rc WHERE recommended_career_domain IS NOT NULL GROUP BY 1) x), '[]'::jsonb),
  'avg_skills', COALESCE((SELECT jsonb_agg(jsonb_build_object('key', key, 'value', round(v::numeric,1))) FROM
     (SELECT e.key, avg((e.value)::numeric) v FROM sk, jsonb_each_text(to_jsonb(sk) - 'student_id') e WHERE e.value IS NOT NULL GROUP BY e.key) x), '[]'::jsonb),
  'degrees', COALESCE((SELECT jsonb_agg(DISTINCT degree) FROM students WHERE degree IS NOT NULL), '[]'::jsonb),
  'branches', COALESCE((SELECT jsonb_agg(DISTINCT branch) FROM students WHERE branch IS NOT NULL), '[]'::jsonb)
);
$$;
GRANT EXECUTE ON FUNCTION public.get_analytics(text, text) TO anon, authenticated;