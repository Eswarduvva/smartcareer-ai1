REVOKE ALL ON public.coach_conversations,public.coach_request_limits FROM anon;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.coach_conversations FROM authenticated;
REVOKE ALL ON public.coach_request_limits FROM authenticated;
GRANT SELECT ON public.coach_conversations TO authenticated;