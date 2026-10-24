CREATE OR REPLACE FUNCTION public.coach_begin(p_request uuid, p_text text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RAISE EXCEPTION 'Server-only coach operation' USING ERRCODE='42501'; END $$;
CREATE OR REPLACE FUNCTION public.coach_finish(p_request uuid, p_text text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RAISE EXCEPTION 'Server-only coach operation' USING ERRCODE='42501'; END $$;
REVOKE ALL ON FUNCTION public.coach_begin(uuid,text), public.coach_finish(uuid,text) FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON FUNCTION public.coach_begin(uuid,text) IS 'DEPRECATED: replaced by server-only account-bound overload';
COMMENT ON FUNCTION public.coach_finish(uuid,text) IS 'DEPRECATED: replaced by server-only account-bound overload';
CREATE OR REPLACE FUNCTION public.coach_begin(p_user uuid, p_request uuid, p_text text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coach_conversations; l public.coach_request_limits;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Server-only coach operation' USING ERRCODE='42501'; END IF;
 IF p_user IS NULL OR p_request IS NULL OR p_request='00000000-0000-0000-0000-000000000000'::uuid OR p_text IS NULL OR length(trim(p_text))<1 OR length(p_text)>2000 THEN RAISE EXCEPTION 'Invalid coach request' USING ERRCODE='22023'; END IF;
 INSERT INTO public.coach_request_limits(user_id) VALUES(p_user) ON CONFLICT DO NOTHING;
 SELECT * INTO l FROM public.coach_request_limits WHERE user_id=p_user FOR UPDATE;
 IF l.window_start <= now()-interval '1 hour' THEN UPDATE public.coach_request_limits SET window_start=now(),requests=0 WHERE user_id=p_user; l.requests:=0; END IF;
 IF l.requests>=20 THEN RAISE EXCEPTION 'Hourly coach limit reached. Try again later.'; END IF;
 INSERT INTO public.coach_conversations(user_id) VALUES(p_user) ON CONFLICT DO NOTHING;
 SELECT * INTO c FROM public.coach_conversations WHERE user_id=p_user FOR UPDATE;
 IF c.active_request IS NOT NULL AND c.started_at>now()-interval '3 minutes' THEN RAISE EXCEPTION 'A response is already being prepared'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(c.messages) m WHERE m->>'id'=p_request::text) THEN RAISE EXCEPTION 'This question was already sent'; END IF;
 IF jsonb_array_length(c.messages)>=200 THEN RAISE EXCEPTION 'Conversation limit reached. Clear history to continue.'; END IF;
 UPDATE public.coach_request_limits SET requests=requests+1 WHERE user_id=p_user;
 UPDATE public.coach_conversations SET active_request=p_request,started_at=now(),updated_at=now(),messages=messages||jsonb_build_array(jsonb_build_object('id',p_request,'role','user','parts',jsonb_build_array(jsonb_build_object('type','text','text',trim(p_text))))) WHERE user_id=p_user RETURNING * INTO c;
 RETURN c.messages;
END $$;
CREATE OR REPLACE FUNCTION public.coach_finish(p_user uuid, p_request uuid, p_text text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coach_conversations;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Server-only coach operation' USING ERRCODE='42501'; END IF;
 IF p_user IS NULL OR p_request IS NULL OR p_request='00000000-0000-0000-0000-000000000000'::uuid OR p_text IS NULL OR length(p_text)>20000 THEN RAISE EXCEPTION 'Invalid coach completion' USING ERRCODE='22023'; END IF;
 SELECT * INTO c FROM public.coach_conversations WHERE user_id=p_user FOR UPDATE;
 IF NOT FOUND OR c.active_request IS DISTINCT FROM p_request THEN RAISE EXCEPTION 'No matching active coach request'; END IF;
 IF length(p_text)>0 AND (c.started_at IS NULL OR c.started_at<=now()-interval '3 minutes' OR c.messages->-1->>'id' IS DISTINCT FROM p_request::text OR c.messages->-1->>'role' IS DISTINCT FROM 'user') THEN RAISE EXCEPTION 'Invalid or expired coach request'; END IF;
 UPDATE public.coach_conversations SET messages=CASE WHEN length(p_text)>0 THEN messages||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'role','assistant','parts',jsonb_build_array(jsonb_build_object('type','text','text',p_text)))) ELSE messages END,active_request=NULL,started_at=NULL,updated_at=now() WHERE user_id=p_user;
END $$;
REVOKE ALL ON FUNCTION public.coach_begin(uuid,uuid,text), public.coach_finish(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.coach_begin(uuid,uuid,text), public.coach_finish(uuid,uuid,text) TO service_role;
CREATE OR REPLACE FUNCTION public.coach_clear() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coach_conversations;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO c FROM public.coach_conversations WHERE user_id=auth.uid() FOR UPDATE;
 IF c.active_request IS NOT NULL AND c.started_at>now()-interval '3 minutes' THEN RAISE EXCEPTION 'Wait for the current response before clearing history'; END IF;
 UPDATE public.coach_conversations SET messages='[]'::jsonb,active_request=NULL,started_at=NULL,updated_at=now() WHERE user_id=auth.uid();
END $$;
REVOKE ALL ON FUNCTION public.coach_clear() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.coach_clear() TO authenticated;