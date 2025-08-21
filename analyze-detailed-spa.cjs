const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function analyzeUserDetailedSPA() {
  console.log('🔍 PHÂN TÍCH CHI TIẾT 350 SPA CỦA USER SABO');
  console.log('==========================================');

  const userId = 'b58d9334-b9e9-4039-8c13-a6c70b88c688'; // User sabo có 350 SPA

  try {
    // 1. Kiểm tra spa_points_log
    console.log('\n1. 📋 spa_points_log:');
    const { data: pointsLog, error: logError } = await supabase
      .from('spa_points_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (logError) {
      console.log('❌ Lỗi:', logError.message);
    } else {
      console.log(`✅ Có ${pointsLog.length} records trong spa_points_log`);
      pointsLog.forEach((log, i) => {
        console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] +${log.points} SPA - ${log.description}`);
        console.log(`     Category: ${log.category} | Ref: ${log.reference_id?.substring(0, 8)}...`);
      });
    }

    // 2. Kiểm tra spa_transaction_log
    console.log('\n2. 📋 spa_transaction_log:');
    const { data: txLog, error: txLogError } = await supabase
      .from('spa_transaction_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (txLogError) {
      console.log('❌ Lỗi:', txLogError.message);
    } else {
      console.log(`✅ Có ${txLog.length} records trong spa_transaction_log`);
      txLog.forEach((log, i) => {
        console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] ${log.points_change > 0 ? '+' : ''}${log.points_change} SPA`);
        console.log(`     Type: ${log.transaction_type} | ${log.previous_balance} → ${log.new_balance}`);
        console.log(`     Description: ${log.description}`);
        console.log(`     Ref: ${log.reference_id?.substring(0, 8)}...`);
      });
    }

    // 3. Kiểm tra milestones_completed từ player_rankings
    console.log('\n3. 📋 player_rankings.milestones_completed:');
    const { data: ranking, error: rankError } = await supabase
      .from('player_rankings')
      .select('milestones_completed, spa_points')
      .eq('user_id', userId)
      .single();

    if (rankError) {
      console.log('❌ Lỗi:', rankError.message);
    } else {
      console.log(`✅ Current SPA: ${ranking.spa_points}`);
      console.log('✅ Milestones completed:', ranking.milestones_completed);
      
      if (ranking.milestones_completed) {
        const milestoneIds = Object.keys(ranking.milestones_completed);
        console.log(`📊 Có ${milestoneIds.length} milestones completed`);
        
        let totalFromMilestones = 0;
        for (const milestoneId of milestoneIds) {
          const { data: milestone } = await supabase
            .from('milestones')
            .select('name, spa_reward, description, category')
            .eq('id', milestoneId)
            .single();
            
          if (milestone) {
            totalFromMilestones += milestone.spa_reward;
            console.log(`  📌 ${milestone.name}: +${milestone.spa_reward} SPA`);
            console.log(`     Category: ${milestone.category} | ${milestone.description}`);
            console.log(`     Completed: ${ranking.milestones_completed[milestoneId].completed_at}`);
          }
        }
        console.log(`📈 TOTAL từ milestones: ${totalFromMilestones} SPA`);
      }
    }

    // 4. Đề xuất giải pháp
    console.log('\n🎯 GIẢI PHÁP ĐỀ XUẤT:');
    console.log('=====================');
    console.log('1. Sử dụng milestones_completed từ player_rankings');
    console.log('2. Kết hợp với bảng milestones để lấy chi tiết');
    console.log('3. Tạo fake transactions chi tiết thay cho legacy transaction');
    console.log('4. Hoặc enhance SpaHistoryTab để hiển thị breakdown từ milestones');

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

analyzeUserDetailedSPA();
