-- Fix previous policy creation (no IF NOT EXISTS support)
-- Drop if exist then create

-- Page views
DROP POLICY IF EXISTS "Admins can read analytics_page_views" ON public.analytics_page_views;
CREATE POLICY "Admins can read analytics_page_views"
ON public.analytics_page_views FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can insert page_views" ON public.analytics_page_views;
CREATE POLICY "Anyone can insert page_views"
ON public.analytics_page_views FOR INSERT
WITH CHECK (true);

-- Events
DROP POLICY IF EXISTS "Admins can read analytics_events" ON public.analytics_events;
CREATE POLICY "Admins can read analytics_events"
ON public.analytics_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;
CREATE POLICY "Anyone can insert events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Web vitals
DROP POLICY IF EXISTS "Admins can read analytics_web_vitals" ON public.analytics_web_vitals;
CREATE POLICY "Admins can read analytics_web_vitals"
ON public.analytics_web_vitals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can insert web_vitals" ON public.analytics_web_vitals;
CREATE POLICY "Anyone can insert web_vitals"
ON public.analytics_web_vitals FOR INSERT
WITH CHECK (true);
