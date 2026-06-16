-- Create bucket for catalog and product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalog_images', 'catalog_images', true) 
ON CONFLICT DO NOTHING;

-- Storage Policies
-- Allow public read access to all images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'catalog_images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalog_images');

-- Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'catalog_images');

-- Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'catalog_images');

-- Add new columns to catalog_settings
ALTER TABLE public.catalog_settings 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS banners JSONB DEFAULT '[]'::jsonb;
