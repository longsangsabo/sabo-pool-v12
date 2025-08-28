// Setup SABO-32 Database Structure
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSABO32Database() {
  console.log('🎯 Setting up SABO-32 database structure...');
  
  try {
    // First, check if group_id column exists
    console.log('1. Checking for group_id column...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'tournament_matches')
      .eq('column_name', 'group_id');
    
    if (columnError) {
      console.error('❌ Error checking columns:', columnError);
      return;
    }
    
    if (!columns || columns.length === 0) {
      console.log('2. Adding group_id column...');
      
      // Add group_id column via raw SQL
      const { error: addColumnError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE tournament_matches 
          ADD COLUMN group_id VARCHAR(1) NULL;
          
          CREATE INDEX IF NOT EXISTS idx_tournament_matches_group_id 
          ON tournament_matches (tournament_id, group_id);
          
          CREATE INDEX IF NOT EXISTS idx_tournament_matches_bracket_group
          ON tournament_matches (tournament_id, bracket_type, group_id);
        `
      });
      
      if (addColumnError) {
        console.error('❌ Error adding group_id column:', addColumnError);
        // Try manual approach
        console.log('Trying alternative approach...');
        
        const { error: manualError } = await supabase
          .from('tournament_matches')
          .update({ group_id: null }) // This will fail if column doesn't exist
          .eq('id', 'non-existent-id');
          
        console.log('Manual test result:', manualError?.message || 'Column exists');
      } else {
        console.log('✅ group_id column added successfully');
      }
    } else {
      console.log('✅ group_id column already exists');
    }
    
    // Create the SABO-32 tournament function
    console.log('3. Creating create_sabo32_tournament function...');
    
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION create_sabo32_tournament(
    p_tournament_id UUID,
    p_club_id UUID,
    p_players TEXT[]
) RETURNS TABLE (
    match_id UUID,
    group_id VARCHAR(1),
    bracket_type VARCHAR(20),
    round_number INTEGER,
    match_number INTEGER,
    sabo_match_id VARCHAR(20)
) AS $$
DECLARE
    group_a_players TEXT[];
    group_b_players TEXT[];
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
    
    RAISE NOTICE 'Creating SABO-32 tournament with % total players', array_length(p_players, 1);
    
    -- Generate Group A matches (25 matches)
    FOR i IN 1..25 LOOP
        current_match_id := gen_random_uuid();
        
        IF i <= 8 THEN
            -- Round 1 Winners
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_winners',
                1, i, 'A-W1-' || i, 'pending'
            );
        ELSIF i <= 12 THEN
            -- Round 2 Winners
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_winners',
                2, i - 8, 'A-W2-' || (i - 8), 'pending'
            );
        ELSIF i <= 14 THEN
            -- Round 3 Winners
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_winners',
                3, i - 12, 'A-W3-' || (i - 12), 'pending'
            );
        ELSIF i <= 21 THEN
            -- Losers Branch A
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_losers_a',
                101 + ((i - 15) / 4), ((i - 15) % 4) + 1, 'A-LA-' || (i - 14), 'pending'
            );
        ELSIF i <= 24 THEN
            -- Losers Branch B
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'A', 'group_a_losers_b',
                201 + (i - 22), i - 21, 'A-LB-' || (i - 21), 'pending'
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
        
        RETURN QUERY SELECT 
            current_match_id, 'A'::VARCHAR(1), 'group_a_winners'::VARCHAR(20),
            1::INTEGER, i::INTEGER, ('A-M' || i)::VARCHAR(20);
    END LOOP;
    
    -- Generate Group B matches (25 matches)
    FOR i IN 1..25 LOOP
        current_match_id := gen_random_uuid();
        
        IF i <= 8 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_winners',
                1, i, 'B-W1-' || i, 'pending'
            );
        ELSIF i <= 12 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_winners',
                2, i - 8, 'B-W2-' || (i - 8), 'pending'
            );
        ELSIF i <= 14 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_winners',
                3, i - 12, 'B-W3-' || (i - 12), 'pending'
            );
        ELSIF i <= 21 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_losers_a',
                101 + ((i - 15) / 4), ((i - 15) % 4) + 1, 'B-LA-' || (i - 14), 'pending'
            );
        ELSIF i <= 24 THEN
            INSERT INTO tournament_matches (
                id, tournament_id, club_id, group_id, bracket_type,
                round_number, match_number, sabo_match_id, status
            ) VALUES (
                current_match_id, p_tournament_id, p_club_id, 'B', 'group_b_losers_b',
                201 + (i - 22), i - 21, 'B-LB-' || (i - 21), 'pending'
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
            1::INTEGER, i::INTEGER, ('B-M' || i)::VARCHAR(20);
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
        350::INTEGER, 1::INTEGER, 'SF1'::VARCHAR(20);
    
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
        350::INTEGER, 2::INTEGER, 'SF2'::VARCHAR(20);
    
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
        400::INTEGER, 1::INTEGER, 'FINAL'::VARCHAR(20);
    
    RAISE NOTICE 'SABO-32 tournament created successfully: 53 matches total';
    
END;
$$ LANGUAGE plpgsql;
    `;
    
    const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (functionError) {
      console.error('❌ Error creating function:', functionError);
      
      // Try using the built-in SQL editor instead
      console.log('4. Trying to execute function via SQL editor...');
      
      // Split the function into smaller parts
      const parts = [
        `-- Add group_id column if not exists
         DO $$
         BEGIN
             IF NOT EXISTS (
                 SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tournament_matches' 
                 AND column_name = 'group_id'
             ) THEN
                 ALTER TABLE tournament_matches 
                 ADD COLUMN group_id VARCHAR(1) NULL;
                 RAISE NOTICE 'Added group_id column';
             END IF;
         END $$;`,
        
        createFunctionSQL
      ];
      
      for (let i = 0; i < parts.length; i++) {
        console.log(`Executing part ${i + 1}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: parts[i] });
        if (error) {
          console.error(`❌ Error in part ${i + 1}:`, error);
        } else {
          console.log(`✅ Part ${i + 1} executed successfully`);
        }
      }
    } else {
      console.log('✅ create_sabo32_tournament function created successfully');
    }
    
    // Test the function
    console.log('5. Testing SABO-32 tournament creation...');
    
    const testTournamentId = crypto.randomUUID();
    const testClubId = '18f49e79-f402-46d1-90be-889006e9761c';
    const testPlayers = Array.from({ length: 32 }, (_, i) => `test-player-${i + 1}`);
    
    const { data: testResult, error: testError } = await supabase.rpc('create_sabo32_tournament', {
      p_tournament_id: testTournamentId,
      p_club_id: testClubId,
      p_players: testPlayers
    });
    
    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log('✅ Test successful! Created', testResult?.length || 0, 'matches');
      
      // Verify in database
      const { data: matches, error: verifyError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', testTournamentId);
        
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
      } else {
        console.log(`✅ Verified: ${matches.length} matches created in database`);
        console.log('Groups breakdown:', {
          groupA: matches.filter(m => m.group_id === 'A').length,
          groupB: matches.filter(m => m.group_id === 'B').length,
          crossBracket: matches.filter(m => m.group_id === null).length
        });
      }
    }
    
    console.log('🎉 SABO-32 database setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup
setupSABO32Database().then(() => {
  console.log('Setup script finished');
}).catch(error => {
  console.error('Setup script error:', error);
});
