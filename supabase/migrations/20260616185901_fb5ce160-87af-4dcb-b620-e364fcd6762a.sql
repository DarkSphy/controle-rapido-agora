
-- 1. Drop broad SELECT policy on public catalog_images bucket (listing) — direct URL access still works because bucket is public.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 2. Lock down SECURITY DEFINER functions so they are not callable by anon/authenticated via PostgREST.
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
