ALTER TABLE public.property_events
  ADD COLUMN IF NOT EXISTS ticket_url text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS end_date date;