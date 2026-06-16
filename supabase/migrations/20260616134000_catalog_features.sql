-- Adiciona colunas em products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_catalog BOOLEAN NOT NULL DEFAULT false;

-- Configurações de catálogo e empresa
CREATE TABLE public.catalog_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_number TEXT,
  company_name TEXT,
  colors JSONB DEFAULT '{"primary": "#2C3E50", "accent": "#7FB69D", "background": "#F9FBF9", "card": "#FFFFFF"}'::jsonb,
  font_family TEXT DEFAULT 'Inter',
  banner_url TEXT,
  banner_text TEXT,
  banner_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog settings owner select" ON public.catalog_settings FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Catalog settings owner insert" ON public.catalog_settings FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Catalog settings owner update" ON public.catalog_settings FOR UPDATE USING (auth.uid() = id);
-- Permite leitura pública de todas as configurações
CREATE POLICY "Catalog settings public select" ON public.catalog_settings FOR SELECT USING (true);

-- Trigger de updated_at para catalog_settings
CREATE TRIGGER catalog_settings_touch BEFORE UPDATE ON public.catalog_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Kits
CREATE TABLE public.kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  in_catalog BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kits owner select" ON public.kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kits owner insert" ON public.kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kits owner update" ON public.kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kits owner delete" ON public.kits FOR DELETE USING (auth.uid() = user_id);
-- Permite leitura pública de kits ativados no catálogo
CREATE POLICY "Kits public select in catalog" ON public.kits FOR SELECT USING (in_catalog = true);

CREATE TRIGGER kits_touch BEFORE UPDATE ON public.kits FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX kits_user_idx ON public.kits(user_id);

-- Kit items
CREATE TABLE public.kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES public.variations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kit items owner select" ON public.kit_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.kits WHERE id = kit_id));
CREATE POLICY "Kit items owner insert" ON public.kit_items FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.kits WHERE id = kit_id));
CREATE POLICY "Kit items owner update" ON public.kit_items FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.kits WHERE id = kit_id));
CREATE POLICY "Kit items owner delete" ON public.kit_items FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.kits WHERE id = kit_id));
-- Permite leitura pública dos itens de um kit que está no catálogo
CREATE POLICY "Kit items public select in catalog" ON public.kit_items FOR SELECT USING (
  kit_id IN (SELECT id FROM public.kits WHERE in_catalog = true)
);

-- Habilitar leitura pública para products e variations ativados no catálogo
CREATE POLICY "Products public select in catalog" ON public.products FOR SELECT USING (in_catalog = true);
CREATE POLICY "Variations public select in catalog" ON public.variations FOR SELECT USING (
  product_id IN (SELECT id FROM public.products WHERE in_catalog = true)
);
