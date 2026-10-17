CREATE TABLE public.learning_account_links (user_id uuid PRIMARY KEY REFERENCES public.profiles(id), student_id text UNIQUE NOT NULL REFERENCES public.students(student_id), approved_by uuid NOT NULL, approved_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.learning_account_links TO authenticated; GRANT ALL ON public.learning_account_links TO service_role;
ALTER TABLE public.learning_account_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_links_read ON public.learning_account_links FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.mentor_assignments m WHERE m.mentor_id=auth.uid() AND m.student_id=learning_account_links.student_id));
CREATE TABLE public.learning_link_audit (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, student_id text NOT NULL, approved_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.learning_link_audit TO authenticated; GRANT ALL ON public.learning_link_audit TO service_role;
ALTER TABLE public.learning_link_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_audit_admin ON public.learning_link_audit FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.can_read_learning(p_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT auth.uid() IS NOT NULL AND (p_user=auth.uid() OR public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'mentor') AND EXISTS(SELECT 1 FROM public.learning_account_links l JOIN public.mentor_assignments m USING(student_id) WHERE l.user_id=p_user AND m.mentor_id=auth.uid()))) $$;
REVOKE ALL ON FUNCTION public.can_read_learning(uuid) FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.can_read_learning(uuid) TO authenticated;
CREATE TABLE public.learning_resources (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK(length(title) BETWEEN 1 AND 160), provider text NOT NULL CHECK(length(provider) BETWEEN 1 AND 120), url text NOT NULL CHECK(url LIKE 'https://%'), verified boolean NOT NULL DEFAULT false, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.learning_resources TO authenticated; GRANT ALL ON public.learning_resources TO service_role;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_resources_read ON public.learning_resources FOR SELECT TO authenticated USING(verified OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.learning_scoring_policies (version integer PRIMARY KEY DEFAULT 1, mastery_weight numeric NOT NULL DEFAULT 0.6 CHECK(mastery_weight BETWEEN 0 AND 1), assessment_weight numeric NOT NULL DEFAULT 0.25 CHECK(assessment_weight BETWEEN 0 AND 1), project_weight numeric NOT NULL DEFAULT 0.15 CHECK(project_weight BETWEEN 0 AND 1), project_target integer NOT NULL DEFAULT 3 CHECK(project_target>0), CHECK(mastery_weight+assessment_weight+project_weight=1));
GRANT SELECT ON public.learning_scoring_policies TO authenticated; GRANT ALL ON public.learning_scoring_policies TO service_role;
ALTER TABLE public.learning_scoring_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_policy_read ON public.learning_scoring_policies FOR SELECT TO authenticated USING(true);
CREATE TABLE public.learning_activities (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK(length(title) BETWEEN 1 AND 160), description text NOT NULL CHECK(length(description) BETWEEN 1 AND 4000), skill text NOT NULL CHECK(skill IN ('python_score','sql_score','data_analysis_score','statistics_score','machine_learning_score','deep_learning_score','programming_score','technical_score','aptitude_score','logical_reasoning_score','problem_solving_score','communication_score','english_score','analytical_thinking_score','creativity_score','leadership_score','teamwork_score','adaptability_score','learning_interest_score')), difficulty text NOT NULL CHECK(difficulty IN ('beginner','intermediate','advanced')), career text NOT NULL, kind text NOT NULL CHECK(kind IN ('lesson','quiz','coding','assignment','project')), resource_id uuid REFERENCES public.learning_resources(id), content jsonb NOT NULL DEFAULT '{}'::jsonb, points integer NOT NULL DEFAULT 10 CHECK(points BETWEEN 0 AND 1000), evidence_weight numeric NOT NULL DEFAULT 1 CHECK(evidence_weight>0 AND evidence_weight<=10), due_at timestamptz, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.learning_activities TO authenticated; GRANT ALL ON public.learning_activities TO service_role;
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_activities_read ON public.learning_activities FOR SELECT TO authenticated USING(true);
CREATE TABLE public.learning_answer_keys (activity_id uuid PRIMARY KEY REFERENCES public.learning_activities(id), answers jsonb NOT NULL);
GRANT ALL ON public.learning_answer_keys TO service_role;
ALTER TABLE public.learning_answer_keys ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.student_activity_progress (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, activity_id uuid NOT NULL REFERENCES public.learning_activities(id), submission jsonb NOT NULL, status text NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','completed')), points integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,activity_id));
GRANT SELECT ON public.student_activity_progress TO authenticated; GRANT ALL ON public.student_activity_progress TO service_role;
ALTER TABLE public.student_activity_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_progress_read ON public.student_activity_progress FOR SELECT TO authenticated USING(public.can_read_learning(user_id));
CREATE TABLE public.skill_assessment_results (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), progress_id uuid UNIQUE NOT NULL REFERENCES public.student_activity_progress(id), user_id uuid NOT NULL, skill text NOT NULL, score numeric NOT NULL CHECK(score BETWEEN 0 AND 100), weight numeric NOT NULL CHECK(weight>0 AND weight<=10), feedback text NOT NULL CHECK(length(feedback)<=4000), graded_by uuid NOT NULL, policy_version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.skill_assessment_results TO authenticated; GRANT ALL ON public.skill_assessment_results TO service_role;
ALTER TABLE public.skill_assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_assessment_read ON public.skill_assessment_results FOR SELECT TO authenticated USING(public.can_read_learning(user_id));
CREATE TABLE public.student_skill_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, skill text NOT NULL, assessment_id uuid UNIQUE NOT NULL REFERENCES public.skill_assessment_results(id), score numeric NOT NULL CHECK(score BETWEEN 0 AND 100), policy_version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.student_skill_history TO authenticated; GRANT ALL ON public.student_skill_history TO service_role;
ALTER TABLE public.student_skill_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_history_read ON public.student_skill_history FOR SELECT TO authenticated USING(public.can_read_learning(user_id));
CREATE TABLE public.class_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK(length(title) BETWEEN 1 AND 160), starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, meeting_url text CHECK(meeting_url LIKE 'https://%'), created_by uuid NOT NULL, CHECK(ends_at>starts_at));
GRANT SELECT ON public.class_sessions TO authenticated; GRANT ALL ON public.class_sessions TO service_role;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_classes_read ON public.class_sessions FOR SELECT TO authenticated USING(true);
CREATE TABLE public.class_attendance (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, session_id uuid NOT NULL REFERENCES public.class_sessions(id), recorded_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,session_id));
GRANT SELECT ON public.class_attendance TO authenticated; GRANT ALL ON public.class_attendance TO service_role;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY learning_attendance_read ON public.class_attendance FOR SELECT TO authenticated USING(public.can_read_learning(user_id));
CREATE FUNCTION public.learning_snapshot(p_user uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=coalesce(p_user,auth.uid()); sid text; baseline jsonb; goal text;
BEGIN
 IF NOT public.can_read_learning(u) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT student_id INTO sid FROM public.learning_account_links WHERE user_id=u;
 IF sid IS NOT NULL THEN
  SELECT to_jsonb(s)-'student_id' INTO baseline FROM public.student_skill_scores s WHERE student_id=sid;
  SELECT coalesce(g.career_goal,r.recommended_role) INTO goal FROM public.career_goals g LEFT JOIN public.career_recommendations r USING(student_id) WHERE g.student_id=sid;
 ELSE
  SELECT profile->'skills',profile->'goals'->>'career_goal' INTO baseline,goal FROM public.student_accounts WHERE user_id=u;
 END IF;
 RETURN jsonb_build_object('user_id',u,'student_id',sid,'baseline',coalesce(baseline,'{}'),'goal',goal,'baseline_source',CASE WHEN sid IS NULL THEN 'Self-reported' ELSE 'Imported baseline' END,'activities',coalesce((SELECT jsonb_agg(a ORDER BY a.created_at) FROM public.learning_activities a),'[]'),'resources',coalesce((SELECT jsonb_agg(r) FROM public.learning_resources r WHERE r.verified),'[]'),'progress',coalesce((SELECT jsonb_agg(p ORDER BY p.created_at DESC) FROM public.student_activity_progress p WHERE p.user_id=u),'[]'),'assessments',coalesce((SELECT jsonb_agg(a ORDER BY a.created_at DESC) FROM public.skill_assessment_results a WHERE a.user_id=u),'[]'),'history',coalesce((SELECT jsonb_agg(h ORDER BY h.created_at) FROM public.student_skill_history h WHERE h.user_id=u),'[]'),'sessions',coalesce((SELECT jsonb_agg(s ORDER BY s.starts_at) FROM public.class_sessions s),'[]'),'attendance',coalesce((SELECT jsonb_agg(a) FROM public.class_attendance a WHERE a.user_id=u),'[]'),'policy',coalesce((SELECT to_jsonb(p) FROM public.learning_scoring_policies p ORDER BY version DESC LIMIT 1),'{"version":1,"mastery_weight":0.6,"assessment_weight":0.25,"project_weight":0.15,"project_target":3}'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.learning_snapshot(uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.learning_snapshot(uuid) TO authenticated;
CREATE FUNCTION public.learning_submit(p_activity uuid,p_submission jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.learning_activities; p uuid; existing uuid; key jsonb; q jsonb; n integer:=0; correct integer:=0; score numeric; evidence uuid; version integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF length(p_submission::text)>20000 THEN RAISE EXCEPTION 'Submission too long'; END IF;
 SELECT * INTO a FROM public.learning_activities WHERE id=p_activity;
 IF a.id IS NULL THEN RAISE EXCEPTION 'Activity missing'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_activity::text,0));
 SELECT id INTO existing FROM public.student_activity_progress WHERE user_id=auth.uid() AND activity_id=p_activity;
 IF existing IS NOT NULL THEN RETURN existing; END IF;
 IF a.kind='lesson' AND coalesce(p_submission->>'reflection','')='' THEN RAISE EXCEPTION 'Reflection required'; END IF;
 IF a.kind NOT IN ('lesson','quiz') AND coalesce(p_submission->>'work','')='' THEN RAISE EXCEPTION 'Work required'; END IF;
 IF a.kind='quiz' THEN
  SELECT answers INTO key FROM public.learning_answer_keys WHERE activity_id=p_activity;
  IF key IS NULL THEN RAISE EXCEPTION 'Quiz is not configured'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(key) LOOP
   IF NOT (p_submission->'answers' ? n::text) THEN RAISE EXCEPTION 'Answer every question'; END IF;
   IF (p_submission->'answers'->>n::text)::integer=(q#>>'{}')::integer THEN correct:=correct+1; END IF; n:=n+1;
  END LOOP;
  IF n=0 THEN RAISE EXCEPTION 'Quiz is empty'; END IF;
  score:=round(correct::numeric/n*100,2);
 END IF;
 INSERT INTO public.student_activity_progress(user_id,activity_id,submission,status,points) VALUES(auth.uid(),p_activity,p_submission,CASE WHEN a.kind IN ('lesson','quiz') THEN 'completed' ELSE 'submitted' END,CASE WHEN a.kind IN ('lesson','quiz') THEN a.points ELSE 0 END) RETURNING id INTO p;
 IF a.kind='quiz' THEN
  SELECT coalesce(max(s.version),1) INTO version FROM public.learning_scoring_policies s;
  INSERT INTO public.skill_assessment_results(progress_id,user_id,skill,score,weight,feedback,graded_by,policy_version) VALUES(p,auth.uid(),a.skill,score,a.evidence_weight,correct||' of '||n||' correct. Review missed topics with the coach.',auth.uid(),version) RETURNING id INTO evidence;
  INSERT INTO public.student_skill_history(user_id,skill,assessment_id,score,policy_version) SELECT auth.uid(),a.skill,evidence,round(sum(r.score*r.weight)/sum(r.weight),2),version FROM public.skill_assessment_results r WHERE r.user_id=auth.uid() AND r.skill=a.skill;
 END IF;
 RETURN p;
END $$;
REVOKE ALL ON FUNCTION public.learning_submit(uuid,jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.learning_submit(uuid,jsonb) TO authenticated;
CREATE FUNCTION public.learning_grade(p_progress uuid,p_score numeric,p_feedback text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.student_activity_progress; a public.learning_activities; evidence uuid; version integer;
BEGIN
 SELECT * INTO p FROM public.student_activity_progress WHERE id=p_progress FOR UPDATE;
 IF p.id IS NULL OR NOT (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'mentor') AND public.can_read_learning(p.user_id) AND p.user_id<>auth.uid())) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT id INTO evidence FROM public.skill_assessment_results WHERE progress_id=p_progress;
 IF evidence IS NOT NULL THEN RETURN evidence; END IF;
 SELECT * INTO a FROM public.learning_activities WHERE id=p.activity_id;
 IF a.kind NOT IN ('coding','assignment','project') THEN RAISE EXCEPTION 'Not reviewable'; END IF;
 IF p_score IS NULL OR p_score<0 OR p_score>100 OR length(trim(p_feedback))<1 OR length(p_feedback)>4000 THEN RAISE EXCEPTION 'Invalid rubric result'; END IF;
 SELECT coalesce(max(s.version),1) INTO version FROM public.learning_scoring_policies s;
 INSERT INTO public.skill_assessment_results(progress_id,user_id,skill,score,weight,feedback,graded_by,policy_version) VALUES(p.id,p.user_id,a.skill,p_score,a.evidence_weight,p_feedback,auth.uid(),version) RETURNING id INTO evidence;
 UPDATE public.student_activity_progress SET status='completed',points=a.points WHERE id=p.id;
 INSERT INTO public.student_skill_history(user_id,skill,assessment_id,score,policy_version) SELECT p.user_id,a.skill,evidence,round(sum(r.score*r.weight)/sum(r.weight),2),version FROM public.skill_assessment_results r WHERE r.user_id=p.user_id AND r.skill=a.skill;
 RETURN evidence;
END $$;
REVOKE ALL ON FUNCTION public.learning_grade(uuid,numeric,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.learning_grade(uuid,numeric,text) TO authenticated;
CREATE FUNCTION public.learning_admin(p_command text,p_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid; questions jsonb; item jsonb;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF length(p_data::text)>30000 THEN RAISE EXCEPTION 'Input too long'; END IF;
 IF p_command='link' THEN
  IF NOT public.has_role((p_data->>'user_id')::uuid,'student') THEN RAISE EXCEPTION 'Student account required'; END IF;
  INSERT INTO public.learning_account_links(user_id,student_id,approved_by) VALUES((p_data->>'user_id')::uuid,p_data->>'student_id',auth.uid());
  INSERT INTO public.learning_link_audit(user_id,student_id,approved_by) VALUES((p_data->>'user_id')::uuid,p_data->>'student_id',auth.uid()) RETURNING id INTO result;
 ELSIF p_command='resource' THEN
  INSERT INTO public.learning_resources(title,provider,url,verified,created_by) VALUES(p_data->>'title',p_data->>'provider',p_data->>'url',true,auth.uid()) RETURNING id INTO result;
 ELSIF p_command='activity' THEN
  IF p_data->>'kind'='quiz' THEN
   questions:=p_data->'content'->'questions';
   IF jsonb_typeof(questions)<>'array' OR jsonb_array_length(questions)<1 OR jsonb_array_length(questions)>30 OR jsonb_array_length(p_data->'answers')<>jsonb_array_length(questions) THEN RAISE EXCEPTION 'Invalid quiz'; END IF;
   FOR item IN SELECT value FROM jsonb_array_elements(questions) LOOP
    IF length(coalesce(item->>'prompt',''))<1 OR jsonb_typeof(item->'options')<>'array' OR jsonb_array_length(item->'options')<2 THEN RAISE EXCEPTION 'Invalid question'; END IF;
   END LOOP;
  ELSIF p_data->>'kind' IN ('coding','assignment','project') AND length(coalesce(p_data->'content'->>'rubric',''))<1 THEN RAISE EXCEPTION 'Rubric required'; END IF;
  INSERT INTO public.learning_activities(title,description,skill,difficulty,career,kind,resource_id,content,points,evidence_weight,due_at,created_by) VALUES(p_data->>'title',p_data->>'description',p_data->>'skill',p_data->>'difficulty',p_data->>'career',p_data->>'kind',nullif(p_data->>'resource_id','')::uuid,p_data->'content',(p_data->>'points')::integer,(p_data->>'evidence_weight')::numeric,nullif(p_data->>'due_at','')::timestamptz,auth.uid()) RETURNING id INTO result;
  IF p_data->>'kind'='quiz' THEN INSERT INTO public.learning_answer_keys(activity_id,answers) VALUES(result,p_data->'answers'); END IF;
 ELSIF p_command='session' THEN
  INSERT INTO public.class_sessions(title,starts_at,ends_at,meeting_url,created_by) VALUES(p_data->>'title',(p_data->>'starts_at')::timestamptz,(p_data->>'ends_at')::timestamptz,nullif(p_data->>'meeting_url',''),auth.uid()) RETURNING id INTO result;
 ELSIF p_command='attendance' THEN
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=(p_data->>'user_id')::uuid) THEN RAISE EXCEPTION 'Account missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.class_sessions WHERE id=(p_data->>'session_id')::uuid AND starts_at<=now()) THEN RAISE EXCEPTION 'Class has not started'; END IF;
  INSERT INTO public.class_attendance(user_id,session_id,recorded_by) VALUES((p_data->>'user_id')::uuid,(p_data->>'session_id')::uuid,auth.uid()) ON CONFLICT(user_id,session_id) DO NOTHING RETURNING id INTO result;
 ELSIF p_command='policy' THEN
  INSERT INTO public.learning_scoring_policies(version,mastery_weight,assessment_weight,project_weight,project_target) VALUES(coalesce((SELECT max(version)+1 FROM public.learning_scoring_policies),1),(p_data->>'mastery_weight')::numeric,(p_data->>'assessment_weight')::numeric,(p_data->>'project_weight')::numeric,(p_data->>'project_target')::integer);
 ELSE RAISE EXCEPTION 'Unknown operation'; END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.learning_admin(text,jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.learning_admin(text,jsonb) TO authenticated;