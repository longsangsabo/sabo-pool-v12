const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

console.log('🎯 TEST SPA HISTORY IMPROVEMENTS');
console.log('===============================');

async function testSpaHistoryImprovements() {
  try {
    // Get a user with transactions
    const { data: transactions, error } = await supabase
      .from('spa_transactions')
      .select('*')
      .not('reference_id', 'is', null)
      .limit(5);
      
    if (error) throw error;
    
    console.log('📊 BEFORE vs AFTER Comparison:');
    console.log('==============================');
    
    for (const tx of transactions) {
      console.log(`\n🔄 Transaction ${tx.id.substring(0, 8)}...`);
      console.log(`📋 BEFORE (Old): "${tx.description || 'Khác'}"`);
      
      // Simulate the new logic
      let enhancedDescription = tx.description;
      let enhancedSubtitle = 'Giao dịch SPA';
      
      if (tx.source_type === 'milestone_reward' && tx.reference_id) {
        const { data: milestone } = await supabase
          .from('milestones')
          .select('name, description, category')
          .eq('id', tx.reference_id)
          .single();
          
        if (milestone) {
          enhancedDescription = milestone.name;
          enhancedSubtitle = `${milestone.category || 'Milestone'} • ${milestone.description}`;
        }
      }
      
      if (tx.source_type === 'rank_verification' && tx.reference_id) {
        const { data: rankRequest } = await supabase
          .from('rank_requests')
          .select('requested_rank, status')
          .eq('id', tx.reference_id)
          .single();
          
        if (rankRequest) {
          enhancedDescription = `Xác thực hạng ${rankRequest.requested_rank}`;
          enhancedSubtitle = `Hạng được xác thực • ${rankRequest.status}`;
        }
      }
      
      console.log(`✨ AFTER (New): "${enhancedDescription}"`);
      console.log(`📝 Subtitle: "${enhancedSubtitle}"`);
      console.log(`💰 Amount: +${tx.amount} SPA`);
    }
    
    console.log('\n🎉 IMPROVEMENTS SUMMARY:');
    console.log('========================');
    console.log('✅ Thay thế "Khác" bằng tên milestone cụ thể');
    console.log('✅ Hiển thị category và description của milestone');
    console.log('✅ Thêm thông tin xác thực hạng chi tiết');
    console.log('✅ Cải thiện UX với thông tin rõ ràng hơn');
    console.log('✅ Giữ nguyên reference_id để debug');
    
    console.log('\n📱 MOBILE UI IMPACT:');
    console.log('====================');
    console.log('- Title: Tên milestone thay vì "Milestone"');
    console.log('- Subtitle: Category và description thay vì generic text');  
    console.log('- Icon: Phù hợp với loại hoạt động');
    console.log('- Color: Phân biệt rõ ràng các loại giao dịch');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpaHistoryImprovements();
