import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createFullBracketMatches() {
  console.log('🏆 Creating full SABO bracket matches...');
  
  // Tournament ID
  const tournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  console.log(`✅ Using tournament: ${tournamentId}`);
  
  // Get some player IDs for realistic matches
  const { data: players } = await supabase
    .from('tournament_registrations')
    .select('user_id')
    .eq('tournament_id', tournamentId)
    .limit(16);
    
  console.log(`📋 Found ${players?.length || 0} registered players`);
  
  // Sample player names for demo
  const samplePlayers = [
    'Phạm Minh Long', 'Võ Hương Cường', 'Nguyễn Văn A', 'Trần Thị B',
    'Lê Văn C', 'Hoàng Thị D', 'Phan Văn E', 'Đỗ Thị F',
    'Bùi Văn G', 'Vũ Thị H', 'Đinh Văn I', 'Lý Thị J',
    'Tô Văn K', 'Đặng Thị L', 'Cao Văn M', 'Hồ Thị N'
  ];
  
  const matches = [
    // WINNERS BRACKET - Round 1 (16→8 players, 8 matches)
    { round: 1, match: 1, bracket: 'winners', p1: samplePlayers[0], p2: samplePlayers[1] },
    { round: 1, match: 2, bracket: 'winners', p1: samplePlayers[2], p2: samplePlayers[3] },
    { round: 1, match: 3, bracket: 'winners', p1: samplePlayers[4], p2: samplePlayers[5] },
    { round: 1, match: 4, bracket: 'winners', p1: samplePlayers[6], p2: samplePlayers[7] },
    { round: 1, match: 5, bracket: 'winners', p1: samplePlayers[8], p2: samplePlayers[9] },
    { round: 1, match: 6, bracket: 'winners', p1: samplePlayers[10], p2: samplePlayers[11] },
    { round: 1, match: 7, bracket: 'winners', p1: samplePlayers[12], p2: samplePlayers[13] },
    { round: 1, match: 8, bracket: 'winners', p1: samplePlayers[14], p2: samplePlayers[15] },
    
    // WINNERS BRACKET - Round 2 (8→4 players, 4 matches)
    { round: 2, match: 9, bracket: 'winners', p1: 'Winner M1', p2: 'Winner M2' },
    { round: 2, match: 10, bracket: 'winners', p1: 'Winner M3', p2: 'Winner M4' },
    { round: 2, match: 11, bracket: 'winners', p1: 'Winner M5', p2: 'Winner M6' },
    { round: 2, match: 12, bracket: 'winners', p1: 'Winner M7', p2: 'Winner M8' },
    
    // WINNERS BRACKET - Round 3 (4→2 players, 2 matches - Winners Semifinals)
    { round: 3, match: 13, bracket: 'winners', p1: 'Winner M9', p2: 'Winner M10' },
    { round: 3, match: 14, bracket: 'winners', p1: 'Winner M11', p2: 'Winner M12' },
    
    // LOSERS BRACKET - Round 1 (8 players from WB R1 losses, 4 matches)
    { round: 101, match: 15, bracket: 'losers', p1: 'Loser M1', p2: 'Loser M2' },
    { round: 101, match: 16, bracket: 'losers', p1: 'Loser M3', p2: 'Loser M4' },
    { round: 101, match: 17, bracket: 'losers', p1: 'Loser M5', p2: 'Loser M6' },
    { round: 101, match: 18, bracket: 'losers', p1: 'Loser M7', p2: 'Loser M8' },
    
    // LOSERS BRACKET - Round 2 (4 winners from LB R1 + 4 losers from WB R2, 4 matches)
    { round: 102, match: 19, bracket: 'losers', p1: 'Winner M15', p2: 'Loser M9' },
    { round: 102, match: 20, bracket: 'losers', p1: 'Winner M16', p2: 'Loser M10' },
    { round: 102, match: 21, bracket: 'losers', p1: 'Winner M17', p2: 'Loser M11' },
    { round: 102, match: 22, bracket: 'losers', p1: 'Winner M18', p2: 'Loser M12' },
    
    // LOSERS BRACKET - Round 3 (4→2 players, 2 matches)
    { round: 103, match: 23, bracket: 'losers', p1: 'Winner M19', p2: 'Winner M20' },
    { round: 103, match: 24, bracket: 'losers', p1: 'Winner M21', p2: 'Winner M22' },
    
    // LOSERS BRACKET - Semifinals (2→1 player, 1 match)
    { round: 201, match: 25, bracket: 'losers', p1: 'Winner M23', p2: 'Winner M24' },
    
    // LOSERS BRACKET - Finals (LB Winner vs 1 WB Finalist loser, 1 match)
    { round: 202, match: 26, bracket: 'losers', p1: 'Winner M25', p2: 'Loser WB Final' },
    
    // GRAND FINALS - Winners Bracket Champion vs Losers Bracket Champion
    { round: 300, match: 27, bracket: 'final', p1: 'WB Champion', p2: 'LB Champion' },
  ];
  
  console.log(`🎯 Creating ${matches.length} matches for full double elimination bracket...`);
  
  // Delete existing matches first
  await supabase
    .from('tournament_matches')
    .delete()
    .eq('tournament_id', tournamentId);
    
  // Insert all matches
  for (const [index, match] of matches.entries()) {
    const matchData = {
      tournament_id: tournamentId,
      round_number: match.round,
      match_number: match.match,
      bracket_type: match.bracket,
      player1_id: null, // Will be set later when players are assigned
      player2_id: null, // Will be set later when players are assigned
      status: index < 8 ? 'ready' : 'pending', // First 8 matches ready, rest pending
      score_player1: null,
      score_player2: null,
      winner_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('tournament_matches')
      .insert(matchData);
      
    if (error) {
      console.error(`❌ Error creating match ${match.match}:`, error);
    } else {
      console.log(`✅ Created Match ${match.match}: Round ${match.round} (${match.bracket})`);
    }
  }
  
  console.log('🌐 Now refresh UI to see full bracket!');
  console.log('📋 Tournament: Winner Take All 9 Ball (RANK IK)');
  console.log('🎯 Check "📊 Sơ đồ giải đấu" tab');
  
  // Verify matches were created
  const { data: verifyMatches } = await supabase
    .from('tournament_matches')
    .select('round_number, match_number, bracket_type')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  console.log(`\n✅ Verification: ${verifyMatches?.length} matches created`);
  
  // Group by bracket
  const winnerMatches = verifyMatches?.filter(m => m.bracket_type === 'winners') || [];
  const loserMatches = verifyMatches?.filter(m => m.bracket_type === 'losers') || [];
  const grandFinalMatches = verifyMatches?.filter(m => m.bracket_type === 'grand_final') || [];
  
  console.log(`- Winners Bracket: ${winnerMatches.length} matches`);
  console.log(`- Losers Bracket: ${loserMatches.length} matches`);  
  console.log(`- Grand Final: ${grandFinalMatches.length} matches`);
}

createFullBracketMatches().catch(console.error);
