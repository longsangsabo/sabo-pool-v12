// Debug SABO score submission issue step by step
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSABOIssue() {
  console.log('🔍 Debug SABO score submission issue...');
  
  // 1. Kiểm tra có match nào không
  console.log('\n1. Kiểm tra SABO matches...');
  const { data: matches, error: matchError } = await supabase
    .from('sabo_tournament_matches')
    .select('*')
    .limit(5);
    
  if (matchError) {
    console.log('❌ Lỗi truy cập sabo_tournament_matches:', matchError.message);
    return;
  }
  
  if (!matches || matches.length === 0) {
    console.log('❌ Không có SABO matches nào để test');
    console.log('💡 Cần tạo SABO tournament trước');
    return;
  }
  
  console.log(`✅ Tìm thấy ${matches.length} SABO matches`);
  const testMatch = matches[0];
  console.log('📍 Test match:', {
    id: testMatch.id,
    status: testMatch.status,
    bracket_type: testMatch.bracket_type,
    round_number: testMatch.round_number,
    match_number: testMatch.match_number,
    score_player1: testMatch.score_player1,
    score_player2: testMatch.score_player2,
    player1_id: testMatch.player1_id,
    player2_id: testMatch.player2_id
  });
  
  // 2. Test function trực tiếp
  console.log('\n2. Test function submit_sabo_match_score...');
  const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
    p_match_id: testMatch.id,
    p_player1_score: 8,
    p_player2_score: 3,
    p_submitted_by: null
  });
  
  if (funcError) {
    console.log('❌ Function error:', funcError);
    
    if (funcError.message.includes('Match not found')) {
      console.log('💡 Function đang tìm match trong table sai');
      console.log('🔧 Cần chạy SQL fix trong Supabase Dashboard');
      return;
    }
  } else {
    console.log('✅ Function result:', result);
  }
  
  // 3. Kiểm tra match sau khi update
  console.log('\n3. Kiểm tra match sau khi update...');
  const { data: updatedMatch, error: checkError } = await supabase
    .from('sabo_tournament_matches')
    .select('score_player1, score_player2, status, winner_id')
    .eq('id', testMatch.id)
    .single();
    
  if (checkError) {
    console.log('❌ Lỗi check match:', checkError.message);
  } else {
    console.log('📊 Match sau update:', updatedMatch);
    
    if (updatedMatch.score_player1 === 8 && updatedMatch.score_player2 === 3) {
      console.log('🎉 SUCCESS: Function hoạt động đúng!');
    } else {
      console.log('❌ Function không cập nhật điểm');
    }
  }
  
  // 4. Kiểm tra có tournament nào có SABO matches đang pending không
  console.log('\n4. Tìm matches có thể test trong UI...');
  const { data: readyMatches, error: readyError } = await supabase
    .from('sabo_tournament_matches')
    .select('*')
    .in('status', ['pending', 'ready'])
    .limit(3);
    
  if (readyError) {
    console.log('❌ Lỗi tìm ready matches:', readyError.message);
  } else if (readyMatches?.length > 0) {
    console.log(`✅ Có ${readyMatches.length} matches có thể test trong UI:`);
    readyMatches.forEach(m => {
      console.log(`  - Round ${m.round_number}, Match ${m.match_number}: ${m.status}`);
    });
    console.log('\n💡 Thử vào tournament page và click "Enter Score" trên những matches này');
  } else {
    console.log('⚠️ Không có matches ready để test trong UI');
  }
  
  console.log('\n📋 TÓM TẮT CHẨN ĐOÁN:');
  console.log('='.repeat(50));
  
  if (result && result.success) {
    console.log('✅ Function database hoạt động OK');
    console.log('✅ Frontend code đã được sửa');
    console.log('💡 Vấn đề có thể là:');
    console.log('  - Không có matches ready để test');
    console.log('  - Browser cache chưa refresh');
    console.log('  - Permission issues');
    console.log('\n🔧 GIẢI PHÁP:');
    console.log('1. Hard refresh browser (Ctrl+Shift+R)');
    console.log('2. Tạo SABO tournament mới');
    console.log('3. Check console log trong browser');
  } else {
    console.log('❌ Function database có vấn đề');
    console.log('🔧 CẦN LÀM:');
    console.log('1. Chạy SQL trong fix-sabo-function-manual.sql');
    console.log('2. Trong Supabase Dashboard → SQL Editor');
  }
}

debugSABOIssue().catch(console.error);
