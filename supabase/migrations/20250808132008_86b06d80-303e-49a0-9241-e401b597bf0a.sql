-- Add featured date window columns for slideshow control
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS featured_start_date TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS featured_end_date TIMESTAMPTZ NULL;

-- Validation trigger to ensure start <= end when both provided
CREATE OR REPLACE FUNCTION public.validate_featured_window()
RETURNS trigger AS $$
BEGIN
  IF NEW.featured_start_date IS NOT NULL AND NEW.featured_end_date IS NOT NULL THEN
    IF NEW.featured_start_date > NEW.featured_end_date THEN
      RAISE EXCEPTION 'featured_start_date must be before or equal to featured_end_date';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

DROP TRIGGER IF EXISTS trg_validate_featured_window ON public.events;
CREATE TRIGGER trg_validate_featured_window
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.validate_featured_window();

-- Helpful index for range lookups
CREATE INDEX IF NOT EXISTS idx_events_featured_window ON public.events (featured_start_date, featured_end_date);
