-- Migration to add business settings
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creates the logos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;

-- Allows public access to view logos
CREATE POLICY "Logos public access" ON storage.objects FOR SELECT USING ( bucket_id = 'logos' );

-- Allows authenticated users to upload their own logos
CREATE POLICY "Logos upload access" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'logos' AND auth.role() = 'authenticated' );
CREATE POLICY "Logos update access" ON storage.objects FOR UPDATE USING ( bucket_id = 'logos' AND auth.role() = 'authenticated' );
CREATE POLICY "Logos delete access" ON storage.objects FOR DELETE USING ( bucket_id = 'logos' AND auth.role() = 'authenticated' );
