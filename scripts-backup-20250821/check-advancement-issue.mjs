import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdvancementIssue() {
  console.log('🔍 Checking SABO tournament advancement issue...');
  
  try {
    // Get tournament ID from completed Round 1 matches
    const { data: round1Matches, error: r1Error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('round_number', 1)
      .eq('status', 'completed')
      .limit(1);
      
    if (r1Error || !round1Matches || round1Matches.length === 0) {
      console.error('❌ No completed Round 1 matches found:', r1Error);
      return;
    }
    
    const tournamentId = round1Matches[0].tournament_id;
    console.log('🎯 Found tournament:', tournamentId);
    
    // Check Round 2 matches
    const { data: round2Matches, error: r2Error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 2)
      .order('match_number');
      
    if (r2Error) {
      console.error('❌ Error checking Round 2:', r2Error);
      return;
    }
    
    console.log('\n📊 Round 2 Status:');
    round2Matches?.forEach((match, index) => {
      console.log(`Match ${index + 1}:`, {
        id: match.id,
        player1_id: match.player1_id ? 'HAS_PLAYER' : 'NULL',
        player2_id: match.player2_id ? 'HAS_PLAYER' : 'NULL',
        status: match.status
      });
    });
    
    // Check Losers Branch A (Round 101)
    const { data: losersA, error: laError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 101)
      .order('match_number');
      
    if (laError) {
      console.error('❌ Error checking Losers A:', laError);
      return;
    }
    
    console.log('\n📊 Losers Branch A (Round 101) Status:');
    losersA?.forEach((match, index) => {
      console.log(`Match ${index + 1}:`, {
        id: match.id,
        player1_id: match.player1_id ? 'HAS_PLAYER' : 'NULL',
        player2_id: match.player2_id ? 'HAS_PLAYER' : 'NULL',
        status: match.status
      });
    });
    
    // Count completed R1 matches
    const { data: allR1, error: allR1Error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 1);
      
    if (!allR1Error && allR1) {
      const completedR1 = allR1.filter(m => m.status === 'completed').length;
      const totalR1 = allR1.length;
      
      console.log(`\n🎮 Round 1 Progress: ${completedR1}/${totalR1} completed`);
      
      if (completedR1 === totalR1) {
        console.log('✅ All Round 1 matches completed - advancement should have happened!');
      } else {
        console.log('⏳ Round 1 not fully completed yet');
      }
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

checkAdvancementIssue();
