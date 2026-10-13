ALTER TABLE public.applications
  ADD COLUMN locality text NOT NULL DEFAULT '',
  ADD COLUMN availability text NOT NULL DEFAULT '',
  ADD COLUMN has_vehicle boolean NOT NULL DEFAULT false,
  ADD COLUMN hr_notes text NOT NULL DEFAULT '';