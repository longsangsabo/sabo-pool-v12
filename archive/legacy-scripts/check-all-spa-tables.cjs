const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkAllSpaTables() {
  console.log('🔍 KIỂM TRA TẤT CẢ CÁC BẢNG SPA TRONG DATABASE');
  console.log('=============================================');

  try {
    // 1. legacy_spa_points
    console.log('\n1. 📋 BẢNG: legacy_spa_points');
    console.log('=============================');
    const { data: legacySpa, error: legacyError } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .limit(10);
    
    if (legacyError) {
      console.log('❌ Lỗi:', legacyError.message);
    } else {
      console.log(`✅ Có ${legacySpa.length} records`);
      if (legacySpa.length > 0) {
        console.log('🔍 Structure:', Object.keys(legacySpa[0]));
        console.log('📊 Sample data:');
        legacySpa.slice(0, 3).forEach((record, i) => {
          console.log(`  ${i+1}. User: ${record.user_id?.substring(0, 8)}... | SPA: ${record.spa_points || record.points || 'N/A'}`);
        });
      }
    }

    // 2. public_spa_leaderboard
    console.log('\n2. 📋 BẢNG: public_spa_leaderboard');
    console.log('==================================');
    const { data: publicSpa, error: publicError } = await supabase
      .from('public_spa_leaderboard')
      .select('*')
      .limit(10);
    
    if (publicError) {
      console.log('❌ Lỗi:', publicError.message);
    } else {
      console.log(`✅ Có ${publicSpa.length} records`);
      if (publicSpa.length > 0) {
        console.log('🔍 Structure:', Object.keys(publicSpa[0]));
        console.log('📊 Sample data:');
        publicSpa.slice(0, 3).forEach((record, i) => {
          console.log(`  ${i+1}. User: ${record.user_name || record.display_name || 'Unknown'} | SPA: ${record.spa_points || record.total_spa || 'N/A'}`);
        });
      }
    }

    // 3. spa_bonus_activities
    console.log('\n3. 📋 BẢNG: spa_bonus_activities');
    console.log('=================================');
    const { data: bonusActivities, error: bonusError } = await supabase
      .from('spa_bonus_activities')
      .select('*')
      .limit(10);
    
    if (bonusError) {
      console.log('❌ Lỗi:', bonusError.message);
    } else {
      console.log(`✅ Có ${bonusActivities.length} records`);
      if (bonusActivities.length > 0) {
        console.log('🔍 Structure:', Object.keys(bonusActivities[0]));
        console.log('📊 Sample data:');
        bonusActivities.slice(0, 3).forEach((record, i) => {
          console.log(`  ${i+1}. User: ${record.user_id?.substring(0, 8)}... | Activity: ${record.activity_type || 'N/A'} | Points: ${record.points || record.spa_points || 'N/A'}`);
        });
      }
    }

    // 4. spa_points_log
    console.log('\n4. 📋 BẢNG: spa_points_log');
    console.log('===========================');
    const { data: pointsLog, error: logError } = await supabase
      .from('spa_points_log')
      .select('*')
      .limit(10);
    
    if (logError) {
      console.log('❌ Lỗi:', logError.message);
    } else {
      console.log(`✅ Có ${pointsLog.length} records`);
      if (pointsLog.length > 0) {
        console.log('🔍 Structure:', Object.keys(pointsLog[0]));
        console.log('📊 Sample data:');
        pointsLog.slice(0, 3).forEach((record, i) => {
          console.log(`  ${i+1}. User: ${record.user_id?.substring(0, 8)}... | Action: ${record.action || 'N/A'} | Points: ${record.points || record.spa_change || 'N/A'}`);
        });
      }
    }

    // 5. spa_transaction_log
    console.log('\n5. 📋 BẢNG: spa_transaction_log');
    console.log('===============================');
    const { data: transactionLog, error: txLogError } = await supabase
      .from('spa_transaction_log')
      .select('*')
      .limit(10);
    
    if (txLogError) {
      console.log('❌ Lỗi:', txLogError.message);
    } else {
      console.log(`✅ Có ${transactionLog.length} records`);
      if (transactionLog.length > 0) {
        console.log('🔍 Structure:', Object.keys(transactionLog[0]));
        console.log('📊 Sample data:');
        transactionLog.slice(0, 3).forEach((record, i) => {
          console.log(`  ${i+1}. User: ${record.user_id?.substring(0, 8)}... | Amount: ${record.amount || record.spa_amount || 'N/A'} | Type: ${record.transaction_type || 'N/A'}`);
        });
      }
    }

    // 6. spa_transactions (bảng chính)
    console.log('\n6. 📋 BẢNG: spa_transactions (CHÍNH)');
    console.log('====================================');
    const { data: mainTransactions, error: mainTxError } = await supabase
      .from('spa_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (mainTxError) {
      console.log('❌ Lỗi:', mainTxError.message);
    } else {
      console.log(`✅ Có ${mainTransactions.length} records`);
      if (mainTransactions.length > 0) {
        console.log('🔍 Structure:', Object.keys(mainTransactions[0]));
        console.log('📊 Sample data (gần nhất):');
        mainTransactions.slice(0, 5).forEach((record, i) => {
          console.log(`  ${i+1}. [${record.created_at?.substring(0, 10)}] User: ${record.user_id?.substring(0, 8)}... | +${record.amount} SPA | ${record.description}`);
          console.log(`     Source: ${record.source_type} | Status: ${record.status}`);
        });
      }
    }

    // 7. Tìm user có 350 SPA từ player_rankings
    console.log('\n7. 🎯 TÌM USER CÓ 350 SPA');
    console.log('=========================');
    const { data: user350, error: user350Error } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, user_name')
      .eq('spa_points', 350);
    
    if (user350Error) {
      console.log('❌ Lỗi:', user350Error.message);
    } else {
      console.log(`✅ Tìm thấy ${user350.length} user(s) có 350 SPA`);
      if (user350.length > 0) {
        const targetUser = user350[0];
        console.log(`🎯 Target User: ${targetUser.user_name || 'Unknown'} (${targetUser.user_id.substring(0, 8)}...)`);
        
        // Kiểm tra trong các bảng SPA khác
        await checkUserInAllSpaTables(targetUser.user_id);
      }
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

async function checkUserInAllSpaTables(userId) {
  console.log(`\n🔍 KIỂM TRA USER ${userId.substring(0, 8)}... TRONG TẤT CẢ BẢNG SPA`);
  console.log('=======================================================');

  // Check trong từng bảng
  const tables = [
    'legacy_spa_points',
    'spa_bonus_activities', 
    'spa_points_log',
    'spa_transaction_log',
    'spa_transactions'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`📊 ${table}: ${data.length} records`);
        if (data.length > 0) {
          let totalPoints = 0;
          data.forEach(record => {
            const points = record.spa_points || record.points || record.amount || record.spa_change || 0;
            totalPoints += points;
            console.log(`  - ${record.created_at?.substring(0, 10) || 'N/A'}: +${points} (${record.description || record.activity_type || record.action || 'N/A'})`);
          });
          console.log(`  📈 Total từ ${table}: ${totalPoints} SPA`);
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: Exception - ${err.message}`);
    }
  }
}

checkAllSpaTables();
