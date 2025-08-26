-- Add a boolean flag for big screen availability on events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS has_big_screen boolean NOT NULL DEFAULT false;

-- Optional: document the column purpose
COMMENT ON COLUMN public.events.has_big_screen IS 'Indicates if the event uses/stöder "storbildsskärm" (big screen).';