-- =============================================
-- TEST TOURNAMENT INSERT WITH FULL PRIZE_DISTRIBUTION
-- =============================================
-- Run this after fix-tournaments-table.sql to test

-- Test full tournament creation with all columns
INSERT INTO tournaments (
    name,
    description,
    tournament_type,
    status,
    venue_name,
    is_public,
    requires_approval,
    tier_level,
    allow_all_ranks,
    eligible_ranks,
    organizer_id,
    banner_image,
    registration_fee,
    tournament_format_details,
    special_rules,
    contact_person,
    contact_phone,
    live_stream_url,
    sponsor_info,
    spa_points_config,
    elo_points_config,
    prize_distribution,
    max_participants,
    tournament_start,
    tournament_end,
    registration_start,
    registration_end,
    prize_pool,
    entry_fee
) VALUES (
    'TEST Tournament - Full Data',
    'Test tournament with complete prize distribution',
    'double_elimination',
    'upcoming',
    'Test Venue',
    true,
    false,
    1,
    true,
    '["K", "K+", "I"]'::jsonb,
    null,
    'https://example.com/banner.jpg',
    50000,
    'Standard double elimination format',
    'No special rules',
    'Test Organizer',
    '0123456789',
    'https://youtube.com/live',
    '{"main_sponsor": "Test Sponsor"}'::jsonb,
    '{"1": 1500, "2": 1100, "3": 900}'::jsonb,
    '{"1": 100, "2": 50, "3": 25}'::jsonb,
    '{
        "total_positions": 16,
        "total_prize_pool": 1000000,
        "positions": [
            {"position": 1, "name": "Vô địch", "cash_amount": 400000, "elo_points": 100, "spa_points": 1500},
            {"position": 2, "name": "Á quân", "cash_amount": 240000, "elo_points": 50, "spa_points": 1100},
            {"position": 3, "name": "Hạng 3", "cash_amount": 160000, "elo_points": 25, "spa_points": 900},
            {"position": 4, "name": "Hạng 4", "cash_amount": 80000, "elo_points": 12, "spa_points": 650}
        ],
        "prize_summary": {
            "position_1": 400000,
            "position_2": 240000,
            "position_3": 160000,
            "position_4": 80000
        }
    }'::jsonb,
    16,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    NOW(),
    NOW() + INTERVAL '6 days',
    1000000,
    50000
);

-- Verify the inserted data
SELECT 
    id,
    name,
    venue_name,
    is_public,
    requires_approval,
    tier_level,
    allow_all_ranks,
    jsonb_pretty(eligible_ranks) as eligible_ranks,
    registration_fee,
    jsonb_pretty(prize_distribution) as prize_distribution,
    prize_pool
FROM tournaments 
WHERE name = 'TEST Tournament - Full Data';

-- Clean up test data
DELETE FROM tournaments WHERE name = 'TEST Tournament - Full Data';

SELECT 'Tournament INSERT test completed successfully!' as result;
