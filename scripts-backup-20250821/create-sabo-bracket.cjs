// Tạo SABO bracket trực tiếp cho tournament
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ quiet: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createSABOBracket() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🚀 Creating SABO bracket for tournament:', tournamentId);
  
  try {
    // 1. Get confirmed participants
    console.log('👥 Getting confirmed participants...');
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed')
      .order('created_at');
      
    if (regError) {
      console.error('❌ Error fetching registrations:', regError);
      return;
    }
    
    if (!registrations || registrations.length !== 16) {
      console.error(`❌ Need exactly 16 participants, got ${registrations?.length || 0}`);
      return;
    }
    
    console.log('✅ Got 16 confirmed participants');
    
    // 2. Create SABO matches structure (27 matches total)
    console.log('🏗️ Creating SABO bracket structure...');
    
    const matches = [];
    
    // Winners Bracket - Round 1 (8 matches)
    for (let i = 1; i <= 8; i++) {
      const player1Index = (i - 1) * 2;
      const player2Index = player1Index + 1;
      
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `W_R1_M${i}`,
        round_number: 1,
        match_number: i,
        player1_id: registrations[player1Index]?.user_id || null,
        player2_id: registrations[player2Index]?.user_id || null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winners',
        branch_type: null,
        score_player1: null,
        score_player2: null
      });
    }
    
    // Winners Bracket - Round 2 (4 matches)
    for (let i = 1; i <= 4; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `W_R2_M${i}`,
        round_number: 2,
        match_number: i,
        player1_id: null, // Will be determined by R1 winners
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winners',
        branch_type: null,
        score_player1: null,
        score_player2: null
      });
    }
    
    // Winners Bracket - Round 3 (2 matches)
    for (let i = 1; i <= 2; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `W_R3_M${i}`,
        round_number: 3,
        match_number: i,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'winners',
        branch_type: null,
        score_player1: null,
        score_player2: null
      });
    }
    
    // Losers Bracket Branch A (5 matches)
    for (let i = 1; i <= 5; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `L_A_R${Math.ceil(i/2)}_M${i}`,
        round_number: Math.ceil(i / 2),
        match_number: i,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'losers',
        branch_type: 'A',
        score_player1: null,
        score_player2: null
      });
    }
    
    // Losers Bracket Branch B (5 matches)
    for (let i = 1; i <= 5; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `L_B_R${Math.ceil(i/2)}_M${i}`,
        round_number: Math.ceil(i / 2),
        match_number: i,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'pending',
        bracket_type: 'losers',
        branch_type: 'B',
        score_player1: null,
        score_player2: null
      });
    }
    
    // Semifinals (2 matches)
    matches.push({
      tournament_id: tournamentId,
      sabo_match_id: 'SEMI_1',
      round_number: 1,
      match_number: 1,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'pending',
      bracket_type: 'semifinals',
      branch_type: null,
      score_player1: null,
      score_player2: null
    });
    
    // Finals (1 match)
    matches.push({
      tournament_id: tournamentId,
      sabo_match_id: 'FINAL',
      round_number: 1,
      match_number: 1,
      player1_id: null,
      player2_id: null,
      winner_id: null,
      status: 'pending',
      bracket_type: 'finals',
      branch_type: null,
      score_player1: null,
      score_player2: null
    });
    
    console.log(`📊 Created ${matches.length} SABO matches`);
    
    // 3. Clear existing matches (if any)
    console.log('🧹 Clearing existing matches...');
    await supabase
      .from('sabo_tournament_matches')
      .delete()
      .eq('tournament_id', tournamentId);
    
    // 4. Insert matches in batches
    console.log('💾 Saving SABO matches to database...');
    const batchSize = 5;
    let savedCount = 0;
    
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('sabo_tournament_matches')
          .insert(batch)
          .select('id, sabo_match_id');
          
        if (error) {
          console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        } else {
          savedCount += data.length;
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${data.length} matches`);
        }
      } catch (err) {
        console.error(`💥 Batch ${Math.floor(i/batchSize) + 1} exception:`, err.message);
      }
    }
    
    console.log(`🎉 Successfully saved ${savedCount}/${matches.length} SABO matches!`);
    
    if (savedCount === matches.length) {
      console.log('✅ SABO bracket creation completed successfully!');
      console.log('🌐 Refresh the tournament page to see the bracket');
    }
    
  } catch (error) {
    console.error('❌ Error creating SABO bracket:', error.message);
  }
}

createSABOBracket();
