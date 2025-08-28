const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkMatchesLoading() {
  console.log('🔍 CHECKING MATCHES LOADING ISSUE\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    console.log('1️⃣ Checking database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await serviceSupabase
      .from('sabo32_matches')
      .select('id')
      .eq('tournament_id', tournamentId)
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    
    console.log('✅ Database connection OK');
    
    console.log('\n2️⃣ Checking matches data...');
    
    // Get all matches
    const { data: matches, error: matchError } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('group_id')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');
    
    if (matchError) {
      console.error('❌ Error fetching matches:', matchError);
      return;
    }
    
    console.log(`✅ Found ${matches.length} matches`);
    
    if (matches.length === 0) {
      console.log('❌ NO MATCHES FOUND! This explains the empty UI.');
      console.log('   Tournament ID might be wrong or matches were deleted.');
      return;
    }
    
    // Analyze matches by group
    const groupA = matches.filter(m => m.group_id === 'A');
    const groupB = matches.filter(m => m.group_id === 'B');
    const crossBracket = matches.filter(m => m.group_id === null);
    
    console.log('\n3️⃣ Matches breakdown:');
    console.log(`   Group A: ${groupA.length} matches`);
    console.log(`   Group B: ${groupB.length} matches`);
    console.log(`   Cross-Bracket: ${crossBracket.length} matches`);
    
    // Check tournament table
    console.log('\n4️⃣ Checking tournament existence...');
    
    const { data: tournament, error: tournamentError } = await serviceSupabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId);
    
    if (tournamentError) {
      console.error('❌ Error checking tournament:', tournamentError);
    } else if (tournament.length === 0) {
      console.log('❌ Tournament not found in tournaments table!');
    } else {
      console.log('✅ Tournament exists:', tournament[0].name || 'No name');
    }
    
    // Check frontend query
    console.log('\n5️⃣ Testing frontend query format...');
    
    // Simulate the exact query from useSABO32Tournament hook
    const { data: frontendData, error: frontendError } = await serviceSupabase
      .from('sabo32_matches')
      .select(`
        id,
        tournament_id,
        bracket_type,
        round_number,
        match_number,
        sabo_match_id,
        player1_id,
        player2_id,
        winner_id,
        loser_id,
        score_player1,
        score_player2,
        status,
        group_id,
        advances_to_match_id,
        feeds_loser_to_match_id,
        qualifies_as,
        created_at,
        updated_at
      `)
      .eq('tournament_id', tournamentId)
      .order('round_number')
      .order('match_number');
    
    if (frontendError) {
      console.error('❌ Frontend query failed:', frontendError);
    } else {
      console.log(`✅ Frontend query returned ${frontendData.length} matches`);
      
      if (frontendData.length > 0) {
        console.log('\n   Sample match:');
        const sample = frontendData[0];
        console.log(`     ID: ${sample.id}`);
        console.log(`     Bracket: ${sample.bracket_type}`);
        console.log(`     Round: ${sample.round_number}`);
        console.log(`     Match: ${sample.sabo_match_id}`);
        console.log(`     Status: ${sample.status}`);
      }
    }
    
    // Check if tournament ID is hardcoded correctly in frontend
    console.log('\n6️⃣ Checking frontend tournament ID...');
    console.log(`   Expected: ${tournamentId}`);
    console.log('   Check if this ID is used in the frontend component');
    
    // RLS policy check
    console.log('\n7️⃣ Checking RLS policies...');
    
    const { data: policies, error: policyError } = await serviceSupabase
      .rpc('exec_sql', {
        sql: "SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'sabo32_matches';"
      });
    
    if (policyError) {
      console.error('❌ Policy check failed:', policyError);
    } else {
      console.log(`✅ Found ${policies.length} RLS policies for sabo32_matches`);
      if (policies.length === 0) {
        console.log('⚠️  No RLS policies - this could cause access issues');
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  checkMatchesLoading().catch(console.error);
}

module.exports = { checkMatchesLoading };
