-- Ensure consistent participant counting on registration changes
-- 1) Drop any existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS trigger_increment_participants ON public.event_registrations;
DROP TRIGGER IF EXISTS trigger_decrement_participants ON public.event_registrations;
DROP TRIGGER IF EXISTS trigger_update_participants ON public.event_registrations;
DROP TRIGGER IF EXISTS event_registrations_ai_inc_count ON public.event_registrations;
DROP TRIGGER IF EXISTS event_registrations_ad_dec_count ON public.event_registrations;

-- 2) Function to handle updates where event_id changes
CREATE OR REPLACE FUNCTION public.update_event_participants_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If event_id changed, decrement old and increment new
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

-- 3) Create proper triggers for insert/delete/update
CREATE TRIGGER trigger_increment_participants
AFTER INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.increment_event_participants();

CREATE TRIGGER trigger_decrement_participants
AFTER DELETE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.decrement_event_participants();

CREATE TRIGGER trigger_update_participants
AFTER UPDATE OF event_id ON public.event_registrations
FOR EACH ROW
WHEN (OLD.event_id IS DISTINCT FROM NEW.event_id)
EXECUTE FUNCTION public.update_event_participants_on_change();

-- 4) One-time full sync to correct any mismatches
SELECT public.sync_event_participant_counts();