-- Update gallery-images bucket to support videos and PDFs with 100MB limit
UPDATE storage.buckets 
SET 
  file_size_limit = 104857600, -- 100MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    'application/pdf'
  ]
WHERE id = 'gallery-images';