-- ============================================================
-- LOVABLE CLOUD MIGRATION - DATABASE FUNCTIONS
-- ============================================================

-- has_role function (critical for RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- handle_new_user function (creates profile and role on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- check_and_promote_admin_email (auto-promote specific email to admin)
CREATE OR REPLACE FUNCTION public.check_and_promote_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 'info@markarydsbowling.se' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Event participant management
CREATE OR REPLACE FUNCTION public.increment_event_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_event_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events
  SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
  WHERE id = OLD.event_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_event_participants_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (OLD.event_id IS DISTINCT FROM NEW.event_id) THEN
    UPDATE public.events
    SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
    WHERE id = OLD.event_id;

    UPDATE public.events
    SET current_participants = COALESCE(current_participants, 0) + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_event_participant_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_registrations er 
    WHERE er.event_id = events.id
  );
END;
$$;

-- Event interest rate limiting
CREATE OR REPLACE FUNCTION public.enforce_event_interest_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  window_seconds integer := 600;
  max_per_window integer := 3;
  recent_count integer;
BEGIN
  IF NEW.user_id IS NULL AND (NEW.ip_hash IS NULL OR length(NEW.ip_hash) = 0) THEN
    RAISE EXCEPTION 'Missing identity (user_id or ip_hash required)';
  END IF;

  IF NEW.user_id IS NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.event_interests ei
    WHERE ei.event_id = NEW.event_id
      AND ei.ip_hash = NEW.ip_hash
      AND ei.created_at > now() - make_interval(secs => window_seconds);
  ELSE
    SELECT COUNT(*) INTO recent_count
    FROM public.event_interests ei
    WHERE ei.event_id = NEW.event_id
      AND ei.user_id = NEW.user_id
      AND ei.created_at > now() - make_interval(secs => window_seconds);
  END IF;

  IF recent_count >= max_per_window THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

-- Get event interest count (admin only)
CREATE OR REPLACE FUNCTION public.get_event_interest_count(_event_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cnt bigint := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  SELECT COUNT(*) INTO cnt
  FROM public.event_interests ei
  WHERE ei.event_id = _event_id;

  RETURN cnt;
END;
$$;

-- Featured window validation
CREATE OR REPLACE FUNCTION public.validate_featured_window()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.featured_start_date IS NOT NULL AND NEW.featured_end_date IS NOT NULL THEN
    IF NEW.featured_start_date > NEW.featured_end_date THEN
      RAISE EXCEPTION 'featured_start_date must be before or equal to featured_end_date';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Admin promotion functions
CREATE OR REPLACE FUNCTION public.secure_promote_to_admin_v2(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_id uuid;
  target_user_exists boolean;
  target_has_admin boolean;
  admin_count integer;
BEGIN
  requesting_user_id := auth.uid();
  
  IF requesting_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authentication required');
  END IF;
  
  SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin'::app_role;
  
  IF admin_count = 0 THEN
    NULL;
  ELSIF NOT has_role(requesting_user_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Admin privileges required');
  END IF;
  
  IF requesting_user_id = _target_user_id AND admin_count > 0 AND has_role(requesting_user_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot modify own admin status');
  END IF;
  
  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = _target_user_id) INTO target_user_exists;
  IF NOT target_user_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Target user not found');
  END IF;
  
  SELECT has_role(_target_user_id, 'admin'::app_role) INTO target_has_admin;
  IF target_has_admin THEN
    RETURN jsonb_build_object('success', false, 'message', 'User already has admin role');
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (_target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO role_audit_log (user_id, role, action, granted_by)
  VALUES (_target_user_id, 'admin'::app_role, 'GRANTED', requesting_user_id);
  
  RETURN jsonb_build_object('success', true, 'message', 'User promoted to admin successfully');
END;
$$;

-- Cleanup duplicate roles
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM user_roles 
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, role) id 
    FROM user_roles 
    ORDER BY user_id, role, created_at ASC
  );
END;
$$;
