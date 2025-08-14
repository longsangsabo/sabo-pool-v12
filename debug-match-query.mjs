import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMatchData() {
  console.log('🔍 Checking tournament matches...');
  
  // Get tournament ID
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('name', 'test 1')
    .limit(5);
    
  console.log('Tournaments found:', tournaments);
  
  if (tournaments && tournaments.length > 0) {
    const tournamentId = tournaments[0].id;
    console.log('Using tournament ID:', tournamentId);
    
    // Check matches
    const { data: matches, error } = await supabase
      .from('sabo_tournament_matches')
      .select('id, player1_id, player2_id, status, round_number, match_number')
      .eq('tournament_id', tournamentId)
      .order('round_number, match_number');
      
    console.log('Match query error:', error);
    console.log('Matches found:', matches?.length || 0);
    console.log('First few matches:', matches?.slice(0, 3));
    
    // Test single match query
    if (matches && matches.length > 0) {
      const testMatchId = matches[0].id;
      console.log('Testing single match query with ID:', testMatchId);
      
      const { data: singleMatch, error: singleError } = await supabase
        .from('sabo_tournament_matches')
        .select('player1_id, player2_id')
        .eq('id', testMatchId);
        
      console.log('Single match error:', singleError);
      console.log('Single match result:', singleMatch);
      console.log('Result length:', singleMatch?.length);
      
      // Test with .single()
      const { data: singleMatchWithSingle, error: singleWithSingleError } = await supabase
        .from('sabo_tournament_matches')
        .select('player1_id, player2_id')
        .eq('id', testMatchId)
        .single();
        
      console.log('Single match with .single() error:', singleWithSingleError);
      console.log('Single match with .single() result:', singleMatchWithSingle);
    }
  }
}

checkMatchData().catch(console.error);
