CREATE TABLE public.admin_invites (
  email text PRIMARY KEY CHECK (email = lower(email)),
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);
GRANT SELECT, INSERT, DELETE ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read invites" ON public.admin_invites FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins add invites" ON public.admin_invites FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid());
CREATE POLICY "admins remove invites" ON public.admin_invites FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Grants admin only once the invited address is confirmed (proves ownership).
CREATE OR REPLACE FUNCTION public.claim_admin_invite()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND NEW.email IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.admin_invites WHERE email = lower(NEW.email) AND claimed_at IS NULL) THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
      UPDATE public.admin_invites SET claimed_at = now() WHERE email = lower(NEW.email);
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_admin_invite() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_confirmed_admin
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.claim_admin_invite();

-- Data quality report (admins only). Assumed scale: skills 0-100, CGPA 0-10.
CREATE OR REPLACE FUNCTION public.get_data_quality()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
DECLARE
  r record; n bigint; missing jsonb := '[]'::jsonb; skills jsonb := '[]'::jsonb;
  neg bigint; hi bigint; total bigint;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT count(*) INTO total FROM public.students;
  FOR r IN SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name <> 'student_id'
      AND table_name IN ('students','student_skill_scores','student_experience','career_preferences','career_goals','career_recommendations')
    ORDER BY table_name, ordinal_position
  LOOP
    EXECUTE format('SELECT count(*) FROM public.%I WHERE %I IS NULL', r.table_name, r.column_name) INTO n;
    IF n > 0 THEN missing := missing || jsonb_build_object('table', r.table_name, 'column', r.column_name, 'count', n); END IF;
    IF r.table_name = 'student_skill_scores' THEN
      EXECUTE format('SELECT count(*) FILTER (WHERE %1$I < 0), count(*) FILTER (WHERE %1$I > 100) FROM public.student_skill_scores', r.column_name) INTO neg, hi;
      IF neg + hi > 0 THEN skills := skills || jsonb_build_object('column', r.column_name, 'negative', neg, 'above_max', hi); END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object(
    'total', total,
    'skill_scale_max', 100, 'cgpa_max', 10,
    'missing', missing,
    'skill_out_of_range', skills,
    'cgpa_below_zero', (SELECT count(*) FROM public.students WHERE cgpa < 0),
    'cgpa_above_max', (SELECT count(*) FROM public.students WHERE cgpa > 10),
    'students_flagged', (SELECT count(DISTINCT s.student_id) FROM public.students s
       LEFT JOIN public.student_skill_scores k USING (student_id)
       WHERE s.cgpa < 0 OR s.cgpa > 10 OR s.cgpa IS NULL OR k.student_id IS NULL
          OR LEAST(k.python_score,k.sql_score,k.data_analysis_score,k.statistics_score,k.machine_learning_score,k.deep_learning_score,k.programming_score,k.technical_score,k.aptitude_score,k.logical_reasoning_score,k.problem_solving_score,k.communication_score,k.english_score,k.analytical_thinking_score,k.creativity_score,k.leadership_score,k.teamwork_score,k.adaptability_score,k.learning_interest_score) < 0
          OR GREATEST(k.python_score,k.sql_score,k.data_analysis_score,k.statistics_score,k.machine_learning_score,k.deep_learning_score,k.programming_score,k.technical_score,k.aptitude_score,k.logical_reasoning_score,k.problem_solving_score,k.communication_score,k.english_score,k.analytical_thinking_score,k.creativity_score,k.leadership_score,k.teamwork_score,k.adaptability_score,k.learning_interest_score) > 100)
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.get_data_quality() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_data_quality() TO authenticated;