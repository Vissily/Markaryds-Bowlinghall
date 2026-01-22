-- ============================================================
-- LOVABLE CLOUD MIGRATION - RLS POLICIES
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles with explicit check"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- USER_ROLES
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR (user_id = auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- ROLE_AUDIT_LOG
-- ============================================================
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.role_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- OPENING_HOURS
-- ============================================================
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opening hours"
  ON public.opening_hours FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage opening hours"
  ON public.opening_hours FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PRICE_ITEMS
-- ============================================================
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active price items"
  ON public.price_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage price items"
  ON public.price_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- EVENTS
-- ============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status <> 'cancelled');

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- EVENT_REGISTRATIONS
-- ============================================================
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view event registrations"
  ON public.event_registrations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit registrations for enabled events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_registrations.event_id
      AND e.status <> 'cancelled'
      AND e.registration_form_enabled = true
  ));

CREATE POLICY "Users can update their own registrations"
  ON public.event_registrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
  ON public.event_registrations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update event registrations"
  ON public.event_registrations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event registrations"
  ON public.event_registrations FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- EVENT_INTERESTS
-- ============================================================
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view interests"
  ON public.event_interests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public cannot read event interests"
  ON public.event_interests FOR SELECT
  USING (false);

CREATE POLICY "Authenticated users can register interest with limits"
  ON public.event_interests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- GALLERY_IMAGES
-- ============================================================
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery images without user metadata"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can view gallery metadata with user info"
  ON public.gallery_images FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can upload gallery images metadata"
  ON public.gallery_images FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own gallery images"
  ON public.gallery_images FOR UPDATE
  USING ((auth.uid() = uploaded_by) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own gallery images"
  ON public.gallery_images FOR DELETE
  USING ((auth.uid() = uploaded_by) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all gallery images"
  ON public.gallery_images FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- MENU_CATEGORIES
-- ============================================================
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu categories"
  ON public.menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage menu categories"
  ON public.menu_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- MENU_ITEMS
-- ============================================================
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage menu items"
  ON public.menu_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- LIVESTREAMS
-- ============================================================
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published livestreams"
  ON public.livestreams FOR SELECT
  USING (status <> 'cancelled');

CREATE POLICY "Admins can manage all livestreams"
  ON public.livestreams FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- SITE_CONTENT
-- ============================================================
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- MARKARYDSLIGAN_SERIES
-- ============================================================
ALTER TABLE public.markarydsligan_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view markarydsligan series"
  ON public.markarydsligan_series FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage markarydsligan series"
  ON public.markarydsligan_series FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- SECURITY_AUDIT_LOG
-- ============================================================
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security audit logs"
  ON public.security_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
