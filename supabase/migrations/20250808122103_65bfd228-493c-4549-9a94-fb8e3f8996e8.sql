-- Revoke execution of potentially risky function
DO $$ BEGIN
  -- Only revoke if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'promote_first_user_to_admin' AND p.pronargs = 0
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.promote_first_user_to_admin() FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.promote_first_user_to_admin() FROM anon;
    REVOKE EXECUTE ON FUNCTION public.promote_first_user_to_admin() FROM authenticated;
  END IF;
END $$;

-- Restrict direct access to event_interest_counts view
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'event_interest_counts' AND c.relkind IN ('v','m')
  ) THEN
    REVOKE ALL ON public.event_interest_counts FROM PUBLIC;
    REVOKE ALL ON public.event_interest_counts FROM anon;
    REVOKE ALL ON public.event_interest_counts FROM authenticated;
  END IF;
END $$;

-- Secure RPC to retrieve interest count (admin-only via has_role)
CREATE OR REPLACE FUNCTION public.get_event_interest_count(_event_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  cnt bigint := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  SELECT COUNT(*) INTO cnt
  FROM public.event_interests ei
  WHERE ei.event_id = _event_id;

  RETURN cnt;
END;
$$;

REVOKE ALL ON FUNCTION public.get_event_interest_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_interest_count(uuid) TO authenticated;