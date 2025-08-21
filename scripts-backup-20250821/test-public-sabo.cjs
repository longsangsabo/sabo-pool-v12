// Test public RPC function để get SABO matches
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ quiet: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPublicSABOAccess() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🧪 Testing public SABO access...');
  
  try {
    // Test if there's a public function to get matches
    console.log('1️⃣ Testing public function...');
    
    const { data: funcResult, error: funcError } = await supabase.rpc(
      'get_tournament_sabo_matches', 
      { p_tournament_id: tournamentId }
    );
    
    if (funcError) {
      console.log('❌ Public function not available:', funcError.message);
    } else {
      console.log('✅ Public function works:', funcResult?.length || 0, 'matches');
      return;
    }
    
    // If no public function, let's create mock data for display
    console.log('2️⃣ Creating mock SABO structure...');
    
    const mockMatches = [
      // Winners Round 1
      { sabo_match_id: 'WR1M1', bracket_type: 'winners', round_number: 1, match_number: 1 },
      { sabo_match_id: 'WR1M2', bracket_type: 'winners', round_number: 1, match_number: 2 },
      { sabo_match_id: 'WR1M3', bracket_type: 'winners', round_number: 1, match_number: 3 },
      { sabo_match_id: 'WR1M4', bracket_type: 'winners', round_number: 1, match_number: 4 },
      { sabo_match_id: 'WR1M5', bracket_type: 'winners', round_number: 1, match_number: 5 },
      { sabo_match_id: 'WR1M6', bracket_type: 'winners', round_number: 1, match_number: 6 },
      { sabo_match_id: 'WR1M7', bracket_type: 'winners', round_number: 1, match_number: 7 },
      { sabo_match_id: 'WR1M8', bracket_type: 'winners', round_number: 1, match_number: 8 },
      
      // Winners Round 2
      { sabo_match_id: 'WR2M1', bracket_type: 'winners', round_number: 2, match_number: 1 },
      { sabo_match_id: 'WR2M2', bracket_type: 'winners', round_number: 2, match_number: 2 },
      { sabo_match_id: 'WR2M3', bracket_type: 'winners', round_number: 2, match_number: 3 },
      { sabo_match_id: 'WR2M4', bracket_type: 'winners', round_number: 2, match_number: 4 },
      
      // Winners Round 3
      { sabo_match_id: 'WR3M1', bracket_type: 'winners', round_number: 3, match_number: 1 },
      { sabo_match_id: 'WR3M2', bracket_type: 'winners', round_number: 3, match_number: 2 },
      
      // Losers Branch A
      { sabo_match_id: 'LAR1M1', bracket_type: 'losers', branch_type: 'A', round_number: 1, match_number: 1 },
      { sabo_match_id: 'LAR1M2', bracket_type: 'losers', branch_type: 'A', round_number: 1, match_number: 2 },
      { sabo_match_id: 'LAR2M1', bracket_type: 'losers', branch_type: 'A', round_number: 2, match_number: 1 },
      { sabo_match_id: 'LAR2M2', bracket_type: 'losers', branch_type: 'A', round_number: 2, match_number: 2 },
      { sabo_match_id: 'LAR3M1', bracket_type: 'losers', branch_type: 'A', round_number: 3, match_number: 1 },
      
      // Losers Branch B
      { sabo_match_id: 'LBR1M1', bracket_type: 'losers', branch_type: 'B', round_number: 1, match_number: 1 },
      { sabo_match_id: 'LBR1M2', bracket_type: 'losers', branch_type: 'B', round_number: 1, match_number: 2 },
      { sabo_match_id: 'LBR2M1', bracket_type: 'losers', branch_type: 'B', round_number: 2, match_number: 1 },
      { sabo_match_id: 'LBR2M2', bracket_type: 'losers', branch_type: 'B', round_number: 2, match_number: 2 },
      { sabo_match_id: 'LBR3M1', bracket_type: 'losers', branch_type: 'B', round_number: 3, match_number: 1 },
      
      // Semifinals & Finals
      { sabo_match_id: 'SEMI1', bracket_type: 'semifinals', round_number: 1, match_number: 1 },
      { sabo_match_id: 'FINAL', bracket_type: 'finals', round_number: 1, match_number: 1 }
    ];
    
    console.log('✅ Mock SABO structure created:', mockMatches.length, 'matches');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testPublicSABOAccess();
