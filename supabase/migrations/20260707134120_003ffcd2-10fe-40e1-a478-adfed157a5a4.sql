
-- Recreate catalog views as SECURITY DEFINER (invoker=off) so anon can read
-- only the safe computed columns, without any RLS grant on the base tables.
DROP VIEW IF EXISTS public.catalog_products_public;
DROP VIEW IF EXISTS public.catalog_variations_public;

CREATE VIEW public.catalog_products_public
WITH (security_invoker = off) AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.description,
  p.image,
  p.category_id,
  p.in_catalog,
  ROUND((p.cost * (1 + COALESCE(p.margin, 0) / 100))::numeric, 2) AS price,
  EXISTS (SELECT 1 FROM public.variations v WHERE v.product_id = p.id) AS has_variations
FROM public.products p
WHERE p.in_catalog = true;

CREATE VIEW public.catalog_variations_public
WITH (security_invoker = off) AS
SELECT
  v.id,
  v.product_id,
  v.user_id,
  v.name,
  ROUND((v.cost * (1 + COALESCE(v.margin, 0) / 100))::numeric, 2) AS price
FROM public.variations v
WHERE v.product_id IN (SELECT id FROM public.products WHERE in_catalog = true);

GRANT SELECT ON public.catalog_products_public TO anon, authenticated;
GRANT SELECT ON public.catalog_variations_public TO anon, authenticated;

-- Public view for the seller's logo + display name/address only.
CREATE OR REPLACE VIEW public.business_settings_public
WITH (security_invoker = off) AS
SELECT
  user_id,
  name,
  address,
  logo_url
FROM public.business_settings;

GRANT SELECT ON public.business_settings_public TO anon, authenticated;
