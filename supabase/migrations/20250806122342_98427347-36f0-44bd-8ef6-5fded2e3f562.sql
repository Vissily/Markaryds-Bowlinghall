-- Create menu categories table
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opening hours table
CREATE TABLE public.opening_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Enable RLS on all tables
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

-- Create policies - public can read, admins can edit
CREATE POLICY "Anyone can view menu categories" 
ON public.menu_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu categories" 
ON public.menu_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view menu items" 
ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items" 
ON public.menu_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view opening hours" 
ON public.opening_hours FOR SELECT USING (true);

CREATE POLICY "Admins can manage opening hours" 
ON public.opening_hours FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for timestamps
CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON public.menu_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opening_hours_updated_at
BEFORE UPDATE ON public.opening_hours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default menu categories
INSERT INTO public.menu_categories (name, sort_order) VALUES
('Förrätter', 1),
('Varmrätter', 2),
('Pizza', 3),
('Drycker', 4),
('Dessert', 5);

-- Insert default opening hours (closed by default)
INSERT INTO public.opening_hours (day_of_week, open_time, close_time, is_closed) VALUES
(1, '16:00', '22:00', false), -- Måndag
(2, '16:00', '22:00', false), -- Tisdag  
(3, '16:00', '22:00', false), -- Onsdag
(4, '16:00', '22:00', false), -- Torsdag
(5, '16:00', '23:00', false), -- Fredag
(6, '12:00', '23:00', false), -- Lördag
(0, '12:00', '22:00', false); -- Söndag