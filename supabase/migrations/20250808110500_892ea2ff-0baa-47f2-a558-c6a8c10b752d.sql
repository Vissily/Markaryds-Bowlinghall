-- Add image_url to events for single flyer image per event
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url text;

-- Create event_interests table to track anonymous interest clicks
CREATE TABLE IF NOT EXISTS public.event_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Policies: allow anyone to register interest (INSERT), but only admins can view
CREATE POLICY IF NOT EXISTS "Anyone can register interest"
ON public.event_interests
FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admins can view interests"
ON public.event_interests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON public.event_interests(event_id);

-- View to aggregate counts per event (admin-readable via underlying table policy)
CREATE OR REPLACE VIEW public.event_interest_counts AS
SELECT event_id, count(*)::bigint AS interest_count
FROM public.event_interests
GROUP BY event_id;

-- Storage bucket for event flyers (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images in this bucket
CREATE POLICY IF NOT EXISTS "Public can view event images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

-- Admins can manage images in this bucket
CREATE POLICY IF NOT EXISTS "Admins can manage event images"
ON storage.objects
FOR ALL
USING (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'event-images' AND has_role(auth.uid(), 'admin'::app_role));