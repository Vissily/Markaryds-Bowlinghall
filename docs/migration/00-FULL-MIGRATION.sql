-- ============================================================
-- LOVABLE CLOUD FULL MIGRATION
-- Kör denna fil i det nya Lovable Cloud-projektet
-- Genererad: 2026-01-22
-- ============================================================

-- ============================================================
-- STEG 1: ENUM TYPES
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- ============================================================
-- STEG 2: TABLES
-- ============================================================

-- Profiles (user metadata)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user'::app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Role audit log
CREATE TABLE public.role_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  action TEXT NOT NULL,
  granted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Opening hours
CREATE TABLE public.opening_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  open_time TIME WITHOUT TIME ZONE,
  close_time TIME WITHOUT TIME ZONE,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price items
CREATE TABLE public.price_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SEK',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT DEFAULT 'tournament',
  status TEXT DEFAULT 'upcoming',
  featured BOOLEAN DEFAULT false,
  featured_start_date TIMESTAMP WITH TIME ZONE,
  featured_end_date TIMESTAMP WITH TIME ZONE,
  has_big_screen BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  registration_url TEXT,
  registration_email TEXT,
  registration_phone TEXT,
  registration_form_enabled BOOLEAN NOT NULL DEFAULT false,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  team_members TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event interests
CREATE TABLE public.event_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gallery images
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  uploaded_by UUID,
  is_featured BOOLEAN DEFAULT false,
  show_in_slideshow BOOLEAN DEFAULT false,
  show_in_hero BOOLEAN DEFAULT false,
  is_optimized BOOLEAN DEFAULT false,
  video_quality TEXT DEFAULT 'original',
  youtube_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Menu categories
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Livestreams
CREATE TABLE public.livestreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT,
  youtube_channel_id TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  is_main_stream BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Markarydsligan series
CREATE TABLE public.markarydsligan_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  schedule TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security audit log
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- STEG 3: INDEXES
-- ============================================================
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_gallery_images_slideshow ON public.gallery_images(show_in_slideshow);
CREATE INDEX idx_gallery_images_hero ON public.gallery_images(show_in_hero);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_interests_event ON public.event_interests(event_id);

-- ============================================================
-- STEG 4: DATABASE FUNCTIONS
-- ============================================================

