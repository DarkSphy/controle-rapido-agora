
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  margin NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  usage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products owner select" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Products owner insert" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Products owner update" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Products owner delete" ON public.products FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX products_user_idx ON public.products(user_id);

-- Variations
CREATE TABLE public.variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  margin NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variations owner select" ON public.variations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Variations owner insert" ON public.variations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Variations owner update" ON public.variations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Variations owner delete" ON public.variations FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX variations_product_idx ON public.variations(product_id);

-- Movements
CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  variation_id UUID REFERENCES public.variations(id) ON DELETE SET NULL,
  variation_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('in','out')),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movements owner select" ON public.movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Movements owner insert" ON public.movements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Movements owner delete" ON public.movements FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX movements_user_idx ON public.movements(user_id, created_at DESC);
