const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🧹 EMERGENCY CLEANUP: REMOVING ALL CONFLICTING TRIGGERS...');
  
  // First, let's manually fix the test7 duplicate issue
  console.log('\n🔧 FIXING TEST7 DUPLICATE PLAYER ISSUE...');
  
  const { data: test7 } = await supabase
    .from('tournaments')
    .select('id')
    .ilike('name', '%test7%')
    .single();
    
  if (test7) {
    // Get the correct R3M1 winner
    const { data: r3m1 } = await supabase
      .from('tournament_matches')
      .select('winner_id')
      .eq('tournament_id', test7.id)
      .eq('round_number', 3)
      .eq('match_number', 1)
      .single();
      
    console.log(`  Correct R3M1 winner: ${r3m1?.winner_id?.substring(0,8)}`);
    
    if (r3m1?.winner_id) {
      // Fix SF1 Player1 - should be R3M1 winner, not e30e1d1d
      const { error: fixError } = await supabase
        .from('tournament_matches')
        .update({
          player1_id: r3m1.winner_id
        })
        .eq('tournament_id', test7.id)
        .eq('round_number', 250)
        .eq('match_number', 1);
        
      if (fixError) {
        console.error('❌ Fix error:', fixError.message);
      } else {
        console.log(`✅ Test7 SF1 Player1 fixed: ${r3m1.winner_id.substring(0,8)} (R3M1 winner)`);
      }
    }
  }
  
  // Now try to disable conflicting functions by creating a simple override
  console.log('\n🛑 CREATING FUNCTION OVERRIDE TO PREVENT CONFLICTS...');
  
  // Create a simple, controlled advancement function
  const cleanupSQL = `
-- Disable all conflicting triggers first
DROP TRIGGER IF EXISTS sabo_semifinals_auto_population ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_sabo_match_completion ON tournament_matches CASCADE;  
DROP TRIGGER IF EXISTS sabo_auto_advancement ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_master_advancement_trigger ON tournament_matches CASCADE;

-- Create a minimal, conflict-free advancement function
CREATE OR REPLACE FUNCTION sabo_clean_advancement_only()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_type text;
  v_winner_id uuid;
BEGIN
  -- Only process completed matches with winners
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
    
    -- Get tournament type
    SELECT tournament_type INTO v_tournament_type 
    FROM tournaments WHERE id = NEW.tournament_id;
    
    -- Handle double elimination tournaments ONLY with basic advancement
    IF v_tournament_type = 'double_elimination' THEN
      v_winner_id := NEW.winner_id;
      
      -- Only handle critical semifinals advancement (simplified)
      IF NEW.round_number = 3 AND NEW.match_number = 1 THEN
        -- R3M1 Winner → SF1 Player1 (with conflict check)
        UPDATE tournament_matches 
        SET player1_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1
          AND (player1_id IS NULL OR player1_id != v_winner_id);
      END IF;
      
      IF NEW.round_number = 3 AND NEW.match_number = 2 THEN
        -- R3M2 Winner → SF2 Player1 (with conflict check)  
        UPDATE tournament_matches 
        SET player1_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2
          AND (player1_id IS NULL OR player1_id != v_winner_id);
      END IF;
      
      IF NEW.round_number = 103 AND NEW.match_number = 1 THEN
        -- Losers A Champion → SF1 Player2 (with conflict check)
        UPDATE tournament_matches 
        SET player2_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1
          AND (player2_id IS NULL OR player2_id != v_winner_id);
      END IF;
      
      IF NEW.round_number = 202 AND NEW.match_number = 1 THEN
        -- Losers B Champion → SF2 Player2 (with conflict check)
        UPDATE tournament_matches 
        SET player2_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2
          AND (player2_id IS NULL OR player2_id != v_winner_id);
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Install the clean trigger
CREATE TRIGGER sabo_clean_advancement_only_trigger
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION sabo_clean_advancement_only();
`;

  console.log('📄 Cleanup SQL prepared');
  console.log('⚠️ This needs to be executed in Supabase Dashboard > SQL Editor');
  console.log('   Copy the SQL from cleanup-triggers.sql file');
  
  // Save the SQL for manual execution
  fs.writeFileSync('cleanup-triggers.sql', cleanupSQL);
  console.log('✅ Cleanup SQL saved to cleanup-triggers.sql');
  
  // Verify the current state
  console.log('\n🔍 CURRENT SEMIFINALS STATUS AFTER FIX:');
  
  const { data: allTournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .ilike('name', '%test%')
    .order('name');
    
  for (const tournament of allTournaments || []) {
    const { data: semifinals } = await supabase
      .from('tournament_matches')
      .select('match_number, player1_id, player2_id')
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .order('match_number');
      
    console.log(`\n${tournament.name}:`);
    if (semifinals) {
      semifinals.forEach(sf => {
        const p1 = sf.player1_id?.substring(0,8) || 'NULL';
        const p2 = sf.player2_id?.substring(0,8) || 'NULL';
        console.log(`  SF${sf.match_number}: ${p1} vs ${p2}`);
      });
      
      // Check for duplicates
      const allPlayers = semifinals.flatMap(sf => [sf.player1_id, sf.player2_id]).filter(p => p);
      const duplicates = allPlayers.filter((p, i) => allPlayers.indexOf(p) !== i);
      if (duplicates.length > 0) {
        console.log(`  🚨 STILL HAS DUPLICATES: ${duplicates.map(p => p.substring(0,8)).join(', ')}`);
      } else {
        console.log(`  ✅ No duplicates found`);
      }
    }
  }
  
  console.log('\n🎯 EMERGENCY CLEANUP COMPLETE!');
  console.log('📋 NEXT STEPS:');
  console.log('1. Execute cleanup-triggers.sql in Supabase Dashboard');
  console.log('2. Refresh browser to test');
  console.log('3. Verify no more duplicate players');
  
})();
