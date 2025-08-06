-- Make the existing user (philipwendel@hotmail.com) an admin
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE p.email = 'philipwendel@hotmail.com'
ON CONFLICT (user_id, role) DO NOTHING;