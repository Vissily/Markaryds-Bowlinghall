-- Create Markarydsligan series table
CREATE TABLE IF NOT EXISTS public.markarydsligan_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  schedule text NOT NULL,
  url text NOT NULL,
  sort_order integer NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.markarydsligan_series ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'markarydsligan_series' AND policyname = 'Anyone can view markarydsligan series'
  ) THEN
    CREATE POLICY "Anyone can view markarydsligan series"
    ON public.markarydsligan_series
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'markarydsligan_series' AND policyname = 'Admins can manage markarydsligan series'
  ) THEN
    CREATE POLICY "Admins can manage markarydsligan series"
    ON public.markarydsligan_series
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_markarydsligan_series_updated_at'
  ) THEN
    CREATE TRIGGER update_markarydsligan_series_updated_at
    BEFORE UPDATE ON public.markarydsligan_series
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_markarydsligan_series_sort_order
ON public.markarydsligan_series (sort_order, name);
