-- ============================================================
-- LOVABLE CLOUD MIGRATION - TRIGGERS
-- ============================================================

-- Auth trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-promote admin email trigger
CREATE TRIGGER on_profile_created_check_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_promote_admin_email();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opening_hours_updated_at
  BEFORE UPDATE ON public.opening_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_items_updated_at
  BEFORE UPDATE ON public.price_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_livestreams_updated_at
  BEFORE UPDATE ON public.livestreams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_markarydsligan_series_updated_at
  BEFORE UPDATE ON public.markarydsligan_series
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Event registration triggers
CREATE TRIGGER on_event_registration_insert
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_event_participants();

CREATE TRIGGER on_event_registration_delete
  AFTER DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_event_participants();

CREATE TRIGGER on_event_registration_update
  AFTER UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_participants_on_change();

-- Event interest rate limiting
CREATE TRIGGER enforce_interest_rate_limit
  BEFORE INSERT ON public.event_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_event_interest_rate_limit();

-- Featured window validation
CREATE TRIGGER validate_event_featured_window
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_featured_window();
