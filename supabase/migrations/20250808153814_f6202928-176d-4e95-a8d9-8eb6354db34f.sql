-- Force update the specific event with incorrect count
UPDATE public.events 
SET current_participants = (
  SELECT COUNT(*) 
  FROM public.event_registrations er 
  WHERE er.event_id = events.id
)
WHERE id = '2cb5d037-9167-4903-86f7-c37b49ca6ebe';

-- Also ensure triggers work correctly by dropping and recreating them
DROP TRIGGER IF EXISTS trigger_increment_participants ON public.event_registrations;
DROP TRIGGER IF EXISTS trigger_decrement_participants ON public.event_registrations;

-- Recreate triggers with proper timing
CREATE TRIGGER trigger_increment_participants
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_event_participants();

CREATE TRIGGER trigger_decrement_participants
  AFTER DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_event_participants();