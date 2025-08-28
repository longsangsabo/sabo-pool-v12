-- ================================================================================
-- MILESTONE DATA SEEDING SCRIPT
-- ================================================================================
-- This script adds default milestone definitions to the system
-- Run this AFTER milestone-system-fix.sql
-- ================================================================================

-- Step 1: Enable necessary extensions
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🔧 Setting up extensions...';
END $$;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Clear existing milestone data (optional - remove if you want to keep existing)
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🧹 Cleaning existing milestone data...';
END $$;

-- Uncomment these lines if you want to start fresh:
-- DELETE FROM player_milestones;
-- DELETE FROM milestones;

-- Step 3: Insert milestone definitions
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '📊 Inserting milestone definitions...';
END $$;

INSERT INTO milestones (
  id, 
  name, 
  description, 
  category, 
  milestone_type, 
  requirement_value, 
  spa_reward, 
  badge_icon, 
  is_active, 
  created_at, 
  updated_at
) VALUES

-- MATCH WINS MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000001', 'First Victory', 'Win your first match', 'progress', 'match_wins', 1, 10, '🏆', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'Rising Champion', 'Win 5 matches', 'progress', 'match_wins', 5, 25, '🥇', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'Tournament Victor', 'Win 10 matches', 'progress', 'match_wins', 10, 50, '👑', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', 'Pool Master', 'Win 25 matches', 'progress', 'match_wins', 25, 100, '🎱', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', 'Legendary Player', 'Win 50 matches', 'progress', 'match_wins', 50, 200, '⭐', true, NOW(), NOW()),

-- TOURNAMENT PARTICIPATION MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000006', 'Tournament Debut', 'Participate in your first tournament', 'progress', 'tournament_participation', 1, 15, '🎪', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000007', 'Tournament Regular', 'Participate in 5 tournaments', 'progress', 'tournament_participation', 5, 40, '🎭', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000008', 'Tournament Veteran', 'Participate in 10 tournaments', 'progress', 'tournament_participation', 10, 75, '🎲', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000009', 'Tournament Enthusiast', 'Participate in 25 tournaments', 'progress', 'tournament_participation', 25, 150, '🎯', true, NOW(), NOW()),

-- TOURNAMENT WINS MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000010', 'First Champion', 'Win your first tournament', 'achievement', 'tournament_wins', 1, 50, '🏅', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000011', 'Double Champion', 'Win 2 tournaments', 'achievement', 'tournament_wins', 2, 100, '🏆', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000012', 'Triple Crown', 'Win 3 tournaments', 'achievement', 'tournament_wins', 3, 150, '👑', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000013', 'Grand Champion', 'Win 5 tournaments', 'achievement', 'tournament_wins', 5, 250, '💎', true, NOW(), NOW()),

-- LOGIN STREAK MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000014', 'Dedicated Player', 'Login for 3 consecutive days', 'repeatable', 'login_streak', 3, 15, '📅', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000015', 'Weekly Warrior', 'Login for 7 consecutive days', 'repeatable', 'login_streak', 7, 35, '🗓️', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000016', 'Monthly Master', 'Login for 30 consecutive days', 'repeatable', 'login_streak', 30, 100, '📆', true, NOW(), NOW()),

-- SPA POINTS MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000017', 'Point Collector', 'Earn 100 SPA points', 'progress', 'spa_points', 100, 25, '💰', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000018', 'Point Enthusiast', 'Earn 500 SPA points', 'progress', 'spa_points', 500, 50, '💎', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000019', 'Point Master', 'Earn 1000 SPA points', 'progress', 'spa_points', 1000, 100, '👑', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000020', 'Point Legend', 'Earn 5000 SPA points', 'progress', 'spa_points', 5000, 250, '⭐', true, NOW(), NOW()),

-- SOCIAL CHALLENGE MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000021', 'First Challenge', 'Send your first challenge', 'social', 'challenges_sent', 1, 10, '⚔️', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000022', 'Challenge Master', 'Send 10 challenges', 'social', 'challenges_sent', 10, 50, '🎯', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000023', 'Challenge Expert', 'Send 25 challenges', 'social', 'challenges_sent', 25, 100, '🏹', true, NOW(), NOW()),

-- META ACHIEVEMENT MILESTONES
-- ================================================================================
('00000000-0000-0000-0000-000000000024', 'Achievement Hunter', 'Unlock 5 milestones', 'achievement', 'milestones_unlocked', 5, 25, '🎖️', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000025', 'Achievement Master', 'Unlock 10 milestones', 'achievement', 'milestones_unlocked', 10, 75, '🏆', true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000026', 'Achievement Legend', 'Unlock 20 milestones', 'achievement', 'milestones_unlocked', 20, 150, '👑', true, NOW(), NOW())

-- Handle conflicts by updating existing records
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  milestone_type = EXCLUDED.milestone_type,
  requirement_value = EXCLUDED.requirement_value,
  spa_reward = EXCLUDED.spa_reward,
  badge_icon = EXCLUDED.badge_icon,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Step 4: Verify milestone data
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Verifying milestone data...';
END $$;

SELECT 
  category,
  COUNT(*) as milestone_count,
  SUM(spa_reward) as total_spa_rewards
FROM milestones 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;

-- Step 5: Show summary
-- ================================================================================
DO $$
DECLARE
  total_milestones INTEGER;
  total_spa_rewards INTEGER;
BEGIN
    SELECT COUNT(*), SUM(spa_reward) INTO total_milestones, total_spa_rewards
    FROM milestones WHERE is_active = true;
    
    RAISE NOTICE '📊 MILESTONE SEEDING COMPLETED';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Total Milestones: %', total_milestones;
    RAISE NOTICE 'Total SPA Rewards Available: %', total_spa_rewards;
    RAISE NOTICE '=====================================';
END $$;

-- Add helpful comment
COMMENT ON TABLE milestones IS 'Milestone system seeded with 26 default achievements across 4 categories';
