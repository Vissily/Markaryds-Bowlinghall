-- ============================================================
-- LOVABLE CLOUD MIGRATION - STORAGE BUCKETS
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true);

-- ============================================================
-- STORAGE POLICIES - gallery-images
-- ============================================================

-- Public read access
CREATE POLICY "Public gallery images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-images' 
    AND auth.uid() IS NOT NULL
  );

-- Users can update their own uploads or admins can update any
CREATE POLICY "Users can update their gallery uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gallery-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- Users can delete their own uploads or admins can delete any
CREATE POLICY "Users can delete their gallery uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- ============================================================
-- STORAGE POLICIES - event-images
-- ============================================================

-- Public read access
CREATE POLICY "Public event images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-images' 
    AND auth.uid() IS NOT NULL
  );

-- Users can update their own uploads or admins can update any
CREATE POLICY "Users can update their event uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- Users can delete their own uploads or admins can delete any
CREATE POLICY "Users can delete their event uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT has_role(auth.uid(), 'admin'::app_role))
    )
  );
