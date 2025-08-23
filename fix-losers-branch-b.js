// =============================================
// FIX LOSERS BRANCH B - POPULATE WITH WINNERS ROUND 2 LOSERS
// =============================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixLosersBranchB() {
  try {
    console.log('🔧 Fixing Losers Branch B...');
    
    // 1. Get completed Winners Round 2 matches for both groups
    const { data: winnersR2Matches, error: winnersError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .like('bracket_type', '%_winners')
      .eq('round_number', 2)
      .eq('status', 'completed');

    if (winnersError) {
      console.error('❌ Error fetching Winners R2:', winnersError);
      return;
    }

    console.log(`📊 Found ${winnersR2Matches?.length || 0} completed Winners Round 2 matches`);

    if (!winnersR2Matches || winnersR2Matches.length === 0) {
      console.log('⚠️ No completed Winners Round 2 matches found');
      return;
    }

    // 2. For each completed Winners R2 match, populate corresponding Losers B match
    for (const winnersMatch of winnersR2Matches) {
      const groupId = winnersMatch.group_id;
      const loser_id = winnersMatch.player1_id === winnersMatch.winner_id 
        ? winnersMatch.player2_id 
        : winnersMatch.player1_id;

      console.log(`\n🎯 Processing Group ${groupId} Winners R2 Match ${winnersMatch.match_number}`);
      console.log(`   Winner: ${winnersMatch.winner_id}`);
      console.log(`   Loser: ${loser_id}`);

      // Find corresponding Losers B match to populate
      const { data: losersBMatches, error: losersBError } = await supabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
        .eq('group_id', groupId)
        .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
        .eq('round_number', 201) // First round of Losers B
        .order('match_number', { ascending: true });

      if (losersBError) {
        console.error(`❌ Error fetching Losers B matches for Group ${groupId}:`, losersBError);
        continue;
      }

      console.log(`   Found ${losersBMatches?.length || 0} Losers B matches for Group ${groupId}`);

      // Find an empty Losers B match to populate
      const emptyLosersBMatch = losersBMatches?.find(match => 
        !match.player1_id && !match.player2_id
      );

      if (emptyLosersBMatch) {
        // Decide which position to put the loser in
        const updateData = emptyLosersBMatch.player1_id ? 
          { player2_id: loser_id } : 
          { player1_id: loser_id };

        const { error: updateError } = await supabase
          .from('sabo32_matches')
          .update(updateData)
          .eq('id', emptyLosersBMatch.id);

        if (updateError) {
          console.error(`❌ Error updating Losers B match:`, updateError);
        } else {
          console.log(`✅ Added loser ${loser_id} to Losers B match ${emptyLosersBMatch.match_number}`);
        }
      } else {
        console.log(`⚠️ No empty Losers B matches found for Group ${groupId}`);
      }
    }

    console.log('\n🎉 Losers Branch B population completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Execute the fix
fixLosersBranchB();
