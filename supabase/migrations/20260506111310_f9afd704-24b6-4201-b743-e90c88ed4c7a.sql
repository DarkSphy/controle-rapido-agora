
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat_select" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cat_insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cat_update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cat_delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER categories_touch BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sup_select" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sup_insert" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sup_update" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sup_delete" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER suppliers_touch BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  cpf text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cus_select" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cus_insert" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cus_update" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cus_delete" ON public.customers FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;

CREATE TABLE public.kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kit_select" ON public.kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "kit_insert" ON public.kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kit_update" ON public.kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "kit_delete" ON public.kits FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER kits_touch BEFORE UPDATE ON public.kits FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.kit_items (
  kit_id uuid NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  PRIMARY KEY (kit_id, product_id)
);
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ki_select" ON public.kit_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.kits k WHERE k.id = kit_id AND k.user_id = auth.uid()));
CREATE POLICY "ki_insert" ON public.kit_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.kits k WHERE k.id = kit_id AND k.user_id = auth.uid()));
CREATE POLICY "ki_update" ON public.kit_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.kits k WHERE k.id = kit_id AND k.user_id = auth.uid()));
CREATE POLICY "ki_delete" ON public.kit_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.kits k WHERE k.id = kit_id AND k.user_id = auth.uid()));

CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sal_select" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sal_insert" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sal_update" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sal_delete" ON public.sales FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "si_select" ON public.sale_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.user_id = auth.uid()));
CREATE POLICY "si_insert" ON public.sale_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.user_id = auth.uid()));
CREATE POLICY "si_update" ON public.sale_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.user_id = auth.uid()));
CREATE POLICY "si_delete" ON public.sale_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.user_id = auth.uid()));

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pur_select" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pur_insert" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pur_update" ON public.purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pur_delete" ON public.purchases FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pi_select" ON public.purchase_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_id AND p.user_id = auth.uid()));
CREATE POLICY "pi_insert" ON public.purchase_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_id AND p.user_id = auth.uid()));
CREATE POLICY "pi_update" ON public.purchase_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_id AND p.user_id = auth.uid()));
CREATE POLICY "pi_delete" ON public.purchase_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.purchases p WHERE p.id = purchase_id AND p.user_id = auth.uid()));

CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  purchase_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_select" ON public.price_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.products pr WHERE pr.id = product_id AND pr.user_id = auth.uid()));
CREATE POLICY "ph_insert" ON public.price_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.products pr WHERE pr.id = product_id AND pr.user_id = auth.uid()));
CREATE POLICY "ph_delete" ON public.price_history FOR DELETE USING (EXISTS (SELECT 1 FROM public.products pr WHERE pr.id = product_id AND pr.user_id = auth.uid()));
