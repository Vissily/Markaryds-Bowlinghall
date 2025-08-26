-- Remove all analytics data and tables to reduce database egress

-- Drop analytics tables (this will also remove all data)
DROP TABLE IF EXISTS public.analytics_page_views CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE; 
DROP TABLE IF EXISTS public.analytics_web_vitals CASCADE;
DROP TABLE IF EXISTS public.event_interest_counts CASCADE;

-- Drop the log-analytics edge function if it exists
DROP FUNCTION IF EXISTS public.log_analytics(jsonb);

-- Clean up any remaining analytics-related functions
DROP FUNCTION IF EXISTS public.track_page_view(text, text, text, text, integer, integer);
DROP FUNCTION IF EXISTS public.track_event(text, text, text, text, numeric, jsonb);

-- Remove any analytics-related triggers if they exist
DROP TRIGGER IF EXISTS analytics_insert_trigger ON public.profiles;

-- Clean up any indexes that might have been created for analytics
-- (These will be automatically dropped with the tables, but listing for completeness)