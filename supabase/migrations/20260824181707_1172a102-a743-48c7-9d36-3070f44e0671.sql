ALTER TABLE public.mix55_settings
  ADD COLUMN IF NOT EXISTS pause_after_round integer,
  ADD COLUMN IF NOT EXISTS resume_date date;