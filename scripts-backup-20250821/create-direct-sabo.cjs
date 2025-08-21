// Tạo SABO bracket với approach mới
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ quiet: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDirectSABOMatches() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🚀 Creating SABO matches directly...');
  
  try {
    // Test table access first
    console.log('🔍 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('sabo_tournament_matches')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error('❌ Table access error:', testError.message);
      return;
    }
    
    console.log('✅ Table accessible');
    
    // Get participants
    console.log('👥 Getting participants...');
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed')
      .order('created_at')
      .limit(16);
      
    if (regError) {
      console.error('❌ Error getting participants:', regError);
      return;
    }
    
    if (!registrations || registrations.length !== 16) {
      console.error(`❌ Need 16 participants, got ${registrations?.length || 0}`);
      return;
    }
    
    const playerIds = registrations.map(r => r.user_id);
    console.log(`✅ Got ${playerIds.length} participants`);
    
    // Create minimal SABO structure
    const matches = [];
    
    // Winners Round 1 - 8 matches with real players
    for (let i = 1; i <= 8; i++) {
      const p1Index = (i - 1) * 2;
      const p2Index = p1Index + 1;
      
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `W1M${i}`,
        round_number: 1,
        match_number: i,
        player1_id: playerIds[p1Index],
        player2_id: playerIds[p2Index],
        winner_id: null,
        status: 'pending',
        bracket_type: 'winners',
        branch_type: null,
        score_player1: null,
        score_player2: null
      });
    }
    
    // Winners Round 2 - 4 matches
    for (let i = 1; i <= 4; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `W2M${i}`,
        round_number: 2,
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
    
    // Winners Round 3 - 2 matches
    for (let i = 1; i <= 2; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `W3M${i}`,
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
    
    // Losers Bracket A - 5 matches
    for (let i = 1; i <= 5; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `LAM${i}`,
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
    
    // Losers Bracket B - 5 matches
    for (let i = 1; i <= 5; i++) {
      matches.push({
        tournament_id: tournamentId,
        sabo_match_id: `LBM${i}`,
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
    
    // Semifinals
    matches.push({
      tournament_id: tournamentId,
      sabo_match_id: 'SEMI',
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
    
    // Finals
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
    
    // Try inserting one match first to test permissions
    console.log('🧪 Testing single match insert...');
    const testMatch = matches[0];
    
    const { data: singleResult, error: singleError } = await supabase
      .from('sabo_tournament_matches')
      .insert([testMatch])
      .select();
      
    if (singleError) {
      console.error('❌ Single insert failed:', singleError.message);
      console.log('🔧 Error details:', singleError);
      
      // Try using SQL function instead
      console.log('🔄 Trying SQL function approach...');
      
      const { data: sqlResult, error: sqlError } = await supabase.rpc(
        'create_sabo_match',
        {
          p_tournament_id: tournamentId,
          p_sabo_match_id: testMatch.sabo_match_id,
          p_round_number: testMatch.round_number,
          p_match_number: testMatch.match_number,
          p_player1_id: testMatch.player1_id,
          p_player2_id: testMatch.player2_id,
          p_bracket_type: testMatch.bracket_type
        }
      );
      
      if (sqlError) {
        console.error('❌ SQL function also failed:', sqlError.message);
      } else {
        console.log('✅ SQL function worked!', sqlResult);
      }
      
      return;
    }
    
    console.log('✅ Single match inserted successfully!');
    
    // Clear existing and insert all
    console.log('🧹 Clearing existing matches...');
    await supabase
      .from('sabo_tournament_matches')
      .delete()
      .eq('tournament_id', tournamentId);
    
    // Insert all matches
    console.log('💾 Inserting all matches...');
    const { data: allResult, error: allError } = await supabase
      .from('sabo_tournament_matches')
      .insert(matches)
      .select('id, sabo_match_id');
      
    if (allError) {
      console.error('❌ Bulk insert failed:', allError.message);
    } else {
      console.log(`🎉 Successfully created ${allResult.length} SABO matches!`);
      console.log('✅ SABO bracket is ready!');
      console.log('🔄 Please refresh the tournament page to see the bracket');
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

createDirectSABOMatches();
