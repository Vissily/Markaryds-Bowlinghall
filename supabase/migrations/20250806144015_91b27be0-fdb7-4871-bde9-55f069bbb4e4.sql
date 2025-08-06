-- Create secure storage policies only if they don't exist
-- Drop existing policies first to recreate them properly

DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gallery images or admins can update any" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own gallery images or admins can delete any" ON storage.objects;

-- Create secure storage policies for gallery images
CREATE POLICY "Anyone can view gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own gallery images or admins can update any" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'gallery-images' 
  AND (
    (auth.uid())::text = (storage.foldername(name))[1] 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Users can delete their own gallery images or admins can delete any" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'gallery-images' 
  AND (
    (auth.uid())::text = (storage.foldername(name))[1] 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Create a function to securely promote users to admin with validation
CREATE OR REPLACE FUNCTION public.secure_promote_to_admin(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_id uuid;
  target_user_exists boolean;
  target_has_admin boolean;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Check if requesting user is authenticated
  IF requesting_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authentication required');
  END IF;
  
  -- Check if requesting user is admin (except for first user promotion)
  IF NOT has_role(requesting_user_id, 'admin'::app_role) THEN
    -- Allow first user promotion only if no admins exist
    IF EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin'::app_role) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Admin privileges required');
    END IF;
  END IF;
  
  -- Prevent self-promotion if user is already admin
  IF requesting_user_id = _target_user_id AND has_role(requesting_user_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot modify own admin status');
  END IF;
  
  -- Check if target user exists
  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = _target_user_id) INTO target_user_exists;
  IF NOT target_user_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Target user not found');
  END IF;
  
  -- Check if target already has admin role
  SELECT has_role(_target_user_id, 'admin'::app_role) INTO target_has_admin;
  IF target_has_admin THEN
    RETURN jsonb_build_object('success', false, 'message', 'User already has admin role');
  END IF;
  
  -- Add admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (_target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'message', 'User promoted to admin successfully');
END;
$$;