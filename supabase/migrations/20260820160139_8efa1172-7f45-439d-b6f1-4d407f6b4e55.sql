CREATE TABLE public.mix55_rounds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number integer NOT NULL UNIQUE,
  play_at timestamptz NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mix55_rounds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mix55_rounds TO authenticated;
GRANT ALL ON public.mix55_rounds TO service_role;
ALTER TABLE public.mix55_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mix55 rounds" ON public.mix55_rounds FOR SELECT USING (true);
CREATE POLICY "Admins can manage mix55 rounds" ON public.mix55_rounds FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_mix55_rounds_updated_at BEFORE UPDATE ON public.mix55_rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();