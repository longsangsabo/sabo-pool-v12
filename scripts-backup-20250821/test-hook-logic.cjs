// Test hook với service key
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testHookLogic() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🎯 Testing hook logic for tournament:', tournamentId);
  
  try {
    // Fetch matches like in hook
    const result = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });
      
    const matchesData = result.data;
    const matchesError = result.error;
    
    console.log('📡 Query result:', {
      data: matchesData?.length || 0,
      error: matchesError?.message || 'none'
    });
    
    if (matchesData && matchesData.length > 0) {
      console.log('🔍 Sample match:', matchesData[0]);
      
      // Test bracket type mapping
      const mapBracketType = (dbType) => {
        switch (dbType) {
          case 'winner': return 'winners';
          case 'loser': return 'losers';
          case 'semifinal': return 'semifinals';
          case 'final': return 'finals';
          default: return 'winners';
        }
      };
      
      // Process like in hook
      const processedMatches = matchesData.map((match) => {
        return {
          id: match.id,
          tournament_id: match.tournament_id,
          round_number: match.round_number,
          match_number: match.match_number,
          player1_id: match.player1_id,
          player2_id: match.player2_id,
          winner_id: match.winner_id,
          status: match.status,
          bracket_type: mapBracketType(match.bracket_type),
          branch_type: match.branch_type,
          player1_score: match.score_player1,
          player2_score: match.score_player2,
        };
      });
      
      console.log('✅ Processed matches:', processedMatches.length);
      console.log('🔍 Sample processed match:', processedMatches[0]);
      
      // Group by bracket type
      const grouped = processedMatches.reduce((acc, match) => {
        acc[match.bracket_type] = (acc[match.bracket_type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Matches by bracket type:', grouped);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testHookLogic();
