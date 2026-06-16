
-- 1. Public catalog views that hide cost/margin/stock/supplier_id, exposing only computed price.
CREATE OR REPLACE VIEW public.catalog_products_public
WITH (security_invoker = on) AS
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

CREATE OR REPLACE VIEW public.catalog_variations_public
WITH (security_invoker = on) AS
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

-- 2. Revoke broad public SELECT on products/variations base tables.
DROP POLICY IF EXISTS "Products public select in catalog" ON public.products;
DROP POLICY IF EXISTS "Variations public select in catalog" ON public.variations;

-- 3. Tighten user_roles: only SELECT for self and admins; INSERT/UPDATE/DELETE only via service_role (no client path).
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- No INSERT/UPDATE/DELETE policies => only service_role (which bypasses RLS) can write.

-- 4. Lock down SECURITY DEFINER trigger/helper functions from being callable by signed-in users.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
