-- Ensure unique series names so admin "sync" can upsert safely
ALTER TABLE public.markarydsligan_series
ADD CONSTRAINT markarydsligan_series_name_unique UNIQUE (name);

-- Optional: speed up ordering
CREATE INDEX IF NOT EXISTS idx_markarydsligan_series_sort_order
ON public.markarydsligan_series (sort_order);
