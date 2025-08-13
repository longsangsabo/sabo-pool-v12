-- Create automatic sync trigger for SPA points
-- This will keep profiles.spa_points in sync with player_rankings.spa_points

-- Function to sync SPA points
CREATE OR REPLACE FUNCTION sync_spa_points_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding profile with new SPA points
  UPDATE profiles 
  SET spa_points = NEW.spa_points,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- If no profile exists, this is fine (some rankings might not have profiles yet)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on player_rankings
DROP TRIGGER IF EXISTS trigger_sync_spa_to_profile ON player_rankings;
CREATE TRIGGER trigger_sync_spa_to_profile
  AFTER INSERT OR UPDATE OF spa_points
  ON player_rankings
  FOR EACH ROW
  EXECUTE FUNCTION sync_spa_points_to_profile();

-- Also create reverse sync function (if profile spa_points is updated)
CREATE OR REPLACE FUNCTION sync_spa_points_to_ranking()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding player_ranking with new SPA points
  INSERT INTO player_rankings (user_id, spa_points, elo_points, created_at, updated_at)
  VALUES (NEW.user_id, NEW.spa_points, 1000, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    spa_points = NEW.spa_points,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles
DROP TRIGGER IF EXISTS trigger_sync_spa_to_ranking ON profiles;
CREATE TRIGGER trigger_sync_spa_to_ranking
  AFTER UPDATE OF spa_points
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_spa_points_to_ranking();

-- Grant permissions
GRANT EXECUTE ON FUNCTION sync_spa_points_to_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_spa_points_to_ranking() TO authenticated;
