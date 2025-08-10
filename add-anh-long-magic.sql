-- Add ANH LONG MAGIC to legacy SPA for testing
-- Date: 2025-08-10

-- Temporarily disable RLS to insert test data
ALTER TABLE legacy_spa_points DISABLE ROW LEVEL SECURITY;

-- Insert ANH LONG MAGIC for testing
INSERT INTO legacy_spa_points (
	full_name,
	nick_name,
	spa_points,
	facebook_url,
	position_rank,
	claimed,
	claimed_by,
	claimed_at,
	verification_method,
	admin_notes,
	created_at,
	updated_at
) VALUES (
	'ANH LONG MAGIC',
	'ANH LONG MAGIC',
	1000,
	'https://www.facebook.com/longsang791',
	46, -- Position 46 (after original 45 players)
	false,
	null,
	null,
	'facebook',
	'Test account for admin - added manually',
	NOW(),
	NOW()
) ON CONFLICT (full_name) DO UPDATE SET
	spa_points = EXCLUDED.spa_points,
	facebook_url = EXCLUDED.facebook_url,
	admin_notes = EXCLUDED.admin_notes,
	updated_at = NOW();

-- Re-enable RLS
ALTER TABLE legacy_spa_points ENABLE ROW LEVEL SECURITY;

-- Verify the insert
SELECT 
	full_name, 
	spa_points, 
	position_rank, 
	claimed,
	facebook_url
FROM legacy_spa_points 
WHERE full_name = 'ANH LONG MAGIC';

-- Show total count
SELECT COUNT(*) as total_legacy_players FROM legacy_spa_points;
