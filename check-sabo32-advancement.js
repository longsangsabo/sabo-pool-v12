// Check SABO-32 tournament data and advancement logic
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vddssjjsajgabwabrmfn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZHNzampzYWpnYWJ3YWJybWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNDEyNTksImV4cCI6MjA0ODgxNzI1OX0.FpJIqp3cUsJhIpA_Hc3-2v8pqo77h5bKp6F9N3C82Po';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSABO32Tournament() {
  console.log('🔍 Checking SABO-32 tournament data...');
  
  const tournamentId = 'sabo-32-2024';
  
  try {
    // 1. Check total matches
    const { data: allMatches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('group_id', { ascending: true })
      .order('bracket_type', { ascending: true })
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });

    if (error) {
      console.error('❌ Error fetching matches:', error);
      return;
    }

    if (!allMatches || allMatches.length === 0) {
      console.log('❌ No matches found for tournament:', tournamentId);
      return;
    }

    console.log(`📊 Total matches: ${allMatches.length}`);
    
    // 2. Group by bracket types
    const grouped = {};
    allMatches.forEach(match => {
      const key = `${match.group_id}_${match.bracket_type}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(match);
    });

    // 3. Check each bracket type
    Object.keys(grouped).forEach(key => {
      const matches = grouped[key];
      const completedMatches = matches.filter(m => m.status === 'completed').length;
      console.log(`\n📋 ${key}: ${matches.length} matches (${completedMatches} completed)`);
      
      matches.forEach(match => {
        const player1 = match.player1_id ? '✅' : '❌';
        const player2 = match.player2_id ? '✅' : '❌';
        const status = match.status;
        console.log(`  ${match.sabo_match_id}: ${player1} vs ${player2} [${status}]`);
      });
    });

    // 4. Check specific Losers B issue
    console.log('\n🔍 Checking Losers B advancement logic...');
    
    const groupAWinners = allMatches.filter(m => 
      m.group_id === 'A' && m.bracket_type === 'group_a_winners'
    );
    
    const groupALosersB = allMatches.filter(m => 
      m.group_id === 'A' && m.bracket_type === 'group_a_losers_b'
    );

    console.log('\n🏆 Group A Winners bracket:');
    groupAWinners.forEach(match => {
      if (match.status === 'completed') {
        const winner = match.winner_id;
        const loser = match.player1_id === winner ? match.player2_id : match.player1_id;
        console.log(`  ${match.sabo_match_id}: Winner=${winner?.slice(-4)} | Loser=${loser?.slice(-4)} should go to Losers`);
      }
    });

    console.log('\n💔 Group A Losers B bracket:');
    groupALosersB.forEach(match => {
      console.log(`  ${match.sabo_match_id}: P1=${match.player1_id?.slice(-4) || 'TBD'} vs P2=${match.player2_id?.slice(-4) || 'TBD'}`);
    });

    // 5. Check advancement function availability
    console.log('\n🔧 Testing advancement function...');
    const { data: funcResult, error: funcError } = await supabase.rpc('test_sabo32_advancement', {
      tournament_id: tournamentId
    });

    if (funcError) {
      console.log('❌ Advancement function not available or error:', funcError.message);
    } else {
      console.log('✅ Advancement function available:', funcResult);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSABO32Tournament();
