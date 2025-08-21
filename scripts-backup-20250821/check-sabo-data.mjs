// Quick check for SABO tournaments and matches
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSABOData() {
  console.log('🔍 Checking SABO tournament data...');
  
  // Check tournaments
  const { data: tournaments, error: tournamentError } = await supabase
    .from('tournaments')
    .select('id, name, status, tournament_type')
    .ilike('tournament_type', '%sabo%')
    .limit(5);
    
  if (tournamentError) {
    console.log('❌ Error checking tournaments:', tournamentError.message);
  } else {
    console.log('🏆 SABO tournaments found:', tournaments?.length || 0);
    tournaments?.forEach(t => {
      console.log(`  - ${t.name} (${t.status}) - ID: ${t.id}`);
    });
  }
  
  // Check SABO matches
  const { data: matches, error: matchError } = await supabase
    .from('sabo_tournament_matches')
    .select('id, tournament_id, status, round_number, match_number, score_player1, score_player2')
    .limit(10);
    
  if (matchError) {
    console.log('❌ Error checking SABO matches:', matchError.message);
  } else {
    console.log('\n⚽ SABO matches found:', matches?.length || 0);
    if (matches?.length > 0) {
      console.log('Sample matches:');
      matches.slice(0, 5).forEach(m => {
        console.log(`  - R${m.round_number}M${m.match_number}: ${m.status} (${m.score_player1 || 0}-${m.score_player2 || 0})`);
      });
    }
  }
  
  console.log('\n💡 NEXT STEPS:');
  if (tournaments?.length > 0 && matches?.length > 0) {
    console.log('✅ SABO data exists - you can test "Enter Score" in browser');
    console.log('1. Go to tournament page');
    console.log('2. Find a match with "Ready" status');
    console.log('3. Click "Enter Score"');
    console.log('4. Submit scores and check if they appear on card');
  } else {
    console.log('⚠️ No SABO data found - create a SABO tournament first');
  }
}

checkSABOData().catch(console.error);
