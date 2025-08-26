-- Remove all analytics data and tables to reduce database egress

-- Drop analytics view first 
DROP VIEW IF EXISTS public.event_interest_counts CASCADE;

-- Drop analytics tables (this will also remove all data)
DROP TABLE IF EXISTS public.analytics_page_views CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE; 
DROP TABLE IF EXISTS public.analytics_web_vitals CASCADE;

-- Drop the log-analytics edge function if it exists
DROP FUNCTION IF EXISTS public.log_analytics(jsonb);

-- Clean up any remaining analytics-related functions
DROP FUNCTION IF EXISTS public.track_page_view(text, text, text, text, integer, integer);
DROP FUNCTION IF EXISTS public.track_event(text, text, text, text, numeric, jsonb);