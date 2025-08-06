-- Phase 1: Fix Critical RLS Policy Issues

-- 1. Fix Profile Visibility - Remove overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more secure profile visibility policies
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Add unique constraint to prevent duplicate roles per user
-- (This constraint may already exist, but adding for safety)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_role_key'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
    END IF;
END $$;

-- 3. Create audit table for role changes
CREATE TABLE IF NOT EXISTS public.role_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role app_role NOT NULL,
    action text NOT NULL, -- 'GRANTED', 'REVOKED'
    granted_by uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.role_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create improved secure role promotion function
CREATE OR REPLACE FUNCTION public.secure_promote_to_admin_v2(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requesting_user_id uuid;
  target_user_exists boolean;
  target_has_admin boolean;
  admin_count integer;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Check if requesting user is authenticated
  IF requesting_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authentication required');
  END IF;
  
  -- Count existing admins
  SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin'::app_role;
  
  -- Allow first user promotion only if no admins exist
  IF admin_count = 0 THEN
    -- First admin promotion - allowed
    NULL;
  ELSIF NOT has_role(requesting_user_id, 'admin'::app_role) THEN
    -- Not first admin and user is not admin
    RETURN jsonb_build_object('success', false, 'message', 'Admin privileges required');
  END IF;
  
  -- Prevent self-promotion if user is already admin (except first user)
  IF requesting_user_id = _target_user_id AND admin_count > 0 AND has_role(requesting_user_id, 'admin'::app_role) THEN
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
  
  -- Log the action
  INSERT INTO role_audit_log (user_id, role, action, granted_by)
  VALUES (_target_user_id, 'admin'::app_role, 'GRANTED', requesting_user_id);
  
  RETURN jsonb_build_object('success', true, 'message', 'User promoted to admin successfully');
END;
$function$;

-- 5. Create function to clean up duplicate roles (if any exist)
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove duplicate role entries, keeping the oldest one
  DELETE FROM user_roles 
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, role) id 
    FROM user_roles 
    ORDER BY user_id, role, created_at ASC
  );
END;
$function$;

-- Run the cleanup
SELECT cleanup_duplicate_roles();