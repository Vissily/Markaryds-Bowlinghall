CREATE TABLE public.mix55_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  player1 text NOT NULL DEFAULT '',
  player2 text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mix55_teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mix55_teams TO authenticated;
GRANT ALL ON public.mix55_teams TO service_role;
ALTER TABLE public.mix55_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mix55 teams" ON public.mix55_teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage mix55 teams" ON public.mix55_teams FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_mix55_teams_updated_at BEFORE UPDATE ON public.mix55_teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mix55_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.mix55_teams(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  pins integer NOT NULL DEFAULT 0,
  series integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, round_number)
);
GRANT SELECT ON public.mix55_scores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mix55_scores TO authenticated;
GRANT ALL ON public.mix55_scores TO service_role;
ALTER TABLE public.mix55_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mix55 scores" ON public.mix55_scores FOR SELECT USING (true);
CREATE POLICY "Admins can manage mix55 scores" ON public.mix55_scores FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_mix55_scores_updated_at BEFORE UPDATE ON public.mix55_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();