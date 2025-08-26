-- Allow admins to delete event registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'event_registrations' 
      AND policyname = 'Admins can delete event registrations'
  ) THEN
    CREATE POLICY "Admins can delete event registrations"
    ON public.event_registrations
    FOR DELETE
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;