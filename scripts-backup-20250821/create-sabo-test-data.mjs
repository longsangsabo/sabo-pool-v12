// Tạo test tournament và matches với đúng schema
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestData() {
  console.log('🏆 Tạo test tournament và matches...');
  
  try {
    // 1. Tạo tournament trong table 'tournaments'
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'SABO UI Score Test Tournament',
        description: 'Tournament để test UI score submission - Created by Assistant',
        tournament_type: 'double_elimination',
        game_format: 'single_game',
        max_participants: 8,
        current_participants: 4,
        entry_fee: 0,
        prize_pool: 0,
        status: 'active',
        management_status: 'ongoing',
        is_public: true,
        is_visible: true,
        created_by: '11111111-1111-1111-1111-111111111111', // dummy user
        tournament_start: new Date().toISOString(),
        registration_start: new Date().toISOString(),
        registration_end: new Date(Date.now() + 24*60*60*1000).toISOString()
      })
      .select()
      .single();
      
    if (tournamentError) {
      console.log('❌ Lỗi tạo tournament:', tournamentError);
      return;
    }
    
    console.log('✅ Tournament created:', tournament.name, '- ID:', tournament.id);
    
    // 2. Tạo matches trong tournament_matches
    console.log('\n📋 Tạo test matches...');
    
    const matches = [];
    
    // Match 1: Test Player 1 vs Test Player 2
    const match1 = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: tournament.id,
        player1_id: 'test-player-1',
        player2_id: 'test-player-2',
        player1_name: 'Alice',
        player2_name: 'Bob',
        round_number: 1,
        match_number: 1,
        status: 'pending',
        bracket_type: 'winner',
        score_player1: null,
        score_player2: null
      })
      .select()
      .single();
      
    // Match 2: Test Player 3 vs Test Player 4  
    const match2 = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: tournament.id,
        player1_id: 'test-player-3',
        player2_id: 'test-player-4',
        player1_name: 'Charlie',
        player2_name: 'Diana',
        round_number: 1,
        match_number: 2,
        status: 'pending',
        bracket_type: 'winner',
        score_player1: null,
        score_player2: null
      })
      .select()
      .single();
      
    // Match 3: Một match đã có score để test display
    const match3 = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: tournament.id,
        player1_id: 'test-player-5',
        player2_id: 'test-player-6',
        player1_name: 'Eva',
        player2_name: 'Frank',
        round_number: 1,
        match_number: 3,
        status: 'completed',
        bracket_type: 'winner',
        score_player1: 7,
        score_player2: 4,
        winner_id: 'test-player-5'
      })
      .select()
      .single();
    
    if (match1.error) {
      console.log('❌ Match 1 error:', match1.error);
    } else {
      matches.push(match1.data);
      console.log('✅ Match 1 created: Alice vs Bob');
    }
    
    if (match2.error) {
      console.log('❌ Match 2 error:', match2.error);
    } else {
      matches.push(match2.data);
      console.log('✅ Match 2 created: Charlie vs Diana');
    }
    
    if (match3.error) {
      console.log('❌ Match 3 error:', match3.error);
    } else {
      matches.push(match3.data);
      console.log('✅ Match 3 created: Eva vs Frank (completed)');
    }
    
    console.log(`\n📊 Created ${matches.length} matches successfully`);
    
    // 3. Test submit score function
    console.log('\n🎯 Test submit score function...');
    if (matches.length > 0) {
      const testMatch = matches.find(m => m.status === 'pending');
      if (testMatch) {
        console.log(`Testing with match: ${testMatch.player1_name} vs ${testMatch.player2_name}`);
        
        const { data: scoreResult, error: scoreError } = await supabase.rpc('submit_sabo_match_score', {
          p_match_id: testMatch.id,
          p_player1_score: 6,
          p_player2_score: 2,
          p_submitted_by: null
        });
        
        if (scoreError) {
          console.log('❌ Score submit error:', scoreError);
        } else {
          console.log('✅ Score submitted successfully:', scoreResult);
          
          // Verify database update
          const { data: updatedMatch } = await supabase
            .from('tournament_matches')
            .select('player1_name, player2_name, score_player1, score_player2, status, winner_id')
            .eq('id', testMatch.id)
            .single();
            
          console.log('📊 Verified match update:', updatedMatch);
        }
      }
    }
    
    console.log('\n🎯 TEST DATA READY!');
    console.log('='.repeat(60));
    console.log(`🏆 Tournament: "${tournament.name}"`);
    console.log(`📝 Tournament ID: ${tournament.id}`);
    console.log(`📊 Matches created: ${matches.length}`);
    console.log('\n🔧 TESTING STEPS:');
    console.log('1. Mở browser: http://localhost:8000/');
    console.log('2. Tìm tournament "SABO UI Score Test Tournament"');
    console.log('3. Click vào tournament để xem bracket/matches');
    console.log('4. Tìm matches với status "pending"');
    console.log('5. Click "Enter Score" trên match card');
    console.log('6. Nhập điểm và submit');
    console.log('7. Kiểm tra xem điểm có hiển thị ngay trên card không');
    console.log('\n💡 Expected behavior:');
    console.log('- Điểm phải hiển thị ngay sau khi submit');
    console.log('- Match status phải chuyển thành "completed"');
    console.log('- Winner phải được highlight');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

createTestData();
