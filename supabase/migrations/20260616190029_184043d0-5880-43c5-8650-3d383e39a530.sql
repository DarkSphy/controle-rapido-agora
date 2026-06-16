
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

CREATE POLICY "Catalog images owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalog_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Catalog images owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'catalog_images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'catalog_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Catalog images owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'catalog_images' AND (storage.foldername(name))[1] = auth.uid()::text);
