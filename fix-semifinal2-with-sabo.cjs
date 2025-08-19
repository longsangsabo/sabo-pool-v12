const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

(async () => {
  console.log('🔍 Lấy SABO từ Losers Bracket B và update Semifinal 2...');
  
  // Get tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1)
    .single();
  
  // Get Losers Bracket B winner (Round 202)
  const { data: losersBracketB } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_number', 202)
    .eq('match_number', 1)
    .single();
  
  console.log('📊 Losers Bracket B (Round 202):');
  console.log('  Winner ID:', losersBracketB?.winner_id?.substring(0,8));
  console.log('  Status:', losersBracketB?.status);
  console.log('  Score:', `${losersBracketB?.score_player1 || 0}-${losersBracketB?.score_player2 || 0}`);
  
  if (losersBracketB?.winner_id) {
    // Get winner profile
    const { data: winnerProfile } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .eq('id', losersBracketB.winner_id)
      .single();
    
    console.log('🏆 Losers Bracket B Winner:', winnerProfile?.display_name || winnerProfile?.full_name || 'Unknown');
    
    // Update Semifinal 2 Player 2 với SABO
    console.log('\n🔧 Updating Semifinal 2 Player 2 với SABO...');
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        player2_id: losersBracketB.winner_id,
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournament.id)
      .eq('round_number', 250)
      .eq('match_number', 2);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Updated Semifinal 2 với SABO từ Losers Bracket B');
      
      // Verify
      const { data: semifinal2 } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2)
        .single();
      
      const playerIds = [semifinal2.player1_id, semifinal2.player2_id].filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .in('id', playerIds);
      
      console.log('\n✅ Semifinal 2 updated:');
      const p1 = profiles.find(p => p.id === semifinal2.player1_id);
      const p2 = profiles.find(p => p.id === semifinal2.player2_id);
      console.log(`  Player 1: ${p1?.display_name || p1?.full_name || 'Unknown'}`);
      console.log(`  Player 2: ${p2?.display_name || p2?.full_name || 'Unknown'}`);
    }
  } else {
    console.log('❌ No winner found in Losers Bracket B');
  }
})();
