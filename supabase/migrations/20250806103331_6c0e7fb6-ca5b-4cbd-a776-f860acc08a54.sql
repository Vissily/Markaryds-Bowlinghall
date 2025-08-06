-- Create a simple function to promote any user to admin
CREATE OR REPLACE FUNCTION public.promote_first_user_to_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user that doesn't have admin role yet
  SELECT p.user_id INTO first_user_id
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.role = 'admin'
  WHERE ur.user_id IS NULL
  ORDER BY p.created_at
  LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Make them admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'First user promoted to admin: %', first_user_id;
  ELSE
    RAISE NOTICE 'No users found to promote or admin already exists';
  END IF;
END;
$$;

-- Run the function to promote the first user
SELECT public.promote_first_user_to_admin();