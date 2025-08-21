// Test function sau khi sửa lỗi column
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFixedFunction() {
  console.log('🧪 Test function sau khi fix...');
  
  // Tìm test match
  const { data: matches, error: matchError } = await supabase
    .from('sabo_tournament_matches')
    .select('*')
    .limit(1);
    
  if (matchError || !matches?.length) {
    console.log('❌ Không tìm thấy test matches');
    return;
  }
  
  const testMatch = matches[0];
  console.log('📍 Test với match:', testMatch.id);
  
  // Test function
  const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
    p_match_id: testMatch.id,
    p_player1_score: 8,
    p_player2_score: 2,
    p_submitted_by: null
  });
  
  if (funcError) {
    console.log('❌ Function error:', funcError.message);
    
    if (funcError.message.includes('score_input_by')) {
      console.log('\n🔧 CẦN SỬA FUNCTION:');
      console.log('1. Vào Supabase Dashboard → SQL Editor');
      console.log('2. Chạy SQL đã fix trong fix-sabo-function-manual.sql');
      console.log('3. (Đã bỏ column score_input_by)');
    }
  } else {
    console.log('✅ Function result:', result);
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! Function hoạt động!');
      
      // Kiểm tra kết quả
      const { data: updatedMatch } = await supabase
        .from('sabo_tournament_matches')
        .select('score_player1, score_player2, status, winner_id')
        .eq('id', testMatch.id)
        .single();
        
      console.log('📊 Match updated:', updatedMatch);
      
      console.log('\n✅ VẤN ĐỀ ĐÃ ĐƯỢC SỬA XONG!');
      console.log('🎯 Bây giờ có thể test trong UI:');
      console.log('1. Vào http://localhost:8000/');
      console.log('2. Tìm tournament "SABO Test Tournament"');
      console.log('3. Click "Enter Score" và nhập điểm');
      console.log('4. Điểm sẽ hiển thị ngay trên card!');
    }
  }
}

testFixedFunction().catch(console.error);
