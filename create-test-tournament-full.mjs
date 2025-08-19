// Tạo test tournament với matches để debug UI
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestTournamentWithMatches() {
  console.log('🏆 Tạo test tournament với matches...');
  
  try {
    // 1. Tạo tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('sabo_tournaments')
      .insert({
        name: 'SABO UI Test Tournament',
        description: 'Tournament để test UI score submission',
        status: 'active',
        max_participants: 8,
        entry_fee: 0,
        prize_pool: 0,
        tournament_type: 'double_elimination',
        created_by: '11111111-1111-1111-1111-111111111111' // dummy user
      })
      .select()
      .single();
      
    if (tournamentError) {
      console.log('❌ Lỗi tạo tournament:', tournamentError.message);
      return;
    }
    
    console.log('✅ Tournament created:', tournament.id);
    
    // 2. Tạo 4 participants
    const participants = [];
    for (let i = 1; i <= 4; i++) {
      const { data: participant, error: partError } = await supabase
        .from('sabo_tournament_participants')
        .insert({
          tournament_id: tournament.id,
          user_id: `user-${i}`,
          display_name: `Player ${i}`,
          skill_level: 500 + i * 100,
          confirmed: true
        })
        .select()
        .single();
        
      if (partError) {
        console.log(`❌ Lỗi tạo participant ${i}:`, partError.message);
        continue;
      }
      
      participants.push(participant);
    }
    
    console.log(`✅ Created ${participants.length} participants`);
    
    // 3. Tạo matches cho round 1
    const matches = [];
    
    // Match 1: Player 1 vs Player 2
    const match1 = await supabase
      .from('sabo_tournament_matches')
      .insert({
        tournament_id: tournament.id,
        player1_id: participants[0].user_id,
        player2_id: participants[1].user_id,
        round_number: 1,
        match_number: 1,
        status: 'pending',
        bracket_type: 'winner'
      })
      .select()
      .single();
      
    // Match 2: Player 3 vs Player 4  
    const match2 = await supabase
      .from('sabo_tournament_matches')
      .insert({
        tournament_id: tournament.id,
        player1_id: participants[2].user_id,
        player2_id: participants[3].user_id,
        round_number: 1,
        match_number: 2,
        status: 'pending',
        bracket_type: 'winner'
      })
      .select()
      .single();
    
    if (match1.error || match2.error) {
      console.log('❌ Lỗi tạo matches:', match1.error || match2.error);
      return;
    }
    
    matches.push(match1.data, match2.data);
    console.log('✅ Created 2 matches for testing');
    
    // 4. Test submit score cho match đầu tiên
    console.log('\n🎯 Test submit score...');
    const testMatch = matches[0];
    
    const { data: scoreResult, error: scoreError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: 5,
      p_player2_score: 3,
      p_submitted_by: null
    });
    
    if (scoreError) {
      console.log('❌ Score submit error:', scoreError.message);
    } else {
      console.log('✅ Score submitted successfully:', scoreResult);
      
      // Verify update
      const { data: updatedMatch } = await supabase
        .from('sabo_tournament_matches')
        .select('*')
        .eq('id', testMatch.id)
        .single();
        
      console.log('📊 Updated match data:', {
        id: updatedMatch.id,
        score_player1: updatedMatch.score_player1,
        score_player2: updatedMatch.score_player2,
        status: updatedMatch.status,
        winner_id: updatedMatch.winner_id
      });
    }
    
    console.log('\n🎯 TOURNAMENT READY FOR TESTING:');
    console.log('='.repeat(50));
    console.log(`Tournament ID: ${tournament.id}`);
    console.log(`Tournament Name: ${tournament.name}`);
    console.log(`Matches created: ${matches.length}`);
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Mở browser tại http://localhost:8000/');
    console.log('2. Tìm tournament "SABO UI Test Tournament"');
    console.log('3. Click vào tournament để xem matches');
    console.log('4. Test "Enter Score" trên match cards');
    console.log('5. Kiểm tra xem điểm có hiển thị trên UI không');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createTestTournamentWithMatches();
