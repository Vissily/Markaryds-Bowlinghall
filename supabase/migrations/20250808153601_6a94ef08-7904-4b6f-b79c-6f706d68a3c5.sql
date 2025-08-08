-- Sync current_participants with actual registrations and fix any inconsistencies

-- First, update all events to have correct participant counts
UPDATE public.events 
SET current_participants = (
  SELECT COUNT(*) 
  FROM public.event_registrations er 
  WHERE er.event_id = events.id
);

-- Create a function to sync participant counts (useful for manual fixes)
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