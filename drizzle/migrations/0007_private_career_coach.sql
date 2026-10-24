CREATE TABLE public.coach_conversations (user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE, messages jsonb NOT NULL DEFAULT '[]'::jsonb, active_request uuid, started_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.coach_conversations TO authenticated;
GRANT ALL ON public.coach_conversations TO service_role;
ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY coach_read_own ON public.coach_conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.coach_request_limits (user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE, window_start timestamptz NOT NULL DEFAULT now(), requests integer NOT NULL DEFAULT 0);
GRANT ALL ON public.coach_request_limits TO service_role;
ALTER TABLE public.coach_request_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.coach_begin(p_request uuid, p_text text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coach_conversations; l public.coach_request_limits; u uuid := auth.uid();
BEGIN
 IF u IS NULL THEN RAISE EXCEPTION 'Sign in to use the coach'; END IF;
 IF length(trim(p_text)) < 1 OR length(p_text) > 2000 THEN RAISE EXCEPTION 'Question must be 1–2000 characters'; END IF;
 INSERT INTO public.coach_request_limits(user_id) VALUES(u) ON CONFLICT DO NOTHING;
 SELECT * INTO l FROM public.coach_request_limits WHERE user_id=u FOR UPDATE;
 IF l.window_start <= now()-interval '1 hour' THEN UPDATE public.coach_request_limits SET window_start=now(), requests=0 WHERE user_id=u; l.requests:=0; END IF;
 IF l.requests >= 20 THEN RAISE EXCEPTION 'Hourly coach limit reached. Try again later.'; END IF;
 INSERT INTO public.coach_conversations(user_id) VALUES(u) ON CONFLICT DO NOTHING;
 SELECT * INTO c FROM public.coach_conversations WHERE user_id=u FOR UPDATE;
 IF c.active_request=p_request THEN RAISE EXCEPTION 'This request is already running'; END IF;
 IF c.active_request IS NOT NULL AND c.started_at > now()-interval '10 minutes' THEN RAISE EXCEPTION 'A response is already being prepared'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(c.messages) m WHERE m->>'id'=p_request::text) THEN RAISE EXCEPTION 'This question was already sent'; END IF;
 IF jsonb_array_length(c.messages) >= 200 THEN RAISE EXCEPTION 'Conversation limit reached. Clear history to continue.'; END IF;
 UPDATE public.coach_request_limits SET requests=requests+1 WHERE user_id=u;
 UPDATE public.coach_conversations SET active_request=p_request, started_at=now(), updated_at=now(), messages=messages || jsonb_build_array(jsonb_build_object('id',p_request,'role','user','parts',jsonb_build_array(jsonb_build_object('type','text','text',trim(p_text))))) WHERE user_id=u RETURNING * INTO c;
 RETURN c.messages;
END $$;
CREATE FUNCTION public.coach_finish(p_request uuid,p_text text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 UPDATE public.coach_conversations SET messages=CASE WHEN length(p_text)>0 THEN messages || jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'role','assistant','parts',jsonb_build_array(jsonb_build_object('type','text','text',left(p_text,20000))))) ELSE messages END, active_request=NULL, updated_at=now() WHERE user_id=auth.uid() AND active_request=p_request;
END $$;
CREATE FUNCTION public.coach_clear() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF EXISTS(SELECT 1 FROM public.coach_conversations WHERE user_id=auth.uid() AND active_request IS NOT NULL AND started_at>now()-interval '10 minutes') THEN RAISE EXCEPTION 'Wait for the current response before clearing history'; END IF;
 UPDATE public.coach_conversations SET messages='[]'::jsonb,active_request=NULL,updated_at=now() WHERE user_id=auth.uid(); END $$;
REVOKE ALL ON FUNCTION public.coach_begin(uuid,text),public.coach_finish(uuid,text),public.coach_clear() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.coach_begin(uuid,text),public.coach_finish(uuid,text),public.coach_clear() TO authenticated;