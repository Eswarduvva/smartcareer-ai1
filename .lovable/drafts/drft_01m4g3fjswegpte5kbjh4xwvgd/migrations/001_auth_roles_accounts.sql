-- Accounts, roles, mentor assignments and per-account student data.
CREATE TYPE public.app_role AS ENUM ('student', 'mentor', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text CHECK (char_length(full_name) <= 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
-- No INSERT/UPDATE/DELETE policies: roles are granted only by trusted server-side admin processes.

CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.mentor_assignments (
  mentor_id uuid NOT NULL,
  student_id text NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mentor_id, student_id)
);
CREATE INDEX mentor_assignments_student_idx ON public.mentor_assignments(student_id);
GRANT SELECT ON public.mentor_assignments TO authenticated;
GRANT ALL ON public.mentor_assignments TO service_role;
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor sees own assignments" ON public.mentor_assignments FOR SELECT TO authenticated
  USING (mentor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.can_view_student(_student_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
      OR (public.has_role(auth.uid(), 'mentor')
          AND EXISTS (SELECT 1 FROM public.mentor_assignments WHERE mentor_id = auth.uid() AND student_id = _student_id))
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_student(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_view_student(text) TO authenticated;

-- A signed-in student's own self-entered profile and roadmap progress (one row per account).
CREATE TABLE public.student_accounts (
  user_id uuid PRIMARY KEY,
  profile jsonb,
  complete boolean NOT NULL DEFAULT false,
  roadmap_done jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.student_accounts TO authenticated;
GRANT ALL ON public.student_accounts TO service_role;
ALTER TABLE public.student_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own account read" ON public.student_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own account insert" ON public.student_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own account update" ON public.student_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- New sign-ups: profile row + Student role. Idempotent so repeat events never duplicate.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, left(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 120))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  INSERT INTO public.student_accounts (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Replace the temporary public demo read on cohort tables with admin / assigned-mentor access.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['students','student_skill_scores','student_experience','career_preferences','career_goals','career_recommendations'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "demo public read" ON public.%I', t);
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', t);
    EXECUTE format('CREATE POLICY "admin or assigned mentor read" ON public.%I FOR SELECT TO authenticated USING (public.can_view_student(student_id))', t);
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.get_analytics(text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_analytics(text, text) TO authenticated;
