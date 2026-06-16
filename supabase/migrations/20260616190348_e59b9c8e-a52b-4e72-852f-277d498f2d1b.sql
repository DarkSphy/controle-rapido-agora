
-- 1. Role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role (SECURITY DEFINER, not callable by anon/auth via API)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 4. Policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. is_admin helper that the client can safely call
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- 6. Admin RPCs (role-gated, no password)
CREATE OR REPLACE FUNCTION public.admin_get_clients()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  document text,
  whatsapp text,
  start_date timestamptz,
  expires_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT u.id, u.email::text, p.display_name,
           s.document, s.whatsapp, s.start_date, s.expires_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN public.subscriptions s ON s.user_id = u.id
    ORDER BY u.created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_get_clients() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_clients() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_upsert_subscription(
  target_user_id uuid,
  p_document text,
  p_whatsapp text,
  p_start_date timestamptz,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.subscriptions (user_id, document, whatsapp, start_date, expires_at, grandfathered, status, environment)
  VALUES (target_user_id, p_document, p_whatsapp, p_start_date, p_expires_at, true, 'active', 'live')
  ON CONFLICT (user_id) DO UPDATE SET
    document = EXCLUDED.document,
    whatsapp = EXCLUDED.whatsapp,
    start_date = EXCLUDED.start_date,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_upsert_subscription(uuid, text, text, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_subscription(uuid, text, text, timestamptz, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_client(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_delete_client(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_client(uuid) TO authenticated;
