-- Fix: Tạo view public_spa_leaderboard đúng cách
-- Xóa view cũ nếu có
DROP VIEW IF EXISTS public_spa_leaderboard;

-- Tạo view mới hiển thị legacy players
CREATE OR REPLACE VIEW public_spa_leaderboard AS
SELECT 
    'legacy' as user_type,
    NULL::uuid as user_id,
    lsp.full_name,
    lsp.nick_name,
    lsp.spa_points,
    1000 as elo_points,
    NULL::text as verified_rank,
    NULL::text as avatar_url,
    lsp.facebook_url,
    FALSE as is_registered,
    NOT lsp.claimed as can_claim
FROM legacy_spa_points lsp

UNION ALL

SELECT 
    'registered' as user_type,
    pr.player_id as user_id,
    COALESCE(p.full_name, p.display_name) as full_name,
    p.display_name as nick_name,
    pr.spa_points,
    pr.elo_points,
    p.verified_rank,
    p.avatar_url,
    NULL as facebook_url,
    TRUE as is_registered,
    NULL as can_claim
FROM player_rankings pr
JOIN profiles p ON pr.player_id = p.user_id
WHERE pr.spa_points > 0

ORDER BY spa_points DESC;

-- Test view ngay
SELECT user_type, full_name, nick_name, spa_points, is_registered
FROM public_spa_leaderboard 
ORDER BY spa_points DESC 
LIMIT 10;
