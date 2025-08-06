-- Create content management tables
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policies - public can read, admins can edit
CREATE POLICY "Anyone can view site content" 
ON public.site_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site content" 
ON public.site_content 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for timestamps
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for Hero section
INSERT INTO public.site_content (section_key, title, subtitle, description, button_text, button_link, metadata) 
VALUES (
  'hero',
  'Markaryds Bowlinghall',
  'Sedan 2013',
  'Mer än bara bowling – upplev padel, minigolf, dart och shuffleboard i Smålands modernaste aktivitetshall',
  'Boka Din Aktivitet',
  '#activities',
  '{"stats": [{"icon": "Users", "value": "450", "label": "Spelare per vecka"}, {"icon": "Calendar", "value": "70", "label": "Öppettimmar per vecka"}, {"icon": "Star", "value": "5", "label": "Olika aktiviteter"}]}'
);

-- Insert content for other sections
INSERT INTO public.site_content (section_key, title, description) VALUES
('about', 'Om Markaryds Bowlinghall', 'Vi har varit en del av Markaryd sedan 2013 och erbjuder mycket mer än bara bowling.'),
('activities', 'Våra Aktiviteter', 'Upplev våra olika aktiviteter i en modern och välkomnande miljö.'),
('hours', 'Öppettider', 'Vi är öppna sju dagar i veckan för din bekvämlighet.'),
('contact', 'Kontakta Oss', 'Välkommen att höra av dig för bokning eller frågor.');