-- Fix current_participants count to use confirmed registrations instead of paid only
-- This ensures the UI displays correct participant counts

-- Update all tournaments to count confirmed registrations (both confirmed and paid status)
UPDATE tournaments 
SET current_participants = (
  SELECT COUNT(*) 
  FROM tournament_registrations 
  WHERE tournament_id = tournaments.id 
  AND registration_status IN ('confirmed', 'paid')
);

-- Create or replace trigger to maintain accurate count
CREATE OR REPLACE FUNCTION update_tournament_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add to count if registration is confirmed or paid
    IF NEW.registration_status IN ('confirmed', 'paid') THEN
      UPDATE tournaments 
      SET current_participants = current_participants + 1
      WHERE id = NEW.tournament_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.registration_status NOT IN ('confirmed', 'paid') AND NEW.registration_status IN ('confirmed', 'paid') THEN
      -- Status changed to confirmed/paid
      UPDATE tournaments 
      SET current_participants = current_participants + 1
      WHERE id = NEW.tournament_id;
    ELSIF OLD.registration_status IN ('confirmed', 'paid') AND NEW.registration_status NOT IN ('confirmed', 'paid') THEN
      -- Status changed from confirmed/paid
      UPDATE tournaments 
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = NEW.tournament_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove from count if registration was confirmed or paid
    IF OLD.registration_status IN ('confirmed', 'paid') THEN
      UPDATE tournaments 
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = OLD.tournament_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS tournament_participants_count_trigger ON tournament_registrations;
CREATE TRIGGER tournament_participants_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION update_tournament_participants_count();
