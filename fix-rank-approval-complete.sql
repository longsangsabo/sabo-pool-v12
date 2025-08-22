-- Fix rank approval system: Create trigger and manually update existing approved requests

-- 1. Create or replace trigger function for rank approval
CREATE OR REPLACE FUNCTION public.handle_rank_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rank_text TEXT;
  v_spa_reward INTEGER;
  v_club_name TEXT;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Convert rank to text format
    v_rank_text := NEW.requested_rank;
    
    -- Calculate SPA reward based on rank
    v_spa_reward := CASE NEW.requested_rank
      WHEN 'E+' THEN 300
      WHEN 'E' THEN 300
      WHEN 'F+' THEN 250
      WHEN 'F' THEN 250
      WHEN 'G+' THEN 200
      WHEN 'G' THEN 200
      WHEN 'H+' THEN 150
      WHEN 'H' THEN 150
      WHEN 'I+' THEN 120
      WHEN 'I' THEN 120
      WHEN 'K+' THEN 100
      WHEN 'K' THEN 100
      ELSE 100
    END;
    
    -- Get club name for notifications
    SELECT club_name INTO v_club_name
    FROM club_profiles 
    WHERE id = NEW.club_id;
    
    BEGIN
      RAISE NOTICE 'Processing rank approval for user % with rank % and reward %', 
        NEW.user_id, v_rank_text, v_spa_reward;
      
      -- 1. Update profile verified rank
      UPDATE profiles 
      SET 
        verified_rank = v_rank_text,
        rank_verified_at = NOW(),
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
      
      RAISE NOTICE 'Updated profile with verified rank: %', v_rank_text;
      
      -- 2. Update/create player rankings
      INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
      VALUES (NEW.user_id, v_rank_text, v_spa_reward, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        verified_rank = EXCLUDED.verified_rank,
        spa_points = COALESCE(player_rankings.spa_points, 0) + v_spa_reward,
        updated_at = NOW();
      
      RAISE NOTICE 'Updated player rankings with % SPA points', v_spa_reward;
      
      -- 3. Update/create wallet
      INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
      VALUES (NEW.user_id, v_spa_reward, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        points_balance = COALESCE(wallets.points_balance, 0) + v_spa_reward,
        updated_at = NOW();
      
      RAISE NOTICE 'Updated wallet with % points', v_spa_reward;
      
      -- 4. Create SPA transaction record
      INSERT INTO spa_transactions (
        user_id, 
        points, 
        transaction_type, 
        description, 
        reference_id, 
        reference_type,
        created_at
      ) VALUES (
        NEW.user_id,
        v_spa_reward,
        'rank_approval',
        format('Rank %s approved by %s', v_rank_text, COALESCE(v_club_name, 'Club')),
        NEW.id,
        'rank_request',
        NOW()
      );
      
      RAISE NOTICE 'Created SPA transaction record';
      
      -- 5. Add user to club if not already a member
      INSERT INTO club_members (club_id, user_id, status, join_date, membership_type, role, created_at)
      VALUES (NEW.club_id, NEW.user_id, 'active', NOW(), 'verified_member', 'member', NOW())
      ON CONFLICT (club_id, user_id) DO UPDATE SET
        status = 'active',
        membership_type = 'verified_member',
        updated_at = NOW();
      
      RAISE NOTICE 'Added user to club as verified member';
      
      -- 6. Create notification
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority,
        created_at
      ) VALUES (
        NEW.user_id,
        'rank_approval',
        'Hạng đã được duyệt!',
        format('Chúc mừng! Hạng %s của bạn đã được duyệt bởi %s. Bạn nhận được %s SPA points.', 
               v_rank_text, COALESCE(v_club_name, 'Club'), v_spa_reward),
        'high',
        NOW()
      );
      
      RAISE NOTICE 'Created notification for user';
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error in rank approval processing: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Create trigger on rank_requests table
DROP TRIGGER IF EXISTS trigger_rank_approval ON public.rank_requests;

CREATE TRIGGER trigger_rank_approval
  AFTER UPDATE ON public.rank_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_rank_approval();

-- 3. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_rank_approval() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_rank_approval() TO service_role;

-- 4. Manually fix existing approved requests that haven't updated profiles
DO $$
DECLARE
  req RECORD;
  v_rank_text TEXT;
  v_spa_reward INTEGER;
  v_club_name TEXT;
  fixed_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting manual fix for existing approved requests...';
  
  -- Process all approved requests where profile is not updated
  FOR req IN 
    SELECT rr.*, p.verified_rank, p.display_name
    FROM rank_requests rr
    JOIN profiles p ON p.user_id = rr.user_id
    WHERE rr.status = 'approved' 
    AND (p.verified_rank IS NULL OR p.verified_rank != rr.requested_rank)
    ORDER BY rr.approved_at DESC
  LOOP
    v_rank_text := req.requested_rank;
    
    -- Calculate SPA reward
    v_spa_reward := CASE req.requested_rank
      WHEN 'E+' THEN 300  WHEN 'E' THEN 300
      WHEN 'F+' THEN 250  WHEN 'F' THEN 250
      WHEN 'G+' THEN 200  WHEN 'G' THEN 200
      WHEN 'H+' THEN 150  WHEN 'H' THEN 150
      WHEN 'I+' THEN 120  WHEN 'I' THEN 120
      WHEN 'K+' THEN 100  WHEN 'K' THEN 100
      ELSE 100
    END;
    
    -- Get club name
    SELECT club_name INTO v_club_name
    FROM club_profiles 
    WHERE id = req.club_id;
    
    BEGIN
      RAISE NOTICE 'Fixing request for % (%) - rank % -> %', 
        req.display_name, req.user_id, req.verified_rank, v_rank_text;
      
      -- Update profile
      UPDATE profiles 
      SET 
        verified_rank = v_rank_text,
        rank_verified_at = COALESCE(req.approved_at, NOW()),
        updated_at = NOW()
      WHERE user_id = req.user_id;
      
      -- Update player rankings
      INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
      VALUES (req.user_id, v_rank_text, v_spa_reward, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        verified_rank = EXCLUDED.verified_rank,
        spa_points = COALESCE(player_rankings.spa_points, 0) + v_spa_reward,
        updated_at = NOW();
      
      -- Update wallet
      INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
      VALUES (req.user_id, v_spa_reward, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        points_balance = COALESCE(wallets.points_balance, 0) + v_spa_reward,
        updated_at = NOW();
      
      -- Create transaction if doesn't exist
      INSERT INTO spa_transactions (
        user_id, points, transaction_type, description, 
        reference_id, reference_type, created_at
      ) VALUES (
        req.user_id, v_spa_reward, 'rank_approval',
        format('Rank %s approved by %s (retroactive)', v_rank_text, COALESCE(v_club_name, 'Club')),
        req.id, 'rank_request', COALESCE(req.approved_at, NOW())
      )
      ON CONFLICT (user_id, reference_id, reference_type) DO NOTHING;
      
      -- Add to club
      INSERT INTO club_members (club_id, user_id, status, join_date, membership_type, role, created_at)
      VALUES (req.club_id, req.user_id, 'active', NOW(), 'verified_member', 'member', NOW())
      ON CONFLICT (club_id, user_id) DO UPDATE SET
        status = 'active',
        membership_type = 'verified_member',
        updated_at = NOW();
      
      fixed_count := fixed_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error fixing request %: %', req.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Manual fix completed. Fixed % requests.', fixed_count;
END $$;

-- 5. Verification query
SELECT 
  'Fix verification' as status,
  count(*) as total_approved_requests,
  count(CASE WHEN p.verified_rank = rr.requested_rank THEN 1 END) as properly_updated,
  count(CASE WHEN p.verified_rank != rr.requested_rank OR p.verified_rank IS NULL THEN 1 END) as still_broken
FROM rank_requests rr
JOIN profiles p ON p.user_id = rr.user_id
WHERE rr.status = 'approved';

-- Success message
SELECT 'Rank approval system fix completed successfully!' as message;
