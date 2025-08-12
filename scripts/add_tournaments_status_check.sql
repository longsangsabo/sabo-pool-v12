-- Add tournaments_status_check constraint to tournaments table
ALTER TABLE public.tournaments DROP CONSTRAINT IF EXISTS tournaments_status_check;
ALTER TABLE public.tournaments ADD CONSTRAINT tournaments_status_check 
CHECK (status = ANY (ARRAY[
  'upcoming'::text,
  'registration_open'::text, 
  'registration_closed'::text, 
  'ongoing'::text, 
  'completed'::text, 
  'cancelled'::text
]));

-- Optional: add a comment for clarity
COMMENT ON CONSTRAINT tournaments_status_check ON public.tournaments IS 
  'Ensures status is one of the allowed tournament states.';
