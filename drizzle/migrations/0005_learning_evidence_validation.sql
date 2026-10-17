CREATE FUNCTION public.validate_learning_evidence() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text||NEW.skill,1)); RETURN NEW; END $$;
CREATE TRIGGER learning_evidence_serialization BEFORE INSERT ON public.skill_assessment_results FOR EACH ROW EXECUTE FUNCTION public.validate_learning_evidence();
CREATE FUNCTION public.validate_learning_activity() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE q jsonb; BEGIN
 IF NEW.kind='quiz' THEN
  IF jsonb_typeof(NEW.content->'questions') IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.content->'questions') NOT BETWEEN 1 AND 30 THEN RAISE EXCEPTION 'Invalid quiz questions'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(NEW.content->'questions') LOOP
   IF length(trim(coalesce(q->>'prompt','')))=0 OR length(q->>'prompt')>1000 OR jsonb_typeof(q->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'options') NOT BETWEEN 2 AND 6 THEN RAISE EXCEPTION 'Invalid question'; END IF;
  END LOOP;
 END IF;
 IF NEW.kind IN ('coding','assignment','project') AND length(trim(coalesce(NEW.content->>'rubric','')))=0 THEN RAISE EXCEPTION 'Rubric required'; END IF;
 IF NEW.content ? 'answers' OR NEW.content ? 'answer' THEN RAISE EXCEPTION 'Answer keys must remain private'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER learning_activity_validation BEFORE INSERT OR UPDATE ON public.learning_activities FOR EACH ROW EXECUTE FUNCTION public.validate_learning_activity();
CREATE FUNCTION public.validate_learning_key() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE questions jsonb; i integer; BEGIN
 SELECT content->'questions' INTO questions FROM public.learning_activities WHERE id=NEW.activity_id;
 IF jsonb_typeof(NEW.answers) IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.answers)<>jsonb_array_length(questions) THEN RAISE EXCEPTION 'Invalid answer key'; END IF;
 FOR i IN 0..jsonb_array_length(questions)-1 LOOP
  IF (NEW.answers->>i)::numeric<>trunc((NEW.answers->>i)::numeric) OR (NEW.answers->>i)::integer<0 OR (NEW.answers->>i)::integer>=jsonb_array_length(questions->i->'options') THEN RAISE EXCEPTION 'Invalid answer option'; END IF;
 END LOOP; RETURN NEW; END $$;
CREATE TRIGGER learning_key_validation BEFORE INSERT OR UPDATE ON public.learning_answer_keys FOR EACH ROW EXECUTE FUNCTION public.validate_learning_key();
REVOKE ALL ON FUNCTION public.validate_learning_evidence() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.validate_learning_activity() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.validate_learning_key() FROM PUBLIC,anon,authenticated;