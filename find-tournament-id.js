// =============================================
// FIND REAL TOURNAMENT ID
// =============================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findTournamentId() {
  try {
    console.log('🔍 Finding tournament ID...');
    
    // Get all unique tournament IDs
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('tournament_id')
      .limit(5);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    const uniqueIds = [...new Set(matches?.map(m => m.tournament_id))];
    console.log('📊 Found tournament IDs:', uniqueIds);

    // Get match count for each tournament
    for (const tournamentId of uniqueIds) {
      const { data: tournamentMatches, error: countError } = await supabase
        .from('sabo32_matches')
        .select('id, status, group_id, bracket_type')
        .eq('tournament_id', tournamentId);

      if (!countError) {
        console.log(`\n🎯 Tournament: ${tournamentId}`);
        console.log(`   Total matches: ${tournamentMatches?.length || 0}`);
        
        const groupA = tournamentMatches?.filter(m => m.group_id === 'A').length || 0;
        const groupB = tournamentMatches?.filter(m => m.group_id === 'B').length || 0;
        const cross = tournamentMatches?.filter(m => m.group_id === null).length || 0;
        
        console.log(`   Group A: ${groupA}, Group B: ${groupB}, Cross: ${cross}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findTournamentId();
