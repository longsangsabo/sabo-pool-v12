// Use existing tournament to create test matches
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function useExistingTournament() {
  console.log('📊 Checking existing tournaments...');
  
  const { data: tournaments, error: tourError } = await supabase
    .from('tournaments')
    .select('id, name, status, tournament_type')
    .eq('status', 'active')
    .limit(10);
    
  if (tourError) {
    console.log('❌ Error fetching tournaments:', tourError);
    return;
  }
  
  console.log('📋 Found tournaments:', tournaments?.length || 0);
  
  if (tournaments && tournaments.length > 0) {
    const tournament = tournaments[0];
    console.log(`✅ Using tournament: "${tournament.name}" (${tournament.id})`);
    
    // Create test matches for this tournament
    console.log('\n🎯 Creating test matches...');
    
    const testMatches = [
      {
        player1_name: 'Alice (UI Test)',
        player2_name: 'Bob (UI Test)',
        player1_id: 'ui-test-alice',
        player2_id: 'ui-test-bob'
      },
      {
        player1_name: 'Charlie (UI Test)',
        player2_name: 'Diana (UI Test)',
        player1_id: 'ui-test-charlie',
        player2_id: 'ui-test-diana'
      }
    ];
    
    const createdMatches = [];
    
    for (let i = 0; i < testMatches.length; i++) {
      const testMatch = testMatches[i];
      
      const { data: match, error: matchError } = await supabase
        .from('sabo_tournament_matches')
        .insert({
          tournament_id: tournament.id,
          player1_id: testMatch.player1_id,
          player2_id: testMatch.player2_id,
          player1_name: testMatch.player1_name,
          player2_name: testMatch.player2_name,
          round_number: 99, // Special round for testing
          match_number: 100 + i,
          status: 'pending',
          bracket_type: 'winner',
          score_player1: null,
          score_player2: null
        })
        .select()
        .single();
        
      if (matchError) {
        console.log(`❌ Error creating match ${i+1}:`, matchError.message);
      } else {
        createdMatches.push(match);
        console.log(`✅ Match ${i+1} created: ${match.player1_name} vs ${match.player2_name}`);
      }
    }
    
    if (createdMatches.length > 0) {
      // Test the score submission function
      console.log('\n🧪 Testing score submission...');
      const testMatch = createdMatches[0];
      
      const { data: scoreResult, error: scoreError } = await supabase.rpc('submit_sabo_match_score', {
        p_match_id: testMatch.id,
        p_player1_score: 8,
        p_player2_score: 3,
        p_submitted_by: null
      });
      
      if (scoreError) {
        console.log('❌ Score submission failed:', scoreError.message);
      } else {
        console.log('✅ Score submission test successful!');
        console.log('Result:', scoreResult);
        
        // Verify the update
        const { data: updatedMatch } = await supabase
          .from('sabo_tournament_matches')
          .select('player1_name, player2_name, score_player1, score_player2, status, winner_id')
          .eq('id', testMatch.id)
          .single();
          
        console.log('📊 Match updated:', updatedMatch);
      }
      
      console.log('\n🎯 UI TESTING READY!');
      console.log('='.repeat(50));
      console.log(`🏆 Tournament: "${tournament.name}"`);
      console.log(`📝 Tournament ID: ${tournament.id}`);
      console.log(`🎮 Test matches created: ${createdMatches.length}`);
      console.log('\n🔧 TEST STEPS:');
      console.log('1. Open http://localhost:8000/');
      console.log('2. Find tournament:', tournament.name);
      console.log('3. Look for matches with "(UI Test)" players');
      console.log('4. Click "Enter Score" on pending matches');
      console.log('5. Submit scores and verify they appear on cards');
      console.log('\n💡 Expected:');
      console.log('- Scores should appear immediately after submission');
      console.log('- Match status should update to "completed"');
      console.log('- Winner should be highlighted');
      
      // Show current pending matches for easy identification
      console.log('\n📋 PENDING MATCHES TO TEST:');
      const pendingMatches = createdMatches.filter(m => m.status === 'pending');
      pendingMatches.forEach((match, idx) => {
        console.log(`  ${idx + 1}. ${match.player1_name} vs ${match.player2_name} (Match #${match.match_number})`);
      });
    }
  } else {
    console.log('❌ No active tournaments found. You may need to create one first.');
  }
}

useExistingTournament();
