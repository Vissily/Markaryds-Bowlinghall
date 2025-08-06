-- Create a function to add a specific email as admin when they sign up
CREATE OR REPLACE FUNCTION public.check_and_promote_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the new user's email should be an admin
  IF NEW.email = 'info@markarydsbowling.se' THEN
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically promote specific emails to admin
CREATE TRIGGER auto_promote_admin_emails
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_promote_admin_email();

-- Manually add the admin role if the user already exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if the user exists and get their ID
  SELECT user_id INTO admin_user_id 
  FROM public.profiles 
  WHERE email = 'info@markarydsbowling.se';
  
  -- If user exists, promote them to admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;