-- has_role function (critical for RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- handle_new_user function (creates profile and role on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- check_and_promote_admin_email (auto-promote specific email to admin)
CREATE OR REPLACE FUNCTION public.check_and_promote_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 'info@markarydsbowling.se' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Event participant management
CREATE OR REPLACE FUNCTION public.increment_event_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_event_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events
  SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
  WHERE id = OLD.event_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_event_participants_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (OLD.event_id IS DISTINCT FROM NEW.event_id) THEN
    UPDATE public.events
    SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
    WHERE id = OLD.event_id;

    UPDATE public.events
    SET current_participants = COALESCE(current_participants, 0) + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_event_participant_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_registrations er 
    WHERE er.event_id = events.id
  );
END;
$$;

-- Event interest rate limiting
CREATE OR REPLACE FUNCTION public.enforce_event_interest_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  window_seconds integer := 600;
  max_per_window integer := 3;
  recent_count integer;
BEGIN
  IF NEW.user_id IS NULL AND (NEW.ip_hash IS NULL OR length(NEW.ip_hash) = 0) THEN
    RAISE EXCEPTION 'Missing identity (user_id or ip_hash required)';
  END IF;

  IF NEW.user_id IS NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.event_interests ei
    WHERE ei.event_id = NEW.event_id
      AND ei.ip_hash = NEW.ip_hash
      AND ei.created_at > now() - make_interval(secs => window_seconds);
  ELSE
    SELECT COUNT(*) INTO recent_count
    FROM public.event_interests ei
    WHERE ei.event_id = NEW.event_id
      AND ei.user_id = NEW.user_id
      AND ei.created_at > now() - make_interval(secs => window_seconds);
  END IF;

  IF recent_count >= max_per_window THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

-- Get event interest count (admin only)
CREATE OR REPLACE FUNCTION public.get_event_interest_count(_event_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cnt bigint := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  SELECT COUNT(*) INTO cnt
  FROM public.event_interests ei
  WHERE ei.event_id = _event_id;

  RETURN cnt;
END;
$$;

-- Featured window validation
CREATE OR REPLACE FUNCTION public.validate_featured_window()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.featured_start_date IS NOT NULL AND NEW.featured_end_date IS NOT NULL THEN
    IF NEW.featured_start_date > NEW.featured_end_date THEN
      RAISE EXCEPTION 'featured_start_date must be before or equal to featured_end_date';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Admin promotion functions
CREATE OR REPLACE FUNCTION public.secure_promote_to_admin_v2(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_id uuid;
  target_user_exists boolean;
  target_has_admin boolean;
  admin_count integer;
BEGIN
  requesting_user_id := auth.uid();
  
  IF requesting_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authentication required');
  END IF;
  
  SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin'::app_role;
  
  IF admin_count = 0 THEN
    NULL;
  ELSIF NOT has_role(requesting_user_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Admin privileges required');
  END IF;
  
  IF requesting_user_id = _target_user_id AND admin_count > 0 AND has_role(requesting_user_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot modify own admin status');
  END IF;
  
  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = _target_user_id) INTO target_user_exists;
  IF NOT target_user_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Target user not found');
  END IF;
  
  SELECT has_role(_target_user_id, 'admin'::app_role) INTO target_has_admin;
  IF target_has_admin THEN
    RETURN jsonb_build_object('success', false, 'message', 'User already has admin role');
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (_target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO role_audit_log (user_id, role, action, granted_by)
  VALUES (_target_user_id, 'admin'::app_role, 'GRANTED', requesting_user_id);
  
  RETURN jsonb_build_object('success', true, 'message', 'User promoted to admin successfully');
END;
$$;

-- Cleanup duplicate roles
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM user_roles 
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, role) id 
    FROM user_roles 
    ORDER BY user_id, role, created_at ASC
  );
END;
$$;

-- ============================================================
-- STEG 5: TRIGGERS
-- ============================================================

-- Auth trigger (skapas automatiskt av Lovable Cloud vid behov)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profile admin check
CREATE TRIGGER on_profile_created_check_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_and_promote_admin_email();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opening_hours_updated_at
  BEFORE UPDATE ON public.opening_hours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_items_updated_at
  BEFORE UPDATE ON public.price_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_livestreams_updated_at
  BEFORE UPDATE ON public.livestreams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_markarydsligan_series_updated_at
  BEFORE UPDATE ON public.markarydsligan_series
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event registration triggers
CREATE TRIGGER on_event_registration_insert
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.increment_event_participants();

CREATE TRIGGER on_event_registration_delete
  AFTER DELETE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.decrement_event_participants();

CREATE TRIGGER on_event_registration_update
  AFTER UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_event_participants_on_change();

-- Event interest rate limiting
CREATE TRIGGER enforce_event_interest_rate_limit
  BEFORE INSERT ON public.event_interests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_event_interest_rate_limit();

-- Featured window validation
CREATE TRIGGER validate_featured_window_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.validate_featured_window();

-- ============================================================
-- STEG 6: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markarydsligan_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view only their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- USER ROLES
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ROLE AUDIT LOG
CREATE POLICY "Admins can view audit logs" ON public.role_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- OPENING HOURS
CREATE POLICY "Anyone can view opening hours" ON public.opening_hours
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage opening hours" ON public.opening_hours
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- PRICE ITEMS
CREATE POLICY "Anyone can view active price items" ON public.price_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage price items" ON public.price_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- EVENTS
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (status <> 'cancelled');

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- EVENT REGISTRATIONS
CREATE POLICY "Users can submit registrations for enabled events" ON public.event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_registrations.event_id
        AND e.status <> 'cancelled'
        AND e.registration_form_enabled = true
    )
  );

CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view event registrations" ON public.event_registrations
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event registrations" ON public.event_registrations
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event registrations" ON public.event_registrations
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- EVENT INTERESTS
CREATE POLICY "Public cannot read event interests" ON public.event_interests
  FOR SELECT USING (false);

CREATE POLICY "Admins can view interests" ON public.event_interests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can register interest" ON public.event_interests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- GALLERY IMAGES
CREATE POLICY "Public can view gallery images" ON public.gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can view gallery metadata" ON public.gallery_images
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can upload gallery images" ON public.gallery_images
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own gallery images" ON public.gallery_images
  FOR UPDATE USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own gallery images" ON public.gallery_images
  FOR DELETE USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all gallery images" ON public.gallery_images
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- MENU CATEGORIES
CREATE POLICY "Anyone can view menu categories" ON public.menu_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu categories" ON public.menu_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- MENU ITEMS
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- LIVESTREAMS
CREATE POLICY "Anyone can view published livestreams" ON public.livestreams
  FOR SELECT USING (status <> 'cancelled');

CREATE POLICY "Admins can manage all livestreams" ON public.livestreams
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- SITE CONTENT
CREATE POLICY "Anyone can view site content" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site content" ON public.site_content
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- MARKARYDSLIGAN SERIES
CREATE POLICY "Anyone can view markarydsligan series" ON public.markarydsligan_series
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage markarydsligan series" ON public.markarydsligan_series
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SECURITY AUDIT LOG
CREATE POLICY "Admins can view security audit logs" ON public.security_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- STEG 7: STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Gallery images storage policies
CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own gallery images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Users can delete their own gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role)));

