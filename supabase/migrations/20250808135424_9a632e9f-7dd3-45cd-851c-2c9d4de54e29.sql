-- Add IP address columns to analytics tables
ALTER TABLE public.analytics_page_views ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS ip_address text;