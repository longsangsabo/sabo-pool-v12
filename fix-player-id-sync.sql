-- Fix player_id and user_id synchronization issues
-- This ensures both columns have proper values and eliminates null constraint violations

-- Step 1: Update existing records where player_id is NULL but user_id exists
UPDATE public.player_rankings 
SET player_id = user_id 
WHERE player_id IS NULL AND user_id IS NOT NULL;

-- Step 2: Update existing records where user_id is NULL but player_id exists  
UPDATE public.player_rankings 
SET user_id = player_id 
WHERE user_id IS NULL AND player_id IS NOT NULL;

-- Step 3: Add constraints to ensure both columns are always in sync
-- Make player_id NOT NULL (if it isn't already)
ALTER TABLE public.player_rankings 
ALTER COLUMN player_id SET NOT NULL;

-- Step 4: Create function to automatically sync player_id with user_id on insert/update
CREATE OR REPLACE FUNCTION sync_player_user_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting/updating and user_id is provided but player_id is NULL
  IF NEW.user_id IS NOT NULL AND NEW.player_id IS NULL THEN
    NEW.player_id := NEW.user_id;
  END IF;
  
  -- If inserting/updating and player_id is provided but user_id is NULL
  IF NEW.player_id IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := NEW.player_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to automatically sync the IDs
DROP TRIGGER IF EXISTS trigger_sync_player_user_ids ON public.player_rankings;
CREATE TRIGGER trigger_sync_player_user_ids
  BEFORE INSERT OR UPDATE ON public.player_rankings
  FOR EACH ROW EXECUTE FUNCTION sync_player_user_ids();

-- Step 6: Create or update player ranking when user claims SPA points
CREATE OR REPLACE FUNCTION ensure_player_ranking_exists(p_user_id UUID, p_spa_points INTEGER DEFAULT 0)
RETURNS VOID AS $$
BEGIN
  -- Insert or update player ranking
  INSERT INTO public.player_rankings (
    user_id,
    player_id,
    spa_points,
    elo_points,
    current_rank,
    total_matches,
    wins,
    losses,
    win_streak,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_user_id, -- Sync both IDs
    p_spa_points,
    1000, -- Default ELO
    'Tân thủ',
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    spa_points = EXCLUDED.spa_points,
    player_id = p_user_id, -- Ensure sync
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION ensure_player_ranking_exists(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_player_user_ids() TO authenticated;

-- Add comment
COMMENT ON FUNCTION sync_player_user_ids() IS 'Automatically sync player_id and user_id to prevent null constraint violations';
COMMENT ON FUNCTION ensure_player_ranking_exists(UUID, INTEGER) IS 'Ensure player ranking record exists with synced IDs';
