-- Storage security policies for gallery and event images
-- Allow public read access to specific buckets
CREATE POLICY "Public can view gallery and event images"
ON storage.objects
FOR SELECT
USING (bucket_id IN ('gallery-images', 'event-images'));

-- Allow authenticated users to upload only to their own folder (prefix matches auth.uid())
CREATE POLICY "Users can upload to own folder (gallery/event)"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('gallery-images', 'event-images')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow owners or admins to update their files
CREATE POLICY "Owner or admin can update files (gallery/event)"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id IN ('gallery-images', 'event-images')
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  bucket_id IN ('gallery-images', 'event-images')
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Allow owners or admins to delete their files
CREATE POLICY "Owner or admin can delete files (gallery/event)"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('gallery-images', 'event-images')
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Harden event_interests against abuse
-- 1) Add tracking columns
ALTER TABLE public.event_interests
  ADD COLUMN IF NOT EXISTS user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS ip_hash text NULL;

-- 2) Helpful indexes for rate-limiting checks
CREATE INDEX IF NOT EXISTS event_interests_event_ip_created_idx
  ON public.event_interests (event_id, ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS event_interests_event_user_created_idx
  ON public.event_interests (event_id, user_id, created_at DESC);

-- 3) Rate limiting trigger to enforce per-IP or per-user limits in a time window
CREATE OR REPLACE FUNCTION public.enforce_event_interest_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  window_seconds integer := 600; -- 10 minutes
  max_per_window integer := 3;   -- up to 3 per 10 minutes
  recent_count integer;
BEGIN
  -- Ensure at least one identity field is present
  IF NEW.user_id IS NULL AND (NEW.ip_hash IS NULL OR length(NEW.ip_hash) = 0) THEN
    RAISE EXCEPTION 'Missing identity (user_id or ip_hash required)';
  END IF;

  IF NEW.user_id IS NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.event_interests ei
    WHERE ei.event_id = NEW.event_id
      AND ei.ip_hash = NEW.ip_hash
      AND ei.created_at > now() - make_interval(secs => window_seconds);
  ELSE
    SELECT COUNT(*) INTO recent_count
    FROM public.event_interests ei
    WHERE ei.event_id = NEW.event_id
      AND ei.user_id = NEW.user_id
      AND ei.created_at > now() - make_interval(secs => window_seconds);
  END IF;

  IF recent_count >= max_per_window THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_interests_rate_limit ON public.event_interests;
CREATE TRIGGER trg_event_interests_rate_limit
BEFORE INSERT ON public.event_interests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_event_interest_rate_limit();

-- 4) Disallow direct anonymous inserts; force usage via Edge Function (service role bypasses RLS)
DROP POLICY IF EXISTS "Anyone can register interest" ON public.event_interests;
-- Keep admin-only SELECT policy as-is
