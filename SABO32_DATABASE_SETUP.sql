-- =============================================
-- CREATE SABO-32 TOURNAMENT DATA STRUCTURE
-- Setup database for 32-player double elimination
-- =============================================

-- Add group_id column to tournament_matches table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournament_matches' 
        AND column_name = 'group_id'
    ) THEN
        ALTER TABLE tournament_matches 
        ADD COLUMN group_id VARCHAR(1) NULL;
        
        -- Add index for group queries
        CREATE INDEX IF NOT EXISTS idx_tournament_matches_group_id 
        ON tournament_matches (tournament_id, group_id);
        
        -- Add index for cross-bracket queries  
        CREATE INDEX IF NOT EXISTS idx_tournament_matches_bracket_group
        ON tournament_matches (tournament_id, bracket_type, group_id);
        
        RAISE NOTICE 'Added group_id column and indexes for SABO-32 support';
    ELSE
        RAISE NOTICE 'group_id column already exists';
    END IF;
END $$;

-- Create function to generate SABO-32 tournament
CREATE OR REPLACE FUNCTION create_sabo32_tournament(
    p_tournament_id UUID,
    p_club_id UUID,
    p_players TEXT[] -- Array of 32 player IDs
) RETURNS TABLE (
    match_id UUID,
    group_id VARCHAR(1),
    bracket_type VARCHAR(20),
    round_number INTEGER,
    match_number INTEGER,
    sabo_match_id VARCHAR(20),
    player1_id UUID,
    player2_id UUID
) AS $$
DECLARE
    group_a_players TEXT[];
    group_b_players TEXT[];
    match_counter INTEGER := 1;
    current_match_id UUID;
