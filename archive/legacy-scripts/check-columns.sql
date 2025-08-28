-- Check table structures to ensure all columns exist
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'player_rankings', 'wallets', 'spa_transactions', 'club_members', 'notifications')
ORDER BY table_name, ordinal_position;
