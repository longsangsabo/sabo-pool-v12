import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAndFixMatchStatus() {
  const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🔍 Checking match statuses for score submission...');
  
  // Check all Round 1 matches and their status
  const { data: matches, error } = await supabase
    .from('tournament_matches')
    .select('id, match_number, player1_id, player2_id, status, round_number')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .order('match_number');
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Round 1 matches status:');
  matches?.forEach(match => {
    const hasP1 = match.player1_id ? '✅' : '❌';
    const hasP2 = match.player2_id ? '✅' : '❌';
    console.log(`Match ${match.match_number}: ${match.status} | P1: ${hasP1} P2: ${hasP2}`);
  });
  
  // Find matches that have both players but are still 'pending'
  const pendingMatches = matches?.filter(m => 
    m.player1_id && m.player2_id && m.status === 'pending'
  ) || [];
  
  if (pendingMatches.length > 0) {
    console.log(`\n🔧 Found ${pendingMatches.length} matches with both players but pending status`);
    console.log('📝 Updating them to "ready" status...');
    
    const { data: updatedMatches, error: updateError } = await supabase
      .from('tournament_matches')
      .update({ status: 'ready' })
      .in('id', pendingMatches.map(m => m.id))
      .select();
      
    if (updateError) {
      console.error('❌ Update error:', updateError);
    } else {
      console.log(`✅ Updated ${updatedMatches?.length || 0} matches to ready status`);
      updatedMatches?.forEach(match => {
        console.log(`  - Match ${match.match_number}: ${match.status}`);
      });
    }
  } else {
    console.log('\n✅ All matches with players are already in correct status');
  }
  
  // Also check what the SABOMatchCard component expects
  console.log('\n📋 Match status requirements for score submission:');
  console.log('- Status must be: ready, scheduled, or in_progress');
  console.log('- Both player1_id and player2_id must be present');
  console.log('- Match must not be completed');
}

checkAndFixMatchStatus();