BEGIN
    -- Validate input
    IF array_length(p_players, 1) != 32 THEN
        RAISE EXCEPTION 'Exactly 32 players required for SABO-32 tournament';
    END IF;
    
    -- Random shuffle and split into groups
    SELECT ARRAY(SELECT unnest(p_players) ORDER BY random()) INTO p_players;
    group_a_players := p_players[1:16];
    group_b_players := p_players[17:32];
    
    RAISE NOTICE 'Creating SABO-32 tournament: Group A (%) vs Group B (%)', 
        array_length(group_a_players, 1), array_length(group_b_players, 1);
    
    -- Generate Group A matches (25 matches)
    FOR i IN 1..25 LOOP
        current_match_id := gen_random_uuid();
        
        -- Determine bracket type and round based on match number
        -- This is a simplified version - full implementation would be more complex
        IF i <= 14 THEN
            -- Winners bracket
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_winners',
                CASE 
                    WHEN i <= 8 THEN 1
                    WHEN i <= 12 THEN 2  
                    ELSE 3
                END,
                CASE
                    WHEN i <= 8 THEN i
                    WHEN i <= 12 THEN i - 8
                    ELSE i - 12
                END,
                'A-W' || i,
                'pending'
            );
        ELSIF i <= 21 THEN
            -- Losers branch A
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_losers_a',
                101 + ((i - 15) / 4),
                ((i - 15) % 4) + 1,
                'A-LA' || (i - 14),
                'pending'
            );
        ELSIF i <= 24 THEN
            -- Losers branch B
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_losers_b',
                201 + (i - 22),
                i - 21,
                'A-LB' || (i - 21),
                'pending'
            );
        ELSE
            -- Group final
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_final',
                250, 1, 'A-FINAL', 'pending'
            );
        END IF;
        
        -- Return match info
        RETURN QUERY SELECT 
            current_match_id, 'A'::VARCHAR(1), 'group_a_winners'::VARCHAR(20),
            1::INTEGER, i::INTEGER, ('A-M' || i)::VARCHAR(20),
            NULL::UUID, NULL::UUID;
    END LOOP;
    
    -- Generate Group B matches (similar to Group A)
    FOR i IN 1..25 LOOP
        current_match_id := gen_random_uuid();
        
        IF i <= 14 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_winners',
                CASE 
                    WHEN i <= 8 THEN 1
                    WHEN i <= 12 THEN 2  
                    ELSE 3
                END,
                CASE
                    WHEN i <= 8 THEN i
                    WHEN i <= 12 THEN i - 8
                    ELSE i - 12
                END,
                'B-W' || i,
                'pending'
            );
        ELSIF i <= 21 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_losers_a',
                101 + ((i - 15) / 4),
                ((i - 15) % 4) + 1,
                'B-LA' || (i - 14),
                'pending'
            );
        ELSIF i <= 24 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_losers_b',
                201 + (i - 22),
                i - 21,
                'B-LB' || (i - 21),
                'pending'
            );
        ELSE
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_final',
                250, 1, 'B-FINAL', 'pending'
            );
        END IF;
        
        RETURN QUERY SELECT 
            current_match_id, 'B'::VARCHAR(1), 'group_b_winners'::VARCHAR(20),
            1::INTEGER, i::INTEGER, ('B-M' || i)::VARCHAR(20),
            NULL::UUID, NULL::UUID;
    END LOOP;
    
    -- Generate Cross-Bracket matches (3 matches)
    
    -- Semifinal 1: Winner A vs Runner-up B
    current_match_id := gen_random_uuid();
    INSERT INTO tournament_matches (
        id, tournament_id, club_id, group_id, bracket_type,
        round_number, match_number, sabo_match_id, status
    ) VALUES (
        current_match_id, p_tournament_id, p_club_id, NULL, 'cross_semifinals',
        350, 1, 'SF1', 'pending'
    );
    
    RETURN QUERY SELECT 
        current_match_id, NULL::VARCHAR(1), 'cross_semifinals'::VARCHAR(20),
        350::INTEGER, 1::INTEGER, 'SF1'::VARCHAR(20),
        NULL::UUID, NULL::UUID;
    
    -- Semifinal 2: Winner B vs Runner-up A
    current_match_id := gen_random_uuid();
    INSERT INTO tournament_matches (
        id, tournament_id, club_id, group_id, bracket_type,
        round_number, match_number, sabo_match_id, status
    ) VALUES (
        current_match_id, p_tournament_id, p_club_id, NULL, 'cross_semifinals',
        350, 2, 'SF2', 'pending'
    );
    
    RETURN QUERY SELECT 
        current_match_id, NULL::VARCHAR(1), 'cross_semifinals'::VARCHAR(20),
        350::INTEGER, 2::INTEGER, 'SF2'::VARCHAR(20),
        NULL::UUID, NULL::UUID;
    
    -- Final
    current_match_id := gen_random_uuid();
    INSERT INTO tournament_matches (
        id, tournament_id, club_id, group_id, bracket_type,
        round_number, match_number, sabo_match_id, status
    ) VALUES (
        current_match_id, p_tournament_id, p_club_id, NULL, 'cross_final',
        400, 1, 'FINAL', 'pending'
    );
    
    RETURN QUERY SELECT 
        current_match_id, NULL::VARCHAR(1), 'cross_final'::VARCHAR(20),
        400::INTEGER, 1::INTEGER, 'FINAL'::VARCHAR(20),
        NULL::UUID, NULL::UUID;
    
    RAISE NOTICE 'SABO-32 tournament created successfully: 53 matches total';
    
END;
$$ LANGUAGE plpgsql;

-- Create indexes for optimal SABO-32 queries
CREATE INDEX IF NOT EXISTS idx_sabo32_group_bracket 
ON tournament_matches (tournament_id, group_id, bracket_type, round_number);

CREATE INDEX IF NOT EXISTS idx_sabo32_cross_bracket
ON tournament_matches (tournament_id, bracket_type) 
WHERE group_id IS NULL;

-- Verify the setup
SELECT 'SABO-32 database structure ready' as status;
