-- Create livestreams table for managing YouTube streams and scheduled streams
CREATE TABLE public.livestreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT, -- For YouTube video/stream ID
  youtube_channel_id TEXT, -- For YouTube channel ID
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  is_main_stream BOOLEAN DEFAULT false, -- Mark as main stream to show on page
  featured BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;

-- Create policies for livestreams
CREATE POLICY "Anyone can view published livestreams" 
ON public.livestreams 
FOR SELECT 
USING (status != 'cancelled');

CREATE POLICY "Admins can manage all livestreams" 
ON public.livestreams 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_livestreams_updated_at
BEFORE UPDATE ON public.livestreams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default main YouTube channel/stream entry
INSERT INTO public.livestreams (
  title, 
  description, 
  youtube_channel_id, 
  status, 
  is_main_stream,
  featured
) VALUES (
  'Markaryds Bowlinghall Livestream',
  'Direktsänd bowling från Markaryds Bowlinghall',
  'UC_x5XG1OV2P6uZZ5FSM9Ttw', -- Replace with actual YouTube channel ID
  'live',
  true,
  true
);