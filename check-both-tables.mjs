// Check both tournament tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBothTables() {
  console.log('🔍 Checking BOTH tournament tables for Vietnamese players...');
  
  // Check regular tournament_matches table
  console.log('\n1. Checking tournament_matches table:');
  const { data: regularMatches, error: regularError } = await supabase
    .from('tournament_matches')
    .select('id, tournament_id, player1_name, player2_name, round_number, status, score_player1, score_player2')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (regularError) {
    console.log('❌ Error:', regularError.message);
  } else {
    console.log('📊 Found', regularMatches?.length || 0, 'matches in tournament_matches');
    regularMatches?.forEach((m, i) => {
      console.log(`  ${i+1}. ${m.player1_name || 'TBD'} vs ${m.player2_name || 'TBD'} (R${m.round_number}, ${m.status})`);
      if (m.score_player1 !== null || m.score_player2 !== null) {
        console.log(`      Score: ${m.score_player1}-${m.score_player2}`);
      }
    });
  }
  
  // Check SABO-specific table  
  console.log('\n2. Checking tournament_matches table:');
  const { data: saboMatches, error: saboError } = await supabase
    .from('tournament_matches')
    .select('id, tournament_id, player1_name, player2_name, round_number, status, score_player1, score_player2')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (saboError) {
    console.log('❌ Error:', saboError.message);
  } else {
    console.log('📊 Found', saboMatches?.length || 0, 'matches in tournament_matches');
    if (saboMatches && saboMatches.length > 0) {
      saboMatches.forEach((m, i) => {
        console.log(`  ${i+1}. ${m.player1_name || 'TBD'} vs ${m.player2_name || 'TBD'} (R${m.round_number}, ${m.status})`);
        if (m.score_player1 !== null || m.score_player2 !== null) {
          console.log(`      Score: ${m.score_player1}-${m.score_player2}`);
        }
      });
    }
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  const hasRegularData = regularMatches && regularMatches.length > 0;
  const hasSABOData = saboMatches && saboMatches.length > 0;
  
  if (hasRegularData && !hasSABOData) {
    console.log('❌ ISSUE FOUND: Data exists in tournament_matches but NOT in tournament_matches');
    console.log('💡 UI showing data from tournament_matches, but our function works on tournament_matches');
    console.log('🔧 SOLUTION: Either migrate data OR check if UI reads from wrong table');
    
    // Check if any match has Vietnamese names
    const vietnameseMatch = regularMatches.find(m => 
      (m.player1_name && (m.player1_name.includes('Vũ') || m.player1_name.includes('Võ'))) ||
      (m.player2_name && (m.player2_name.includes('Vũ') || m.player2_name.includes('Võ')))
    );
    
    if (vietnameseMatch) {
      console.log('🎯 FOUND VIETNAMESE MATCH in tournament_matches:');
      console.log('   Players:', vietnameseMatch.player1_name, 'vs', vietnameseMatch.player2_name);
      console.log('   Match ID:', vietnameseMatch.id);
      console.log('   Tournament ID:', vietnameseMatch.tournament_id);
    }
  } else if (hasSABOData) {
    console.log('✅ Data exists in tournament_matches');
    console.log('💡 Backend should work, might be frontend cache/real-time issue');
  } else {
    console.log('❌ NO DATA in either table');
    console.log('💡 Need to create tournament matches first');
  }
}

checkBothTables();
