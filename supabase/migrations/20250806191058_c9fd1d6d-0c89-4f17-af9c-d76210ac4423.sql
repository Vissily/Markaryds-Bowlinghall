-- Check current Supabase storage configuration and increase limits
-- First check if there are any global storage limits we need to consider

-- Update bucket to have a more realistic file size limit for videos
UPDATE storage.buckets 
SET file_size_limit = 52428800 -- 50MB in bytes, more realistic for web uploads
WHERE id = 'gallery-images';

-- Also ensure the mime types are correct
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    'application/pdf'
]
WHERE id = 'gallery-images';