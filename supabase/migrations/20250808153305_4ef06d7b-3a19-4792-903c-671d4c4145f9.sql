-- Add triggers to automatically update participant count when registrations are added/deleted

-- Create triggers for event_registrations table
CREATE TRIGGER trigger_increment_participants
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_event_participants();

CREATE TRIGGER trigger_decrement_participants
  AFTER DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_event_participants();