-- Create admin user directly
-- This will use Supabase's internal functions to create the user

-- First, let's create a function that can create users with specific passwords
CREATE OR REPLACE FUNCTION public.create_admin_user_with_password(
  _email text,
  _password text,
  _display_name text DEFAULT 'Admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_user_id uuid;
  result_data jsonb;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = _email) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'User already exists with email: ' || _email
    );
  END IF;

  -- Generate a UUID for the new user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users (this is normally done by Supabase Auth, but we'll simulate it)
  -- Note: This is a simplified approach and may not work exactly like Supabase Auth
  
  -- Instead, let's create a profile entry and role, then provide instructions
  -- for manual user creation
  
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Direct user creation requires Supabase Auth API. Please use the signup form or auth admin panel.',
    'instructions', 'Go to Supabase Dashboard > Authentication > Users > Invite User',
    'email', _email,
    'suggested_password', _password
  );
END;
$$;

-- Run the function
SELECT public.create_admin_user_with_password('info@markarydsbowling.se', 'egTXzsi0pz51E6S');