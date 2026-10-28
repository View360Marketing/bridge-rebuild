ALTER TABLE public.inventory_nights
  DROP CONSTRAINT IF EXISTS inventory_nights_owner_type_check;

ALTER TABLE public.inventory_nights
  ADD CONSTRAINT inventory_nights_owner_type_check
  CHECK (owner_type IN ('reservation','hold','group','owner','maintenance','external','airbnb'));