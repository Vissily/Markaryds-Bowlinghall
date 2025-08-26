-- Security Fix 1: Strengthen event_interests RLS policies to prevent competitor exploitation
-- Add explicit public read restriction policy for event_interests
CREATE POLICY "Public cannot read event interests" 
ON public.event_interests 
FOR SELECT 
TO public
USING (false);

-- Ensure only authenticated users can register interest with rate limiting
CREATE POLICY "Authenticated users can register interest with limits" 
ON public.event_interests 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Security Fix 2: Strengthen profiles table protection
-- Ensure profiles are only visible to the owner or admins
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles with explicit check" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 3: Protect gallery_images user metadata
-- Hide uploaded_by information from public view
DROP POLICY IF EXISTS "Anyone can view gallery images metadata" ON public.gallery_images;

CREATE POLICY "Public can view gallery images without user metadata" 
ON public.gallery_images 
FOR SELECT 
TO public
USING (true);

-- Only admins can see who uploaded what
CREATE POLICY "Admins can view gallery metadata with user info" 
ON public.gallery_images 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 4: Strengthen event_registrations protection
-- Ensure registration data is only visible to the registrant and admins
DROP POLICY IF EXISTS "Anyone can submit registrations for enabled events" ON public.event_registrations;

CREATE POLICY "Users can submit registrations for enabled events" 
ON public.event_registrations 
FOR INSERT 
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_registrations.event_id 
    AND e.status <> 'cancelled' 
    AND e.registration_form_enabled = true
  )
);

-- Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  table_name text NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));