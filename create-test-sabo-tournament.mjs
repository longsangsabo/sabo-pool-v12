// Tạo SABO tournament test với matches
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestSABOTournament() {
  console.log('🏆 Tạo SABO tournament test...');
  
  try {
    // 1. Tạo tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'SABO Test Tournament',
        description: 'Test tournament for SABO score submission',
        tournament_type: 'sabo_double_elimination',
        status: 'active',
        max_participants: 16,
        entry_fee: 0,
        start_date: new Date().toISOString(),
        registration_deadline: new Date(Date.now() + 24*60*60*1000).toISOString(),
        created_by: '00000000-0000-0000-0000-000000000000' // placeholder
      })
      .select()
      .single();
      
    if (tournamentError) {
      console.log('❌ Lỗi tạo tournament:', tournamentError.message);
      return;
    }
    
    console.log('✅ Tournament created:', tournament.id);
    
    // 2. Tạo một vài test matches
    const testMatches = [
      {
        tournament_id: tournament.id,
        bracket_type: 'winner',
        round_number: 1,
        match_number: 1,
        sabo_match_id: 'WR1M1',
        player1_id: '11111111-1111-1111-1111-111111111111',
        player2_id: '22222222-2222-2222-2222-222222222222',
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
        player1_id: '33333333-3333-3333-3333-333333333333',
        player2_id: '44444444-4444-4444-4444-444444444444',
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
    
    // 3. Test function với match đầu tiên
    const testMatch = matches[0];
    console.log('\n🧪 Test score submission...');
    
    const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: 7,
      p_player2_score: 4,
      p_submitted_by: null
    });
    
    if (funcError) {
      console.log('❌ Function error:', funcError.message);
    } else {
      console.log('✅ Function result:', result);
      
      // Kiểm tra match đã update chưa
      const { data: updatedMatch } = await supabase
        .from('sabo_tournament_matches')
        .select('score_player1, score_player2, status, winner_id')
        .eq('id', testMatch.id)
        .single();
        
      console.log('📊 Updated match:', updatedMatch);
    }
    
    console.log('\n🎯 HƯỚNG DẪN TEST:');
    console.log('='.repeat(50));
    console.log('1. Vào browser: http://localhost:8000/');
    console.log(`2. Tìm tournament: "${tournament.name}"`);
    console.log('3. Click vào tournament để xem bracket');
    console.log('4. Tìm match với status "Ready" hoặc "Pending"');
    console.log('5. Click "Enter Score" và thử nhập điểm');
    console.log('6. Điểm số sẽ hiển thị ngay trên card');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

createTestSABOTournament().catch(console.error);
