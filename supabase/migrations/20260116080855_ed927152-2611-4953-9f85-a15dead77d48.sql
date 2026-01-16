-- Add youtube_url column to gallery_images for video embeds
ALTER TABLE public.gallery_images 
ADD COLUMN youtube_url TEXT NULL;

-- Add comment explaining usage
COMMENT ON COLUMN public.gallery_images.youtube_url IS 'YouTube video URL for embed - use instead of storing video files';