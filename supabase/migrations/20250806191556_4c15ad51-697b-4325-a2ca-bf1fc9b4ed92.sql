-- Create a price list table for admin management
CREATE TABLE public.price_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'SEK',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active price items" 
ON public.price_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage price items" 
ON public.price_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for timestamps
CREATE TRIGGER update_price_items_updated_at
BEFORE UPDATE ON public.price_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default price items
INSERT INTO public.price_items (category, name, description, price, sort_order) VALUES
('Bowling', 'Bowlingbana per timme', 'Vardagar', 150, 1),
('Bowling', 'Bowlingbana per timme', 'Helger', 180, 2),
('Bowling', 'Skor hyra', 'Per par', 30, 3),
('Padel', 'Padelcourt per timme', 'Vardagar', 200, 4),
('Padel', 'Padelcourt per timme', 'Helger', 250, 5),
('Padel', 'Racket hyra', 'Per par', 40, 6),
('Minigolf', 'Vuxen', 'Per person', 80, 7),
('Minigolf', 'Barn (under 12 år)', 'Per person', 60, 8),
('Dart', 'Dartbräda per timme', '', 50, 9),
('Shuffleboard', 'Shuffleboard per timme', '', 80, 10);