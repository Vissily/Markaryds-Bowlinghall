-- Add column to mark videos for hero section
ALTER TABLE gallery_images 
ADD COLUMN show_in_hero boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_gallery_images_show_in_hero ON gallery_images(show_in_hero) WHERE show_in_hero = true;