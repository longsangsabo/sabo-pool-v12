// Check backend for SABO match card
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMatchCard() {
  console.log('🔍 Checking backend for match: Vũ Hùng Hải vs Võ Hương Cường');
  
  // 1. Find the specific match
  const { data: matches, error } = await supabase
    .from('sabo_tournament_matches')
    .select('*')
    .or('player1_name.ilike.%Vũ Hùng Hải%,player2_name.ilike.%Vũ Hùng Hải%,player1_name.ilike.%Võ Hương Cường%,player2_name.ilike.%Võ Hương Cường%');
    
  if (error) {
    console.log('❌ Database error:', error.message);
    return;
  }
    
  console.log('📊 Found', matches?.length || 0, 'matches with these players');
  
  if (matches && matches.length > 0) {
    const match = matches[0];
    console.log('\n✅ Match details:');
    console.log('  ID:', match.id);
    console.log('  Player 1:', match.player1_name, '| Score:', match.score_player1);
    console.log('  Player 2:', match.player2_name, '| Score:', match.score_player2);
    console.log('  Status:', match.status);
    console.log('  Round:', match.round_number, '| Match:', match.match_number);
    console.log('  Winner ID:', match.winner_id);
    
    // Test backend function
    console.log('\n🧪 Testing backend function...');
    const { data: result, error: submitError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: match.id,
      p_player1_score: 7,
      p_player2_score: 4,
      p_submitted_by: null
    });
    
    if (submitError) {
      console.log('❌ BACKEND ISSUE FOUND:', submitError.message);
      console.log('🔧 This explains why Enter Score button not working!');
      
      // Check if function exists
      const { data: functions } = await supabase.rpc('get_function_info', {});
      console.log('Functions check:', functions);
      
    } else {
      console.log('✅ Backend function working:', result);
      
      // Verify data update
      const { data: updated } = await supabase
        .from('sabo_tournament_matches')
        .select('score_player1, score_player2, status, winner_id, updated_at')
        .eq('id', match.id)
        .single();
        
      console.log('📊 Data after submit:', updated);
      console.log('\n🎯 DIAGNOSIS:');
      if (updated.score_player1 === 7 && updated.score_player2 === 4) {
        console.log('✅ Backend is working perfectly!');
        console.log('💡 If UI not updating, issue is in frontend real-time or cache');
      } else {
        console.log('❌ Backend not updating data correctly');
      }
    }
  } else {
    console.log('\n❌ No matches found with those exact names');
    console.log('🔍 Checking all available matches...');
    
    const { data: allMatches } = await supabase
      .from('sabo_tournament_matches')
      .select('id, player1_name, player2_name, status, round_number')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (allMatches && allMatches.length > 0) {
      console.log('\n📋 Recent matches in database:');
      allMatches.forEach((m, i) => {
        console.log(`  ${i+1}. ${m.player1_name} vs ${m.player2_name} (R${m.round_number}, ${m.status})`);
      });
      
      console.log('\n💡 LIKELY ISSUE:');
      console.log('- Match exists in UI but not in database');
      console.log('- Or player names in database are slightly different');
      console.log('- Frontend might be showing cached/mock data');
    } else {
      console.log('\n❌ NO SABO MATCHES in database at all!');
      console.log('💡 PROBLEM: UI showing match that doesn\'t exist in backend');
    }
  }
}

checkMatchCard();
