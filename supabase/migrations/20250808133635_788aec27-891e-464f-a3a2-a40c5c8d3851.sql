-- Analytics tables for internal tracking
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  session_id text NOT NULL,
  path text NOT NULL,
  referrer text NULL,
  user_agent text NULL,
  viewport_width int NULL,
  viewport_height int NULL
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  session_id text NOT NULL,
  path text NOT NULL,
  event_name text NOT NULL,
  event_label text NULL,
  event_value numeric NULL,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.analytics_web_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  path text NOT NULL,
  name text NOT NULL, -- LCP, FID/INP, CLS, TTFB, FCP
  value numeric NOT NULL,
  rating text NULL
);

-- Enable RLS and secure access
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_web_vitals ENABLE ROW LEVEL SECURITY;

-- Admins can read analytics
CREATE POLICY IF NOT EXISTS "Admins can read analytics_page_views"
ON public.analytics_page_views FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can read analytics_events"
ON public.analytics_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can read analytics_web_vitals"
ON public.analytics_web_vitals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert analytics (no updates/deletes)
CREATE POLICY IF NOT EXISTS "Anyone can insert page_views"
ON public.analytics_page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert web_vitals"
ON public.analytics_web_vitals FOR INSERT
WITH CHECK (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_apv_created_at ON public.analytics_page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_apv_path ON public.analytics_page_views (path);
CREATE INDEX IF NOT EXISTS idx_ae_created_at ON public.analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_ae_event_name ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_awv_created_at ON public.analytics_web_vitals (created_at);
CREATE INDEX IF NOT EXISTS idx_awv_name ON public.analytics_web_vitals (name);
