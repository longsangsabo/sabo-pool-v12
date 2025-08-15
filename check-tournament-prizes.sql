-- Check tournament_prizes table structure and data
SELECT 
    t.name as tournament_name,
    tp.*
FROM tournament_prizes tp
JOIN tournaments t ON t.id = tp.tournament_id
ORDER BY tp.tournament_id, tp.prize_position;

-- Count tournaments vs prizes
SELECT 
    'tournaments' as table_name,
    COUNT(*) as count
FROM tournaments
UNION ALL
SELECT 
    'tournament_prizes' as table_name,
    COUNT(*) as count
FROM tournament_prizes;
