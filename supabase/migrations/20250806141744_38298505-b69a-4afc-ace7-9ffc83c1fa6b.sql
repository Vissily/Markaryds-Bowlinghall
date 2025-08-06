-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-images', 'gallery-images', true);

-- Create policies for gallery images bucket
CREATE POLICY "Anyone can view gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'gallery-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'gallery-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a table to track gallery images metadata
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on gallery_images table
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_images table
CREATE POLICY "Anyone can view gallery images metadata" 
ON public.gallery_images 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload gallery images metadata" 
ON public.gallery_images 
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all gallery images" 
ON public.gallery_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own gallery images" 
ON public.gallery_images 
FOR UPDATE 
USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own gallery images" 
ON public.gallery_images 
FOR DELETE 
USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();