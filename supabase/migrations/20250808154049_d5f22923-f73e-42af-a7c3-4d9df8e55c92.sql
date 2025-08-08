-- Remove duplicate triggers that are causing double counting
DROP TRIGGER IF EXISTS event_registrations_ai_inc_count ON public.event_registrations;
DROP TRIGGER IF EXISTS event_registrations_ad_dec_count ON public.event_registrations;

-- Keep only the properly named triggers we created
-- trigger_increment_participants and trigger_decrement_participants should remain

-- Fix the current count for the event to be correct
UPDATE public.events 
SET current_participants = (
  SELECT COUNT(*) 
  FROM public.event_registrations er 
  WHERE er.event_id = events.id
);