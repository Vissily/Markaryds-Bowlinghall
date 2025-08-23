-- Instead of removing videos, let's add file size constraints for future uploads
-- and add metadata to track video optimization

-- Add file size constraint (allow existing large files but prevent new ones over 10MB)
ALTER TABLE gallery_images 
ADD CONSTRAINT check_file_size_for_new_uploads 
CHECK (
  (created_at < '2024-01-01'::timestamp) OR 
  (file_size IS NULL) OR 
  (file_size <= 10485760)
);

-- Add optimization metadata
ALTER TABLE gallery_images 
ADD COLUMN video_quality text DEFAULT 'original',
ADD COLUMN is_optimized boolean DEFAULT false;

-- Mark existing videos as needing optimization
UPDATE gallery_images 
SET video_quality = 'original', is_optimized = false 
WHERE mime_type LIKE 'video/%' AND file_size > 10485760;

-- Add comment for future reference
COMMENT ON COLUMN gallery_images.video_quality IS 'Video quality level: original, compressed, optimized';
COMMENT ON COLUMN gallery_images.is_optimized IS 'Whether video has been optimized for web delivery';