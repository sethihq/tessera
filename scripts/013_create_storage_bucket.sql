-- Create storage bucket for generated assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-assets',
  'generated-assets',
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);

-- Create storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'generated-assets' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow public read access
CREATE POLICY "Allow public read access to assets" ON storage.objects
FOR SELECT USING (bucket_id = 'generated-assets');

-- Create storage policy to allow users to delete their own assets
CREATE POLICY "Allow users to delete their own assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'generated-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
