CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('contact','feedback')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  subject text CHECK (subject IS NULL OR char_length(subject) <= 150),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  rating int CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved')),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.support_messages TO anon;
GRANT SELECT, INSERT, UPDATE ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit" ON public.support_messages FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "admins read messages" ON public.support_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update messages" ON public.support_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.mentor_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL DEFAULT auth.uid(),
  student_id text NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('skills','career','roadmap','general')),
  note text NOT NULL CHECK (char_length(note) BETWEEN 2 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mentor_feedback_student_idx ON public.mentor_feedback(student_id);
GRANT SELECT, INSERT, DELETE ON public.mentor_feedback TO authenticated;
GRANT ALL ON public.mentor_feedback TO service_role;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "viewers read feedback" ON public.mentor_feedback FOR SELECT TO authenticated
  USING (public.can_view_student(student_id));
CREATE POLICY "assigned mentor writes" ON public.mentor_feedback FOR INSERT TO authenticated
  WITH CHECK (mentor_id = auth.uid() AND public.can_view_student(student_id));
CREATE POLICY "author or admin deletes" ON public.mentor_feedback FOR DELETE TO authenticated
  USING (mentor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

GRANT INSERT, DELETE ON public.user_roles TO authenticated;
CREATE POLICY "admins grant roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins revoke roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND NOT (user_id = auth.uid() AND role = 'admin'));

GRANT INSERT, DELETE ON public.mentor_assignments TO authenticated;
CREATE POLICY "admins assign" ON public.mentor_assignments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.has_role(mentor_id, 'mentor'));
CREATE POLICY "admins unassign" ON public.mentor_assignments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (id uuid, email text, full_name text, roles text[], created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
    SELECT u.id, u.email::text, p.full_name,
      COALESCE((SELECT array_agg(r.role::text ORDER BY r.role) FROM public.user_roles r WHERE r.user_id = u.id), '{}'),
      u.created_at
    FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;