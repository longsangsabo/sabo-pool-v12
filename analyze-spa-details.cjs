const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function improveTransactionDetails() {
  console.log('🔍 IMPROVING SPA TRANSACTION DETAILS');
  console.log('===================================');
  
  // Get transactions with details that can be improved
  const { data: transactions, error } = await supabase
    .from('spa_transactions')
    .select('*')
    .not('reference_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📊 Transactions cần cải thiện chi tiết:');
  console.log('=====================================');
  
  for (const tx of transactions) {
    console.log(`\n🔍 Transaction: ${tx.id.substring(0, 8)}...`);
    console.log(`   Description: ${tx.description}`);
    console.log(`   Source Type: ${tx.source_type}`);
    console.log(`   Reference ID: ${tx.reference_id}`);
    console.log(`   Amount: ${tx.amount} SPA`);
    
    // Get detailed info based on source_type and reference_id
    let detailedInfo = '';
    
    if (tx.source_type === 'milestone_reward' && tx.reference_id) {
      const { data: milestone } = await supabase
        .from('milestones')
        .select('name, description, spa_reward')
        .eq('id', tx.reference_id)
        .single();
        
      if (milestone) {
        detailedInfo = `Milestone: ${milestone.name} (+${milestone.spa_reward} SPA)`;
        console.log(`   💡 Chi tiết: ${detailedInfo}`);
      }
    }
    
    if (tx.source_type === 'rank_verification' && tx.reference_id) {
      // This might be from rank_requests table
      const { data: rankRequest } = await supabase
        .from('rank_requests')
        .select('requested_rank, status')
        .eq('id', tx.reference_id)
        .single();
        
      if (rankRequest) {
        detailedInfo = `Xác thực hạng: ${rankRequest.requested_rank} (+${tx.amount} SPA)`;
        console.log(`   💡 Chi tiết: ${detailedInfo}`);
      }
    }
    
    if (tx.source_type === 'tournament_prize' && tx.reference_id) {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('name, prizes')
        .eq('id', tx.reference_id)
        .single();
        
      if (tournament) {
        detailedInfo = `Giải thưởng giải đấu: ${tournament.name} (+${tx.amount} SPA)`;
        console.log(`   💡 Chi tiết: ${detailedInfo}`);
      }
    }
    
    if (tx.source_type === 'challenge_reward' && tx.reference_id) {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('challenger_id, challenged_id, challenger_spa_reward, challenged_spa_reward')
        .eq('id', tx.reference_id)
        .single();
        
      if (challenge) {
        detailedInfo = `Thắng thách đấu (+${tx.amount} SPA)`;
        console.log(`   💡 Chi tiết: ${detailedInfo}`);
      }
    }
    
    if (!detailedInfo) {
      console.log(`   ⚠️  Không tìm thấy chi tiết cho source_type: ${tx.source_type}`);
    }
  }
  
  // Show improvement suggestions
  console.log('\n🎯 ĐỀ XUẤT CẢI TIẾN:');
  console.log('===================');
  console.log('1. Tạo hàm getTransactionDetails() trong SpaHistoryTab.tsx');
  console.log('2. Sử dụng reference_id để lấy thông tin chi tiết từ các bảng:');
  console.log('   - milestones (cho milestone_reward)');
  console.log('   - rank_requests (cho rank_verification)'); 
  console.log('   - tournaments (cho tournament_prize)');
  console.log('   - challenges (cho challenge_reward)');
  console.log('3. Cập nhật sourceTypeConfig để có mapping chi tiết hơn');
  console.log('4. Thay thế "Khác" bằng mô tả cụ thể');
}

improveTransactionDetails();
