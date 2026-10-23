-- Read-only dashboard functions. No tables, policies or grants on tables change.
CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(p_degree text DEFAULT NULL, p_branch text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
-- SECURITY INVOKER: existing RLS scopes rows (admins: all, mentors: assigned only, others: none).
WITH base AS (SELECT student_id, degree, branch, cgpa FROM students),
s AS (SELECT * FROM base WHERE (p_degree IS NULL OR degree = p_degree) AND (p_branch IS NULL OR branch = p_branch)),
g AS (SELECT s.degree, cg.career_goal, cg.career_readiness_score r FROM s JOIN career_goals cg USING (student_id)),
rc AS (SELECT r.* FROM s JOIN career_recommendations r USING (student_id)),
sk AS (SELECT k.* FROM s JOIN student_skill_scores k USING (student_id))
SELECT jsonb_build_object(
  'student_count', (SELECT count(*) FROM s),
  'avg_cgpa', (SELECT round(avg(cgpa),2) FROM s),
  'avg_readiness', (SELECT round(avg(r),2) FROM g),
  'avg_match', (SELECT round(avg(career_match_score),2) FROM rc),
  'avg_gap', (SELECT round(avg(skill_gap_score),2) FROM rc),
  'goals', COALESCE((SELECT jsonb_agg(jsonb_build_object('label',l,'count',c) ORDER BY c DESC, l) FROM (SELECT career_goal l, count(*) c FROM g WHERE career_goal IS NOT NULL GROUP BY 1) x),'[]'),
  'readiness_by_degree', COALESCE((SELECT jsonb_agg(jsonb_build_object('label',l,'value',v,'count',c) ORDER BY l) FROM (SELECT degree l, round(avg(r),2) v, count(*) c FROM g WHERE degree IS NOT NULL AND r IS NOT NULL GROUP BY 1) x),'[]'),
  'domains', COALESCE((SELECT jsonb_agg(jsonb_build_object('label',l,'count',c) ORDER BY c DESC, l) FROM (SELECT recommended_career_domain l, count(*) c FROM rc WHERE recommended_career_domain IS NOT NULL GROUP BY 1) x),'[]'),
  'skills', jsonb_build_object(
    'python_score',(SELECT round(avg(python_score),2) FROM sk),
    'sql_score',(SELECT round(avg(sql_score),2) FROM sk),
    'data_analysis_score',(SELECT round(avg(data_analysis_score),2) FROM sk),
    'machine_learning_score',(SELECT round(avg(machine_learning_score),2) FROM sk),
    'communication_score',(SELECT round(avg(communication_score),2) FROM sk)),
  'degrees', COALESCE((SELECT jsonb_agg(DISTINCT degree) FROM base WHERE degree IS NOT NULL),'[]'),
  'branches', COALESCE((SELECT jsonb_agg(DISTINCT branch) FROM base WHERE branch IS NOT NULL AND (p_degree IS NULL OR degree = p_degree)),'[]')
);
$$;

CREATE OR REPLACE FUNCTION public.get_my_cohort_dashboard()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
-- Returns only the caller's admin-approved linked record, plus aggregate-only cohort benchmarks.
DECLARE sid text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT student_id INTO sid FROM learning_account_links WHERE user_id = auth.uid();
  IF sid IS NULL THEN RETURN jsonb_build_object('linked', false); END IF;
  RETURN jsonb_build_object(
    'linked', true,
    'record', jsonb_build_object(
      'student', (SELECT to_jsonb(x) FROM students x WHERE student_id = sid),
      'skills', (SELECT to_jsonb(x) FROM student_skill_scores x WHERE student_id = sid),
      'experience', (SELECT to_jsonb(x) FROM student_experience x WHERE student_id = sid),
      'preferences', (SELECT to_jsonb(x) FROM career_preferences x WHERE student_id = sid),
      'goals', (SELECT to_jsonb(x) FROM career_goals x WHERE student_id = sid),
      'recommendation', (SELECT to_jsonb(x) FROM career_recommendations x WHERE student_id = sid)),
    'benchmark', jsonb_build_object(
      'avg_readiness', (SELECT round(avg(career_readiness_score),2) FROM career_goals),
      'avg_gap', (SELECT round(avg(skill_gap_score),2) FROM career_recommendations),
      'avg_match', (SELECT round(avg(career_match_score),2) FROM career_recommendations),
      'avg_cgpa', (SELECT round(avg(cgpa),2) FROM students)));
END $$;

REVOKE ALL ON FUNCTION public.get_dashboard_analytics(text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_cohort_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_cohort_dashboard() TO authenticated;