REVOKE ALL ON public.assessment_questions FROM anon, authenticated;
REVOKE ALL ON public.student_assessments, public.assessment_answers, public.student_skill_proficiency FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.student_assessments, public.assessment_answers, public.student_skill_proficiency FROM authenticated;
GRANT SELECT ON public.student_assessments, public.assessment_answers, public.student_skill_proficiency TO authenticated;
GRANT ALL ON public.assessment_questions, public.student_assessments, public.assessment_answers, public.student_skill_proficiency TO service_role;