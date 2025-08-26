-- Increment/decrement participants when registrations change
-- Functions
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

-- Triggers (idempotent creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'event_registrations_ai_inc_count'
  ) THEN
    CREATE TRIGGER event_registrations_ai_inc_count
    AFTER INSERT ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.increment_event_participants();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'event_registrations_ad_dec_count'
  ) THEN
    CREATE TRIGGER event_registrations_ad_dec_count
    AFTER DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.decrement_event_participants();
  END IF;
END $$;

-- Backfill current counts from existing registrations
UPDATE public.events e
SET current_participants = sub.cnt
FROM (
  SELECT event_id, COUNT(*)::int AS cnt
  FROM public.event_registrations
  GROUP BY event_id
) sub
WHERE e.id = sub.event_id;