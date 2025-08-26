-- Add registration form flag to events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS registration_form_enabled boolean NOT NULL DEFAULT false;

-- Create event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  phone_number text NOT NULL,
  team_members text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts only when event has form enabled and not cancelled
CREATE POLICY "Anyone can submit registrations for enabled events"
ON public.event_registrations
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id
      AND e.status <> 'cancelled'
      AND e.registration_form_enabled = true
  )
);

-- Allow admins to view registrations
CREATE POLICY "Admins can view event registrations"
ON public.event_registrations
FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);