
-- Remove overly permissive public SELECT policies
DROP POLICY IF EXISTS "Public read business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Categorias Publicas" ON public.categories;
DROP POLICY IF EXISTS "Public can view catalog products" ON public.products;

-- Public categories view (safe subset) for anonymous catalog visitors
CREATE OR REPLACE VIEW public.catalog_categories_public
WITH (security_invoker = off) AS
SELECT id, user_id, name FROM public.categories;

GRANT SELECT ON public.catalog_categories_public TO anon, authenticated;

-- Storage: remove non-owner-scoped policies on logos and catalog_images
DROP POLICY IF EXISTS "Logos update access" ON storage.objects;
DROP POLICY IF EXISTS "Logos delete access" ON storage.objects;
DROP POLICY IF EXISTS "Logos upload access" ON storage.objects;
DROP POLICY IF EXISTS "Catalog Images Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Catalog Images Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Catalog Images Authenticated users can upload" ON storage.objects;
