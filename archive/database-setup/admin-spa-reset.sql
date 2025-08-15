-- Admin Script: Reset tất cả điểm SPA về 0
-- Chạy script này trên Supabase SQL Editor với quyền admin

-- Step 1: Reset tất cả điểm SPA của users về 0
UPDATE player_rankings SET spa_points = 0;

-- Step 2: Xóa tất cả progress milestone cũ
DELETE FROM user_milestone_progress;

-- Step 3: Xóa tất cả bonus claims cũ  
DELETE FROM user_bonus_claims;

-- Step 4: Xóa tất cả transaction log cũ
DELETE FROM spa_transaction_log;

-- Step 5: Log admin action
INSERT INTO spa_transaction_log (
	user_id, 
	transaction_type, 
	points_change, 
	previous_balance, 
	new_balance, 
	description
)
SELECT 
	user_id,
	'admin_reset',
	-spa_points as points_change,
	spa_points as previous_balance,
	0 as new_balance,
	'Admin reset - SPA system restart'
FROM player_rankings 
WHERE spa_points > 0;

-- Verify reset
SELECT 
	COUNT(*) as total_users,
	SUM(spa_points) as total_spa_points,
	MAX(spa_points) as max_spa_points,
	MIN(spa_points) as min_spa_points
FROM player_rankings;

-- Expected result: all SPA points should be 0
