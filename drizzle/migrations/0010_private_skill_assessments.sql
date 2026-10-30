CREATE TABLE public.assessment_questions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), skill text NOT NULL CHECK(skill IN ('python','sql','java','javascript','cpp','data-analysis')),
 bank_key text NOT NULL UNIQUE, prompt text NOT NULL CHECK(length(prompt) BETWEEN 1 AND 2000), options jsonb NOT NULL CHECK(jsonb_typeof(options)='array' AND jsonb_array_length(options)=4),
 correct_option smallint NOT NULL CHECK(correct_option BETWEEN 0 AND 3), topic text NOT NULL, difficulty text NOT NULL CHECK(difficulty IN ('beginner','intermediate','advanced')),
 explanation text NOT NULL, review_status text NOT NULL DEFAULT 'checked' CHECK(review_status IN ('draft','checked')), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.assessment_questions TO service_role;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX assessment_question_selection ON public.assessment_questions(skill,difficulty,review_status);
CREATE TABLE public.student_assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 skill text NOT NULL CHECK(skill IN ('python','sql','java','javascript','cpp','data-analysis')), status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','finalized')),
 started_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT (now()+interval '25 minutes'), submitted_at timestamptz,
 marks integer CHECK(marks BETWEEN 0 AND 40), percentage numeric(5,2) CHECK(percentage BETWEEN 0 AND 100), proficiency text CHECK(proficiency IN ('Building','Developing','Strong')),
 UNIQUE(id,user_id), CHECK((status='active' AND submitted_at IS NULL AND marks IS NULL AND percentage IS NULL AND proficiency IS NULL) OR (status='finalized' AND submitted_at IS NOT NULL AND marks IS NOT NULL AND percentage IS NOT NULL AND proficiency IS NOT NULL))
);
GRANT SELECT ON public.student_assessments TO authenticated;
GRANT ALL ON public.student_assessments TO service_role;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_attempt_owner_read ON public.student_assessments FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE UNIQUE INDEX assessment_one_active_subject ON public.student_assessments(user_id,skill) WHERE status='active';
CREATE INDEX assessment_attempt_history ON public.student_assessments(user_id,started_at DESC);
CREATE TABLE public.assessment_answers (
 attempt_id uuid NOT NULL REFERENCES public.student_assessments(id) ON DELETE CASCADE,
 question_id uuid NOT NULL REFERENCES public.assessment_questions(id), position smallint NOT NULL CHECK(position BETWEEN 1 AND 20), selected_option smallint CHECK(selected_option BETWEEN 0 AND 3),
 PRIMARY KEY(attempt_id,question_id), UNIQUE(attempt_id,position)
);
GRANT SELECT ON public.assessment_answers TO authenticated;
GRANT ALL ON public.assessment_answers TO service_role;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_answer_owner_read ON public.assessment_answers FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.student_assessments a WHERE a.id=attempt_id AND a.user_id=auth.uid()));
CREATE TABLE public.student_skill_proficiency (
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, skill text NOT NULL,
 attempt_id uuid NOT NULL, percentage numeric(5,2) NOT NULL CHECK(percentage BETWEEN 0 AND 100), proficiency text NOT NULL CHECK(proficiency IN ('Building','Developing','Strong')), verified_at timestamptz NOT NULL,
 PRIMARY KEY(user_id,skill), FOREIGN KEY(attempt_id,user_id) REFERENCES public.student_assessments(id,user_id)
);
GRANT SELECT ON public.student_skill_proficiency TO authenticated;
GRANT ALL ON public.student_skill_proficiency TO service_role;
ALTER TABLE public.student_skill_proficiency ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_proficiency_owner_read ON public.student_skill_proficiency FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.assessment_finalize_internal(p_attempt uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.student_assessments; m integer; pct numeric; level text;
BEGIN
 SELECT * INTO a FROM public.student_assessments WHERE id=p_attempt FOR UPDATE;
 IF auth.uid() IS NULL OR a.id IS NULL OR a.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF a.status='finalized' THEN RETURN; END IF;
 SELECT coalesce(sum(CASE WHEN b.selected_option=q.correct_option THEN CASE q.difficulty WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2 ELSE 4 END ELSE 0 END),0) INTO m FROM public.assessment_answers b JOIN public.assessment_questions q ON q.id=b.question_id WHERE b.attempt_id=a.id;
 pct:=round(m::numeric/40*100,2); level:=CASE WHEN pct>=70 THEN 'Strong' WHEN pct>=40 THEN 'Developing' ELSE 'Building' END;
 UPDATE public.student_assessments SET status='finalized',submitted_at=now(),marks=m,percentage=pct,proficiency=level WHERE id=a.id;
 INSERT INTO public.student_skill_proficiency(user_id,skill,attempt_id,percentage,proficiency,verified_at) VALUES(a.user_id,a.skill,a.id,pct,level,now()) ON CONFLICT(user_id,skill) DO UPDATE SET attempt_id=excluded.attempt_id,percentage=excluded.percentage,proficiency=excluded.proficiency,verified_at=excluded.verified_at WHERE student_skill_proficiency.verified_at<=excluded.verified_at;
END $$;
REVOKE ALL ON FUNCTION public.assessment_finalize_internal(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.assessment_start(p_skill text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE aid uuid; prior public.student_assessments; d text; needed integer; available integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
 IF p_skill IS NULL OR p_skill NOT IN ('python','sql','java','javascript','cpp','data-analysis') THEN RAISE EXCEPTION 'Invalid subject'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_skill,42));
 SELECT * INTO prior FROM public.student_assessments WHERE user_id=auth.uid() AND skill=p_skill AND status='active' FOR UPDATE;
 IF prior.id IS NOT NULL THEN IF prior.expires_at>now() THEN RETURN prior.id; ELSE PERFORM public.assessment_finalize_internal(prior.id); END IF; END IF;
 FOR d,needed IN SELECT * FROM (VALUES('beginner',24),('intermediate',24),('advanced',12)) x LOOP
  SELECT count(*) INTO available FROM public.assessment_questions WHERE skill=p_skill AND difficulty=d AND review_status='checked';
  IF available<needed THEN RAISE EXCEPTION 'Question bank is not ready'; END IF;
 END LOOP;
 INSERT INTO public.student_assessments(user_id,skill) VALUES(auth.uid(),p_skill) RETURNING id INTO aid;
 INSERT INTO public.assessment_answers(attempt_id,question_id,position)
 SELECT aid,id,row_number() OVER(ORDER BY random()) FROM (
 (SELECT id FROM public.assessment_questions WHERE skill=p_skill AND difficulty='beginner' AND review_status='checked' ORDER BY random() LIMIT 8) UNION ALL
 (SELECT id FROM public.assessment_questions WHERE skill=p_skill AND difficulty='intermediate' AND review_status='checked' ORDER BY random() LIMIT 8) UNION ALL
 (SELECT id FROM public.assessment_questions WHERE skill=p_skill AND difficulty='advanced' AND review_status='checked' ORDER BY random() LIMIT 4)) chosen;
 RETURN aid;
END $$;
REVOKE ALL ON FUNCTION public.assessment_start(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.assessment_start(text) TO authenticated;
CREATE OR REPLACE FUNCTION public.assessment_snapshot(p_attempt uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.student_assessments;
BEGIN
 SELECT * INTO a FROM public.student_assessments WHERE id=p_attempt FOR UPDATE;
 IF auth.uid() IS NULL OR a.id IS NULL OR a.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF a.status='active' AND a.expires_at<=now() THEN PERFORM public.assessment_finalize_internal(a.id); SELECT * INTO a FROM public.student_assessments WHERE id=a.id; END IF;
 RETURN jsonb_build_object('attempt',to_jsonb(a),'server_time',now(),'questions',(SELECT jsonb_agg(jsonb_build_object('id',q.id,'position',b.position,'prompt',q.prompt,'options',q.options,'topic',q.topic,'difficulty',q.difficulty,'selected_option',b.selected_option)||CASE WHEN a.status='finalized' THEN jsonb_build_object('correct_option',q.correct_option,'explanation',q.explanation) ELSE '{}'::jsonb END ORDER BY b.position) FROM public.assessment_answers b JOIN public.assessment_questions q ON q.id=b.question_id WHERE b.attempt_id=a.id));
END $$;
REVOKE ALL ON FUNCTION public.assessment_snapshot(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.assessment_snapshot(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.assessment_save(p_attempt uuid,p_question uuid,p_option integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.student_assessments;
BEGIN
 SELECT * INTO a FROM public.student_assessments WHERE id=p_attempt FOR UPDATE;
 IF auth.uid() IS NULL OR a.id IS NULL OR a.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 IF a.status='active' AND a.expires_at>now() THEN
  IF p_option IS NULL OR p_option NOT BETWEEN 0 AND 3 OR p_question IS NULL THEN RAISE EXCEPTION 'Invalid answer'; END IF;
  UPDATE public.assessment_answers SET selected_option=p_option WHERE attempt_id=a.id AND question_id=p_question;
  IF NOT FOUND THEN RAISE EXCEPTION 'Question is not in this attempt'; END IF;
 END IF;
 RETURN public.assessment_snapshot(a.id);
END $$;
REVOKE ALL ON FUNCTION public.assessment_save(uuid,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.assessment_save(uuid,uuid,integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.assessment_submit(p_attempt uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN PERFORM public.assessment_finalize_internal(p_attempt); RETURN public.assessment_snapshot(p_attempt); END $$;
REVOKE ALL ON FUNCTION public.assessment_submit(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.assessment_submit(uuid) TO authenticated;
COMMENT ON TABLE public.student_skill_proficiency IS 'Verified assessment evidence only; does not replace self-reported or imported career scores.';
