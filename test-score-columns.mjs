import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 Testing score column existence...');

async function testScoreColumns() {
  try {
    const { data: existingMatch } = await supabase
      .from('tournament_matches')
      .select('id')
      .limit(1);
      
    if (existingMatch && existingMatch[0]) {
      // Try to update with score fields to see if they exist
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({ 
          score_player1: 0,
          score_player2: 0 
        })
        .eq('id', existingMatch[0].id);
        
      if (!updateError) {
        console.log('✅ score_player1/score_player2 columns exist and can be updated!');
        console.log('🎯 We can uncomment score columns in SABOMatchHandler');
        return true;
      } else {
        console.log('❌ score_player1/score_player2 columns missing:', updateError.message);
        console.log('📝 Need to add columns to database first');
        return false;
      }
    } else {
      console.log('⚠️ No existing matches found to test with');
      return false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

testScoreColumns();
