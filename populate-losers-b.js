// Populate Losers Branch B với losers từ Winners Round 2
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateLosersBranchB() {
  console.log('🔥 Populating Losers Branch B with Winners Round 2 losers...');
  
  try {
    // Get all completed Winners Round 2 matches
    const { data: winnersR2Matches, error: r2Error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', 'sabo-32-2024')
      .like('bracket_type', '%_winners')
      .eq('round_number', 2)
      .eq('status', 'completed');
      
    if (r2Error) throw r2Error;
    
    console.log(`📋 Found ${winnersR2Matches?.length || 0} completed Winners Round 2 matches`);
    
    if (!winnersR2Matches || winnersR2Matches.length === 0) {
      console.log('❌ No completed Winners Round 2 matches found');
      return;
    }
    
    let updates = 0;
    
    for (const match of winnersR2Matches) {
      if (!match.winner_id || !match.player1_id || !match.player2_id) continue;
      
      // Determine loser
      const loserId = match.winner_id === match.player1_id 
        ? match.player2_id 
        : match.player1_id;
        
      console.log(`🎯 Processing match ${match.sabo_match_id}: winner=${match.winner_id}, loser=${loserId}`);
      
      // Find corresponding Losers Branch B match
      const { data: losersBMatches, error: lbError } = await supabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', match.tournament_id)
        .eq('group_id', match.group_id)
        .eq('bracket_type', match.bracket_type.replace('_winners', '_losers_b'))
        .eq('round_number', 201)
        .order('match_number', { ascending: true });
        
      if (lbError) throw lbError;
      
      // Find first available slot in Losers Branch B
      const availableMatch = losersBMatches?.find(m => 
        !m.player1_id || !m.player2_id
      );
      
      if (availableMatch) {
        const updateField = !availableMatch.player1_id ? 'player1_id' : 'player2_id';
        
        const { error: updateError } = await supabase
          .from('sabo32_matches')
          .update({ 
            [updateField]: loserId,
            updated_at: new Date().toISOString()
          })
          .eq('id', availableMatch.id);
          
        if (updateError) throw updateError;
        
        console.log(`✅ Placed loser ${loserId} in Losers B match ${availableMatch.sabo_match_id} as ${updateField}`);
        updates++;
      } else {
        console.log(`⚠️ No available slots in Losers B for group ${match.group_id}`);
      }
    }
    
    console.log(`🎉 Successfully populated ${updates} players in Losers Branch B`);
    
    // Verify the results
    const { data: verification, error: verifyError } = await supabase
      .from('sabo32_matches')
      .select('group_id, bracket_type, round_number, player1_id, player2_id, sabo_match_id')
      .eq('tournament_id', 'sabo-32-2024')
      .like('bracket_type', '%_losers_b')
      .order('group_id', { ascending: true })
      .order('match_number', { ascending: true });
      
    if (verifyError) throw verifyError;
    
    console.log('\n📊 Losers Branch B Status:');
    verification?.forEach(match => {
      const p1 = match.player1_id ? '✅' : '❌';
      const p2 = match.player2_id ? '✅' : '❌';
      console.log(`${match.sabo_match_id}: ${p1} vs ${p2}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

populateLosersBranchB();
