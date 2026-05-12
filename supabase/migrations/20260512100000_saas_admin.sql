-- 20260512100000_saas_admin.sql
-- Migration to add SaaS Admin Panel tables and secure RPC functions

-- 1. Create saas_subscriptions table
CREATE TABLE public.saas_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  document TEXT,
  whatsapp TEXT,
  start_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.saas_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 2. Secure RPC to list all clients (Bypasses RLS safely via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION admin_get_clients(admin_pass text)
RETURNS TABLE (
  id uuid,
  email varchar,
  display_name text,
  document text,
  whatsapp text,
  start_date timestamptz,
  expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF admin_pass = 'controleadm$' THEN
    RETURN QUERY 
    SELECT 
      u.id, 
      u.email, 
      p.display_name, 
      s.document, 
      s.whatsapp, 
      s.start_date, 
      s.expires_at, 
      u.created_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.saas_subscriptions s ON u.id = s.user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized';
  END IF;
END;
$$;

-- 3. Secure RPC to delete a client (Deletes from auth.users which cascades)
CREATE OR REPLACE FUNCTION admin_delete_client(admin_pass text, target_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF admin_pass = 'controleadm$' THEN
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized';
  END IF;
END;
$$;

-- 4. Secure RPC to upsert subscription details
CREATE OR REPLACE FUNCTION admin_upsert_subscription(
  admin_pass text, 
  target_user_id uuid, 
  p_document text, 
  p_whatsapp text, 
  p_start_date timestamptz, 
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF admin_pass = 'controleadm$' THEN
    INSERT INTO public.saas_subscriptions (user_id, document, whatsapp, start_date, expires_at)
    VALUES (target_user_id, p_document, p_whatsapp, p_start_date, p_expires_at)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      document = EXCLUDED.document,
      whatsapp = EXCLUDED.whatsapp,
      start_date = EXCLUDED.start_date,
      expires_at = EXCLUDED.expires_at,
      updated_at = now();
  ELSE
    RAISE EXCEPTION 'Unauthorized';
  END IF;
END;
$$;
