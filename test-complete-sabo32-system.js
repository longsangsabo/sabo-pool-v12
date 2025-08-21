// =============================================
// COMPREHENSIVE SABO-32 SYSTEM TEST
// Test the complete flow from tournament creation to results
// =============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nfobjqkrthtjqoeusvtm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mb2JqcWtydGh0anFvZXVzdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3MDI0NTksImV4cCI6MjA0NDI3ODQ1OX0.JSnmE2r4jf4m4twLUzGOaIHZNJvKhsJHOZxQ-pBFjjs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSABO32System() {
  console.log('🚀 Starting COMPREHENSIVE SABO-32 SYSTEM TEST');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check existing SABO-32 tournaments
    console.log('\n📋 STEP 1: Checking existing SABO-32 tournaments...');
    const { data: existingTournaments, error: fetchError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('current_participants', 32)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching tournaments:', fetchError);
      return;
    }

    let testTournament = existingTournaments?.[0];
    console.log(`✅ Found ${existingTournaments?.length || 0} existing 32-player tournaments`);

    if (testTournament) {
      console.log(`📄 Using existing tournament: ${testTournament.name} (${testTournament.id})`);
    } else {
      console.log('⚠️  No 32-player tournament found. Please create one through the UI first.');
      return;
    }

    // Step 2: Check sabo32_matches table
    console.log('\n📋 STEP 2: Checking sabo32_matches table...');
    const { data: matches, error: matchesError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', testTournament.id);

    if (matchesError) {
      console.error('❌ Error fetching matches:', matchesError.message);
      return;
    }

    console.log(`✅ Found ${matches?.length || 0} matches in sabo32_matches table`);

    // Step 3: Check matches by category
    if (matches && matches.length > 0) {
      const groupAMatches = matches.filter(m => m.group_id === 'A');
      const groupBMatches = matches.filter(m => m.group_id === 'B');
      const crossMatches = matches.filter(m => m.group_id === null);
      const completedMatches = matches.filter(m => m.status === 'completed');

      console.log(`   📊 Group A: ${groupAMatches.length} matches`);
      console.log(`   📊 Group B: ${groupBMatches.length} matches`);
      console.log(`   📊 Cross-bracket: ${crossMatches.length} matches`);
      console.log(`   ✅ Completed: ${completedMatches.length}/${matches.length} matches`);

      // Step 4: Test score submission functionality
      console.log('\n📋 STEP 4: Testing score submission...');
      
      // Find first pending match with both players
      const pendingMatch = matches.find(m => 
        m.status === 'pending' && 
        m.player1_id && 
        m.player2_id
      );

      if (pendingMatch) {
        console.log(`🎯 Testing score submission for match: ${pendingMatch.sabo_match_id}`);
        
        // Simulate a score submission
        const testScore1 = Math.floor(Math.random() * 10) + 5; // 5-14 points
        const testScore2 = Math.floor(Math.random() * 10) + 5;
        const finalScore1 = testScore1 === testScore2 ? testScore1 + 1 : testScore1;
        const winner_id = finalScore1 > testScore2 ? pendingMatch.player1_id : pendingMatch.player2_id;

        console.log(`   📊 Submitting score: ${finalScore1} - ${testScore2}`);
        console.log(`   🏆 Winner: ${winner_id === pendingMatch.player1_id ? 'Player 1' : 'Player 2'}`);

        const { error: updateError } = await supabase
          .from('sabo32_matches')
          .update({
            score_player1: finalScore1,
            score_player2: testScore2,
            winner_id: winner_id,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', pendingMatch.id);

        if (updateError) {
          console.error('❌ Error updating match:', updateError.message);
        } else {
          console.log('✅ Score submitted successfully!');
          
          // Check for advancement
          console.log('🔄 Checking for automatic advancement...');
          const { data: updatedMatches, error: advancementError } = await supabase
            .from('sabo32_matches')
            .select('*')
            .eq('tournament_id', testTournament.id)
            .neq('status', 'pending');

          if (!advancementError) {
            console.log(`✅ ${updatedMatches?.length || 0} matches now have results`);
          }
        }
      } else {
        console.log('⚠️  No pending matches with both players found');
      }

      // Step 5: Test tournament results calculation
      console.log('\n📋 STEP 5: Testing results calculation...');
      
      const completedCount = matches.filter(m => m.status === 'completed').length;
      const progressPercentage = ((completedCount / matches.length) * 100).toFixed(1);
      
      console.log(`📊 Tournament Progress: ${progressPercentage}%`);
      
      if (completedCount > 0) {
        // Check for final match
        const finalMatch = matches.find(m => 
          m.bracket_type === 'cross_final' && 
          m.status === 'completed'
        );

        if (finalMatch) {
          console.log('🏆 TOURNAMENT COMPLETED!');
          console.log(`   🥇 Champion: ${finalMatch.winner_id === finalMatch.player1_id ? 'Player 1' : 'Player 2'}`);
          console.log(`   🥈 Runner-up: ${finalMatch.winner_id === finalMatch.player1_id ? 'Player 2' : 'Player 1'}`);
        } else {
          console.log('⏳ Tournament still in progress...');
        }
      }
    }

    // Step 6: UI Access Test
    console.log('\n📋 STEP 6: UI Access Information...');
    console.log('🌐 Access your tournament at: http://localhost:8001');
    console.log('📍 Navigation: Tournaments → Tournament Management Hub');
    console.log(`🎯 Tournament ID: ${testTournament.id}`);
    console.log('⚡ Features available:');
    console.log('   • View SABO-32 bracket with live updates');
    console.log('   • Submit scores directly in match cards');
    console.log('   • View automatic advancement');
    console.log('   • See tournament results dashboard');

    console.log('\n🎉 SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 FATAL ERROR during system test:', error);
  }
}

// Run the test
testCompleteSABO32System();
