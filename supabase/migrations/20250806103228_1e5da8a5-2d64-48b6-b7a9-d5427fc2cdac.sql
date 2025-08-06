-- Create a temporary admin user for testing
-- You'll need to replace this email with your actual email address

-- First, let's check if there are any existing users
DO $$
BEGIN
  -- If no users exist, create a default admin setup
  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    -- Insert a default entry that will be updated when a real user signs up
    INSERT INTO public.profiles (id, user_id, email, display_name) 
    VALUES (
      gen_random_uuid(), 
      gen_random_uuid(), 
      'admin@markaryds.se', 
      'Admin Användare'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create a function to make any user an admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_user_admin(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user_id from email
  SELECT user_id INTO _user_id
  FROM public.profiles
  WHERE email = _email;
  
  IF _user_id IS NOT NULL THEN
    -- Remove existing roles
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'User % is now admin', _email;
  ELSE
    RAISE NOTICE 'User % not found', _email;
  END IF;
END;
$$;