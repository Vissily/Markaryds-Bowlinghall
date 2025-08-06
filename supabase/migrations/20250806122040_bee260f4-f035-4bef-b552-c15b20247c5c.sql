-- Create function to add new admin users (only callable by existing admins or via direct database access)
CREATE OR REPLACE FUNCTION public.add_admin_user(_email text, _password text, _display_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  result_message text;
BEGIN
  -- Check if caller is admin (optional check - can be removed for direct DB access)
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN 'Error: Only admins can add new users';
  END IF;
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = _email) THEN
    RETURN 'Error: User with this email already exists';
  END IF;
  
  -- This would normally create a user via Supabase Auth API
  -- For now, return instructions for manual creation
  result_message := 'To add user ' || _email || ' as admin:' || chr(10) ||
                   '1. User must sign up via Supabase Auth first' || chr(10) ||
                   '2. Then run: INSERT INTO user_roles (user_id, role) SELECT user_id, ''admin'' FROM profiles WHERE email = ''' || _email || ''';';
                   
  RETURN result_message;
END;
$$;