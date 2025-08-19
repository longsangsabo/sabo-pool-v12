// Debug UI refresh issue - Kiểm tra vấn đề UI không cập nhật
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugUIRefreshIssue() {
  console.log('🔍 Debug vấn đề UI không cập nhật điểm...');
  
  // 1. Kiểm tra matches hiện tại
  console.log('\n1. Kiểm tra matches hiện có:');
  const { data: matches, error: matchError } = await supabase
    .from('sabo_tournament_matches')
    .select('id, score_player1, score_player2, status, round_number, match_number')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (matchError) {
    console.log('❌ Lỗi:', matchError.message);
    return;
  }
  
  console.log('📊 Matches hiện có:');
  matches?.forEach((m, i) => {
    console.log(`  ${i+1}. R${m.round_number}M${m.match_number}: ${m.score_player1}-${m.score_player2} (${m.status})`);
  });
  
  // 2. Test submit một điểm mới và kiểm tra immediate
  if (matches?.length > 0) {
    const testMatch = matches.find(m => m.status === 'pending') || matches[0];
    console.log(`\n2. Test submit điểm cho match: ${testMatch.id}`);
    console.log(`   Điểm hiện tại: ${testMatch.score_player1}-${testMatch.score_player2}`);
    
    const newScore1 = Math.floor(Math.random() * 10) + 1;
    const newScore2 = Math.floor(Math.random() * 10) + 1;
    
    // Submit điểm
    const { data: result, error: funcError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: newScore1,
      p_player2_score: newScore2,
      p_submitted_by: null
    });
    
    if (funcError) {
      console.log('❌ Function error:', funcError.message);
      return;
    }
    
    console.log(`✅ Submit thành công: ${newScore1}-${newScore2}`);
    console.log('📋 Function result:', result);
    
    // 3. Kiểm tra ngay lập tức xem data có update không
    console.log('\n3. Kiểm tra data sau khi submit:');
    const { data: updatedMatch, error: checkError } = await supabase
      .from('sabo_tournament_matches')
      .select('score_player1, score_player2, status, winner_id, updated_at')
      .eq('id', testMatch.id)
      .single();
      
    if (checkError) {
      console.log('❌ Lỗi check:', checkError.message);
    } else {
      console.log('📊 Data updated:', updatedMatch);
      
      if (updatedMatch.score_player1 === newScore1 && updatedMatch.score_player2 === newScore2) {
        console.log('✅ Database đã update đúng!');
      } else {
        console.log('❌ Database chưa update đúng');
        return;
      }
    }
    
    // 4. Test real-time subscription
    console.log('\n4. Test real-time subscription...');
    let subscriptionTriggered = false;
    
    const subscription = supabase
      .channel('sabo_matches_test')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sabo_tournament_matches',
          filter: `id=eq.${testMatch.id}`
        }, 
        (payload) => {
          console.log('🔔 Real-time update received:', payload);
          subscriptionTriggered = true;
        }
      )
      .subscribe();
    
    // Submit lại để test real-time
    setTimeout(async () => {
      console.log('\n5. Submit điểm lần 2 để test real-time...');
      const score1_2 = Math.floor(Math.random() * 10) + 1;
      const score2_2 = Math.floor(Math.random() * 10) + 1;
      
      await supabase.rpc('submit_sabo_match_score', {
        p_match_id: testMatch.id,
        p_player1_score: score1_2,
        p_player2_score: score2_2,
        p_submitted_by: null
      });
      
      console.log(`✅ Submit lần 2: ${score1_2}-${score2_2}`);
      
      // Check subscription sau 2 giây
      setTimeout(() => {
        if (subscriptionTriggered) {
          console.log('✅ Real-time subscription hoạt động tốt!');
        } else {
          console.log('❌ Real-time subscription KHÔNG hoạt động!');
          console.log('💡 VẤN ĐỀ: Frontend có thể không nhận được real-time updates');
        }
        
        subscription.unsubscribe();
        
        console.log('\n📋 CHẨN ĐOÁN:');
        console.log('='.repeat(50));
        if (subscriptionTriggered) {
          console.log('✅ Database function: OK');
          console.log('✅ Data update: OK');
          console.log('✅ Real-time: OK');
          console.log('💡 Vấn đề có thể là:');
          console.log('  - Browser cache');
          console.log('  - Frontend component không re-render');
          console.log('  - Query invalidation không hoạt động');
          console.log('\n🔧 THỬ:');
          console.log('1. Hard refresh browser (Ctrl+Shift+R)');
          console.log('2. Kiểm tra console log trong browser');
          console.log('3. Kiểm tra Network tab xem có API calls không');
        } else {
          console.log('❌ Real-time subscription không hoạt động');
          console.log('💡 Cần check real-time setup trong frontend');
        }
      }, 2000);
    }, 1000);
  }
}

debugUIRefreshIssue().catch(console.error);
