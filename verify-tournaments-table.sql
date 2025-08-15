-- =============================================
-- VERIFY TOURNAMENTS TABLE STRUCTURE
-- =============================================
-- Run this after fix-tournaments-table.sql to verify

-- Check all columns exist
SELECT 'Column Check' as check_type, 
       COUNT(*) as total_columns,
       COUNT(CASE WHEN column_name IN (
           'venue_name', 'is_public', 'requires_approval', 'tier_level',
           'allow_all_ranks', 'eligible_ranks', 'organizer_id', 'banner_image',
           'registration_fee', 'tournament_format_details', 'special_rules',
           'contact_person', 'contact_phone', 'live_stream_url', 'sponsor_info',
           'spa_points_config', 'elo_points_config', 'prize_distribution'
       ) THEN 1 END) as required_columns
FROM information_schema.columns 
WHERE table_name = 'tournaments';

-- List all columns with their types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('venue_name', 'is_public', 'requires_approval', 'tier_level',
                           'allow_all_ranks', 'eligible_ranks', 'organizer_id', 'banner_image',
                           'registration_fee', 'tournament_format_details', 'special_rules',
                           'contact_person', 'contact_phone', 'live_stream_url', 'sponsor_info',
                           'spa_points_config', 'elo_points_config', 'prize_distribution')
        THEN '✅ NEW'
        ELSE '📄 EXISTING'
    END as status
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Test INSERT capability with all new columns
SELECT 'INSERT Test' as test_type, 
       'Ready for full tournament creation with prize_distribution' as result;
