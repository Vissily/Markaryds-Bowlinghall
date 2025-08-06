-- Add column to track which images should show in slideshow
ALTER TABLE public.gallery_images 
ADD COLUMN show_in_slideshow BOOLEAN DEFAULT false;