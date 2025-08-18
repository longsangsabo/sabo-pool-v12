// Test script để nhập tỷ số
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testScoreSubmission() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🎯 Testing score submission for tournament:', tournamentId);
  
  try {
    // Lấy 1 match để test
    console.log('📡 Getting first match...');
    const matchResult = await supabaseService
      .from('sabo_tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'pending')
      .limit(1);
      
    if (matchResult.error) {
      console.error('❌ Error getting match:', matchResult.error);
      return;
    }
    
    const match = matchResult.data[0];
    if (!match) {
      console.log('❌ No pending matches found');
      return;
    }
    
    console.log('✅ Found match to test:', {
      id: match.id,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      round: match.round_number,
      matchNumber: match.match_number
    });
    
    // Test update score với service key
    console.log('🧪 Testing score update with service key...');
    const updateResult = await supabaseService
      .from('sabo_tournament_matches')
      .update({
        score_player1: 10,
        score_player2: 5,
        winner_id: match.player1_id, // Player 1 thắng
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', match.id);
      
    if (updateResult.error) {
      console.error('❌ Error updating score:', updateResult.error);
    } else {
      console.log('✅ Score updated successfully!');
      
      // Verify update
      const verifyResult = await supabaseService
        .from('sabo_tournament_matches')
        .select('*')
        .eq('id', match.id)
        .single();
        
      if (verifyResult.data) {
        console.log('✅ Verified update:', {
          score_player1: verifyResult.data.score_player1,
          score_player2: verifyResult.data.score_player2,
          winner_id: verifyResult.data.winner_id,
          status: verifyResult.data.status
        });
      }
    }
    
    // Test với anon key
    console.log('🧪 Testing score update with anon key...');
    const anonUpdateResult = await supabase
      .from('sabo_tournament_matches')
      .update({
        score_player1: 8,
        score_player2: 3
      })
      .eq('id', match.id);
      
    if (anonUpdateResult.error) {
      console.error('❌ Anon key cannot update (expected due to RLS):', anonUpdateResult.error.message);
    } else {
      console.log('✅ Anon key can update');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testScoreSubmission();
