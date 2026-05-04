-- 20260505120000_add_new_features.sql
-- Migration to add new tables and columns for new features

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers owner select" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Suppliers owner insert" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Suppliers owner update" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Suppliers owner delete" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

-- Add supplier_id column to products
ALTER TABLE public.products ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories owner select" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Categories owner insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Categories owner update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Categories owner delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Add category_id column to products
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Price history table (records purchase price per inbound movement)
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  purchase_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PriceHistory owner select" ON public.price_history FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.products WHERE id = product_id));
CREATE POLICY "PriceHistory owner insert" ON public.price_history FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.products WHERE id = product_id));

-- Kits table (composite products)
CREATE TABLE public.kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kits owner select" ON public.kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kits owner insert" ON public.kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kits owner update" ON public.kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kits owner delete" ON public.kits FOR DELETE USING (auth.uid() = user_id);

-- Kit items junction table
CREATE TABLE public.kit_items (
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (kit_id, product_id)
);
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "KitItems owner select" ON public.kit_items FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.kits WHERE id = kit_id));
CREATE POLICY "KitItems owner insert" ON public.kit_items FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.kits WHERE id = kit_id));
CREATE POLICY "KitItems owner delete" ON public.kit_items FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.kits WHERE id = kit_id));

-- Users table for multi‑user (extend profiles with role)
ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'operator';
-- optional: enforce only admin can change role via RLS policies (out of scope for this migration)

-- End of migration
