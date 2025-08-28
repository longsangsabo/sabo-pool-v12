// Complete SABO-32 Tournament Creator
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create complete SABO-32 tournament (53 matches)
async function createFullSABO32Tournament() {
  console.log('🎯 Creating complete SABO-32 tournament (53 matches)...');
  
  const tournamentId = crypto.randomUUID();
  const clubId = 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa'; // Existing club
  
  try {
    const allMatches = [];
    
    // ===== GROUP A MATCHES (25 total) =====
    
    // Group A - Winners Bracket Round 1 (8 matches)
    for (let i = 1; i <= 8; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_winners',
        round_number: 1,
        match_number: i,
        sabo_match_id: `A-W1-${i}`,
        status: 'ready',
        player1_name: `Player A${i * 2 - 1}`,
        player2_name: `Player A${i * 2}`
      });
    }
    
    // Group A - Winners Bracket Round 2 (4 matches)
    for (let i = 1; i <= 4; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_winners',
        round_number: 2,
        match_number: i,
        sabo_match_id: `A-W2-${i}`,
        status: 'pending'
      });
    }
    
    // Group A - Winners Bracket Round 3 (2 matches)
    for (let i = 1; i <= 2; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_winners',
        round_number: 3,
        match_number: i,
        sabo_match_id: `A-W3-${i}`,
        status: 'pending'
      });
    }
    
    // Group A - Losers Branch A (7 matches)
    for (let i = 1; i <= 7; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_losers_a',
        round_number: 101 + Math.floor((i - 1) / 4),
        match_number: ((i - 1) % 4) + 1,
        sabo_match_id: `A-LA-${i}`,
        status: 'pending'
      });
    }
    
    // Group A - Losers Branch B (3 matches)
    for (let i = 1; i <= 3; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_losers_b',
        round_number: 201 + (i - 1),
        match_number: i,
        sabo_match_id: `A-LB-${i}`,
        status: 'pending'
      });
    }
    
    // Group A - Final (1 match)
    allMatches.push({
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      club_id: clubId,
      group_id: 'A',
      bracket_type: 'group_a_final',
      round_number: 250,
      match_number: 1,
      sabo_match_id: 'A-FINAL',
      status: 'pending'
    });
    
    // ===== GROUP B MATCHES (25 total) =====
    
    // Group B - Winners Bracket Round 1 (8 matches)
    for (let i = 1; i <= 8; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_winners',
        round_number: 1,
        match_number: i,
        sabo_match_id: `B-W1-${i}`,
        status: 'ready',
        player1_name: `Player B${i * 2 - 1}`,
        player2_name: `Player B${i * 2}`
      });
    }
    
    // Group B - Winners Bracket Round 2 (4 matches)
    for (let i = 1; i <= 4; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_winners',
        round_number: 2,
        match_number: i,
        sabo_match_id: `B-W2-${i}`,
        status: 'pending'
      });
    }
    
    // Group B - Winners Bracket Round 3 (2 matches)
    for (let i = 1; i <= 2; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_winners',
        round_number: 3,
        match_number: i,
        sabo_match_id: `B-W3-${i}`,
        status: 'pending'
      });
    }
    
    // Group B - Losers Branch A (7 matches)
    for (let i = 1; i <= 7; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_losers_a',
        round_number: 101 + Math.floor((i - 1) / 4),
        match_number: ((i - 1) % 4) + 1,
        sabo_match_id: `B-LA-${i}`,
        status: 'pending'
      });
    }
    
    // Group B - Losers Branch B (3 matches)
    for (let i = 1; i <= 3; i++) {
      allMatches.push({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_losers_b',
        round_number: 201 + (i - 1),
        match_number: i,
        sabo_match_id: `B-LB-${i}`,
        status: 'pending'
      });
    }
    
    // Group B - Final (1 match)
    allMatches.push({
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      club_id: clubId,
      group_id: 'B',
      bracket_type: 'group_b_final',
      round_number: 250,
      match_number: 1,
      sabo_match_id: 'B-FINAL',
      status: 'pending'
    });
    
    // ===== CROSS-BRACKET MATCHES (3 total) =====
    
    // Semifinal 1: Winner A vs Runner-up B
    allMatches.push({
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      club_id: clubId,
      group_id: null,
      bracket_type: 'cross_semifinals',
      round_number: 350,
      match_number: 1,
      sabo_match_id: 'SF1',
      status: 'pending'
    });
    
    // Semifinal 2: Winner B vs Runner-up A
    allMatches.push({
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      club_id: clubId,
      group_id: null,
      bracket_type: 'cross_semifinals',
      round_number: 350,
      match_number: 2,
      sabo_match_id: 'SF2',
      status: 'pending'
    });
    
    // Final
    allMatches.push({
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      club_id: clubId,
      group_id: null,
      bracket_type: 'cross_final',
      round_number: 400,
      match_number: 1,
      sabo_match_id: 'FINAL',
      status: 'pending'
    });
    
    // ===== INSERT ALL MATCHES =====
    
    console.log(`📊 Inserting ${allMatches.length} matches...`);
    
    // Insert in batches of 20 to avoid timeout
    const batchSize = 20;
    for (let i = 0; i < allMatches.length; i += batchSize) {
      const batch = allMatches.slice(i, i + batchSize);
      console.log(`📝 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMatches.length / batchSize)}...`);
      
      const { error: batchError } = await supabase
        .from('tournament_matches')
        .insert(batch);
      
      if (batchError) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        return;
      }
    }
    
    // ===== VERIFY CREATION =====
    
    const { data: verifyMatches, error: verifyError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('group_id, round_number, match_number');
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }
    
    // ===== RESULTS =====
    
    console.log('🎉 SABO-32 tournament created successfully!');
    console.log(`📋 Tournament ID: ${tournamentId}`);
    console.log(`📊 Total matches: ${verifyMatches.length}`);
    
    const groupA = verifyMatches.filter(m => m.group_id === 'A');
    const groupB = verifyMatches.filter(m => m.group_id === 'B');
    const crossBracket = verifyMatches.filter(m => m.group_id === null);
    
    console.log(`🔹 Group A: ${groupA.length} matches`);
    console.log(`🔹 Group B: ${groupB.length} matches`);
    console.log(`🔹 Cross-Bracket: ${crossBracket.length} matches`);
    
    // Breakdown by bracket type
    console.log('\n📊 Breakdown by bracket type:');
    const bracketTypes = {};
    verifyMatches.forEach(match => {
      bracketTypes[match.bracket_type] = (bracketTypes[match.bracket_type] || 0) + 1;
    });
    
    Object.entries(bracketTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} matches`);
    });
    
    console.log('\n🎯 How to test:');
    console.log(`1. Open: http://localhost:8000/demo-sabo32`);
    console.log(`2. Enter Tournament ID: ${tournamentId}`);
    console.log(`3. Click "Refresh" to load`);
    console.log(`4. Switch between Group A, Group B, and Cross-Bracket tabs`);
    console.log(`5. Submit scores for Round 1 matches to see advancement`);
    
    return tournamentId;
    
  } catch (error) {
    console.error('❌ Error creating tournament:', error);
    throw error;
  }
}

// Run the creation
createFullSABO32Tournament().then((tournamentId) => {
  console.log(`\n✅ Tournament ${tournamentId} ready for testing!`);
}).catch(error => {
  console.error('❌ Creation failed:', error);
});