-- Event images storage policies
CREATE POLICY "Event images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own event images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Users can delete their own event images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role)));

-- ============================================================
-- STEG 8: SEED DATA (Grunddata)
-- ============================================================

-- Opening hours
INSERT INTO public.opening_hours (day_of_week, open_time, close_time, is_closed) VALUES
(1, '14:00', '21:00', false),
(2, '14:00', '21:00', false),
(3, '14:00', '21:00', false),
(4, '14:00', '21:00', false),
(5, '14:00', '22:00', false),
(6, '12:00', '22:00', false),
(0, '12:00', '20:00', false);

-- Price items
INSERT INTO public.price_items (category, name, description, price, currency, is_active, sort_order) VALUES
('bowling', 'Bowling per bana', 'Pris per bana och timme', 180, 'SEK', true, 1),
('bowling', 'Bowling efter kl 18', 'Pris per bana och timme kvällstid', 220, 'SEK', true, 2),
('bowling', 'Skohyra', 'Hyra av bowlingskor', 30, 'SEK', true, 3),
('bowling', 'Moonlight bowling', 'Fredag & lördag efter kl 20', 250, 'SEK', true, 4);

-- Menu categories
INSERT INTO public.menu_categories (name, sort_order) VALUES
('Varmrätter', 1),
('Smårätter', 2),
('Drycker', 3);

-- Site content
INSERT INTO public.site_content (section_key, title, subtitle, description, button_text, button_link) VALUES
('hero', 'Välkommen till Markaryds Bowling', 'Bowling, mat och nöje för hela familjen', 'Vi erbjuder bowling, god mat och trevlig atmosfär i hjärtat av Markaryd.', 'Boka nu', '#bokning'),
('about', 'Om oss', 'Sedan 1985', 'Markaryds Bowling har varit en samlingsplats för bowlingälskare i över 35 år.', NULL, NULL),
('activities', 'Våra aktiviteter', NULL, 'Vi erbjuder bowling för alla åldrar och tillfällen.', NULL, NULL),
('hours', 'Öppettider', NULL, 'Se våra aktuella öppettider nedan.', NULL, NULL),
('contact', 'Kontakt', NULL, 'Hör av dig till oss!', NULL, NULL);

-- Markarydsligan series
INSERT INTO public.markarydsligan_series (name, schedule, url, sort_order) VALUES
('Division 1', 'Tisdagar 18:00', 'https://bits.swebowl.se/serie-online?seasonId=2024&divisionId=1', 1),
('Division 2', 'Onsdagar 18:00', 'https://bits.swebowl.se/serie-online?seasonId=2024&divisionId=2', 2),
('Division 3', 'Torsdagar 18:00', 'https://bits.swebowl.se/serie-online?seasonId=2024&divisionId=3', 3);

-- ============================================================
-- KLAR! 
-- Nu behöver du:
-- 1. Ladda upp bilder till Storage (gallery-images, event-images)
-- 2. Skapa första admin-användaren (registrera med info@markarydsbowling.se)
-- 3. Kopiera över kod från det gamla projektet
-- ============================================================
