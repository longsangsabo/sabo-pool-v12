import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAfterRename() {
  console.log('🔍 Checking after table rename...');
  
  try {
    // 1. Check if tournament_matches table exists now
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(5);
      
    if (matchesError) {
      console.error('❌ Error accessing tournament_matches:', matchesError);
    } else {
      console.log('✅ tournament_matches table exists!');
      console.log('📊 Sample records:', matches?.length || 0);
      if (matches && matches.length > 0) {
        console.log('📋 Sample data:', matches[0]);
        console.log('🔑 Columns:', Object.keys(matches[0]));
      }
    }
    
    // 2. Check if old sabo_tournament_matches still exists
    const { data: saboMatches, error: saboError } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .limit(1);
      
    if (saboError) {
      console.log('✅ sabo_tournament_matches no longer exists (expected)');
    } else {
      console.log('⚠️ sabo_tournament_matches still exists');
    }
    
    // 3. Test one of the SABO functions
    console.log('\n🧪 Testing SABO function...');
    const { data: functionResult, error: functionError } = await supabase
      .rpc('process_winners_round2_completion', {
        p_tournament_id: 'c41300b2-dff6-4db0-9e0b-b5f1b5b5b5b5'
      });
      
    if (functionError) {
      console.error('❌ SABO function error:', functionError);
    } else {
      console.log('✅ SABO function result:', functionResult);
    }
    
    // 4. Check tournament structure after function call
    console.log('\n📊 Checking tournament structure after function call...');
    const { data: allMatches, error: allError } = await supabase
      .from('tournament_matches')
      .select('round_number, match_number, player1_id, player2_id, status, bracket_type')
      .eq('tournament_id', 'c41300b2-dff6-4db0-9e0b-b5f1b5b5b5b5')
      .order('round_number')
      .order('match_number');
      
    if (allError) {
      console.error('❌ Error checking matches:', allError);
    } else {
      console.log('🎯 Tournament structure:');
      
      // Group by round
      const byRound = {};
      allMatches?.forEach(match => {
        const key = `Round ${match.round_number} (${match.bracket_type})`;
        if (!byRound[key]) byRound[key] = [];
        byRound[key].push({
          match: match.match_number,
          p1: match.player1_id ? 'Player' : 'TBD',
          p2: match.player2_id ? 'Player' : 'TBD',
          status: match.status
        });
      });
      
      Object.entries(byRound).forEach(([round, matches]) => {
        console.log(`\n${round}:`);
        matches.forEach(match => {
          console.log(`  Match ${match.match}: ${match.p1} vs ${match.p2} (${match.status})`);
        });
      });
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

checkAfterRename();
