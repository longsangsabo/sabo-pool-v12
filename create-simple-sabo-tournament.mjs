// Tạo SABO tournament đơn giản 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSimpleSABOTournament() {
  console.log('🏆 Tạo SABO tournament đơn giản...');
  
  try {
    // 1. Tạo tournament với cấu trúc đúng
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'SABO Test Tournament',
        description: 'Test tournament for SABO score submission',
        tournament_type: 'double_elimination', // Sử dụng giá trị có sẵn
        game_format: '9_ball',
        tier_level: 1,
        max_participants: 16,
        current_participants: 0,
        tournament_start: new Date(Date.now() + 24*60*60*1000).toISOString(),
        tournament_end: new Date(Date.now() + 48*60*60*1000).toISOString(),
        registration_start: new Date().toISOString(),
        registration_end: new Date(Date.now() + 12*60*60*1000).toISOString(),
        club_id: 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa', // Sử dụng club_id có sẵn
        venue_address: 'Test Venue',
        entry_fee: 0,
        prize_pool: 0,
        status: 'registration_open',
        management_status: 'draft',
        allow_all_ranks: true,
        requires_approval: false,
        is_public: true,
        has_third_place_match: false,
        created_by: '18f49e79-f402-46d1-90be-889006e9761c', // Sử dụng user có sẵn
        tier: 'I',
        elo_multiplier: 1,
        is_visible: true
      })
      .select()
      .single();
      
    if (tournamentError) {
      console.log('❌ Lỗi tạo tournament:', tournamentError.message);
      return;
    }
    
    console.log('✅ Tournament created:', tournament.id);
    
    // 2. Tạo test matches với player IDs thật
    const testMatches = [
      {
        tournament_id: tournament.id,
        bracket_type: 'winner',
        round_number: 1,
        match_number: 1,
        sabo_match_id: 'WR1M1',
        player1_id: 'c6eaa405-cfda-4169-be23-dfdaf025820c', // Từ match có sẵn
        player2_id: '1b20b730-51f7-4a58-9d14-ca168a51be99', // Từ match có sẵn
        status: 'pending',
        score_player1: 0,
        score_player2: 0
      },
      {
        tournament_id: tournament.id,
        bracket_type: 'winner',
        round_number: 1,
        match_number: 2,
        sabo_match_id: 'WR1M2',
        player1_id: 'c6eaa405-cfda-4169-be23-dfdaf025820c',
        player2_id: '1b20b730-51f7-4a58-9d14-ca168a51be99',
        status: 'pending',
        score_player1: 0,
        score_player2: 0
      }
    ];
    
    const { data: matches, error: matchError } = await supabase
      .from('sabo_tournament_matches')
      .insert(testMatches)
      .select();
      
    if (matchError) {
      console.log('❌ Lỗi tạo matches:', matchError.message);
      return;
    }
    
    console.log(`✅ Tạo ${matches.length} test matches`);
    
    // 3. Test function
    const testMatch = matches[0];
    console.log('\n🧪 Test score submission function...');
    
    const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: 6,
      p_player2_score: 3,
      p_submitted_by: null
    });
    
    if (funcError) {
      console.log('❌ Function error:', funcError.message);
      
      if (funcError.message.includes('Match not found')) {
        console.log('\n💡 VẤN ĐỀ: Function chưa được fix!');
        console.log('🔧 CẦN LÀM:');
        console.log('1. Vào Supabase Dashboard → SQL Editor');
        console.log('2. Chạy SQL trong file fix-sabo-function-manual.sql');
        console.log('3. Sau đó test lại');
      }
    } else {
      console.log('✅ Function result:', result);
      
      if (result.success) {
        console.log('\n🎉 SUCCESS! Function hoạt động tốt');
        
        // Kiểm tra match đã update
        const { data: updatedMatch } = await supabase
          .from('sabo_tournament_matches')
          .select('score_player1, score_player2, status, winner_id')
          .eq('id', testMatch.id)
          .single();
          
        console.log('📊 Match sau khi update:', updatedMatch);
      }
    }
    
    console.log('\n🎯 HƯỚNG DẪN TEST TRONG UI:');
    console.log('='.repeat(50));
    console.log('1. Mở browser: http://localhost:8000/');
    console.log(`2. Tìm tournament: "${tournament.name}"`);
    console.log('3. Click vào tournament');
    console.log('4. Tìm match với "Enter Score" button');
    console.log('5. Click và thử nhập điểm số');
    console.log('6. Submit và kiểm tra điểm hiển thị trên card');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

createSimpleSABOTournament().catch(console.error);
