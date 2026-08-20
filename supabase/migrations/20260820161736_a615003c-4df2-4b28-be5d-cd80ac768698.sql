CREATE TABLE public.mix55_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  rounds_count integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mix55_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mix55_settings TO authenticated;
GRANT ALL ON public.mix55_settings TO service_role;

ALTER TABLE public.mix55_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mix55 settings" ON public.mix55_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage mix55 settings" ON public.mix55_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_mix55_settings_updated_at BEFORE UPDATE ON public.mix55_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TABLE IF EXISTS public.mix55_rounds;