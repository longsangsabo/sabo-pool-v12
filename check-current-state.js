// =============================================
// CHECK CURRENT STATE AFTER FIX
// =============================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentState() {
  try {
    console.log('🔍 Checking current state after fix...\n');
    
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';

    // Check Losers B for both groups
    for (const groupId of ['A', 'B']) {
      console.log(`📊 Group ${groupId} - Losers Branch B:`);
      
      const { data: losersBMatches, error } = await supabase
        .from('sabo32_matches')
        .select('id, match_number, player1_id, player2_id, status')
        .eq('tournament_id', tournamentId)
        .eq('group_id', groupId)
        .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
        .order('match_number', { ascending: true });

      if (error) {
        console.error(`❌ Error for Group ${groupId}:`, error);
        continue;
      }

      losersBMatches?.forEach(match => {
        const p1 = match.player1_id ? '✅ Has Player' : '❌ Empty';
        const p2 = match.player2_id ? '✅ Has Player' : '❌ Empty';
        console.log(`   Match ${match.match_number}: Player1: ${p1}, Player2: ${p2}, Status: ${match.status}`);
      });
      
      console.log('');
    }

    // Also check Winners Round 2 completion status
    console.log('🏆 Winners Round 2 Status:');
    for (const groupId of ['A', 'B']) {
      const { data: winnersR2, error } = await supabase
        .from('sabo32_matches')
        .select('match_number, status, winner_id')
        .eq('tournament_id', tournamentId)
        .eq('group_id', groupId)
        .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
        .eq('round_number', 2)
        .order('match_number', { ascending: true });

      if (error) {
        console.error(`❌ Error for Group ${groupId}:`, error);
        continue;
      }

      console.log(`\n   Group ${groupId} Winners Round 2:`);
      winnersR2?.forEach(match => {
        const status = match.status === 'completed' ? '✅ Completed' : '⚠️ Pending';
        console.log(`     Match ${match.match_number}: ${status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCurrentState();
