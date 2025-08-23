-- Add video compression tracking columns to gallery_images table
ALTER TABLE public.gallery_images 
ADD COLUMN is_optimized boolean DEFAULT false,
ADD COLUMN video_quality text DEFAULT 'original';