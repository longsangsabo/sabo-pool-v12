const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function investigateAllSpaTables() {
  console.log('🔍 ĐIỀU TRA TẤT CẢ CÁC BẢNG SPA');
  console.log('================================');
  
  try {
    // Tìm user có 350 SPA
    const { data: user350 } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .eq('spa_points', 350)
      .single();

    if (!user350) {
      console.log('❌ Không tìm thấy user có 350 SPA');
      return;
    }

    const userId = user350.user_id;
    console.log(`📋 User có 350 SPA: ${userId.substring(0, 8)}...`);

    // 1. LEGACY_SPA_POINTS
    console.log('\n1. 📊 LEGACY_SPA_POINTS:');
    const { data: legacySpa, error: legacyError } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .eq('user_id', userId);
    
    if (legacyError) {
      console.log('❌ Error:', legacyError.message);
    } else {
      console.log(`✅ Found ${legacySpa?.length || 0} records`);
      legacySpa?.forEach(record => {
        console.log(`   Amount: ${record.amount || record.points || 'unknown'}`);
        console.log(`   Source: ${record.source || record.source_type || 'unknown'}`);
        console.log(`   Date: ${record.created_at || record.date || 'unknown'}`);
        console.log('   ---');
      });
    }

    // 2. SPA_BONUS_ACTIVITIES
    console.log('\n2. 📊 SPA_BONUS_ACTIVITIES:');
    const { data: bonusActivities, error: bonusError } = await supabase
      .from('spa_bonus_activities')
      .select('*')
      .eq('user_id', userId);
    
    if (bonusError) {
      console.log('❌ Error:', bonusError.message);
    } else {
      console.log(`✅ Found ${bonusActivities?.length || 0} records`);
      bonusActivities?.forEach(record => {
        console.log(`   Activity: ${record.activity_type || record.type || 'unknown'}`);
        console.log(`   Points: ${record.spa_points || record.points || 'unknown'}`);
        console.log(`   Date: ${record.created_at || 'unknown'}`);
        console.log('   ---');
      });
    }

    // 3. SPA_POINTS_LOG
    console.log('\n3. 📊 SPA_POINTS_LOG:');
    const { data: pointsLog, error: logError } = await supabase
      .from('spa_points_log')
      .select('*')
      .eq('user_id', userId);
    
    if (logError) {
      console.log('❌ Error:', logError.message);
    } else {
      console.log(`✅ Found ${pointsLog?.length || 0} records`);
      pointsLog?.forEach(record => {
        console.log(`   Points: ${record.points || record.amount || 'unknown'}`);
        console.log(`   Action: ${record.action || record.type || 'unknown'}`);
        console.log(`   Date: ${record.created_at || 'unknown'}`);
        console.log('   ---');
      });
    }

    // 4. SPA_TRANSACTION_LOG
    console.log('\n4. 📊 SPA_TRANSACTION_LOG:');
    const { data: transactionLog, error: txLogError } = await supabase
      .from('spa_transaction_log')
      .select('*')
      .eq('user_id', userId);
    
    if (txLogError) {
      console.log('❌ Error:', txLogError.message);
    } else {
      console.log(`✅ Found ${transactionLog?.length || 0} records`);
      transactionLog?.forEach(record => {
        console.log(`   Amount: ${record.amount || record.points || 'unknown'}`);
        console.log(`   Type: ${record.transaction_type || record.type || 'unknown'}`);
        console.log(`   Description: ${record.description || 'unknown'}`);
        console.log(`   Date: ${record.created_at || 'unknown'}`);
        console.log('   ---');
      });
    }

    // 5. SPA_TRANSACTIONS (hiện tại)
    console.log('\n5. 📊 SPA_TRANSACTIONS (hiện tại):');
    const { data: currentTx, error: currentError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId);
    
    if (currentError) {
      console.log('❌ Error:', currentError.message);
    } else {
      console.log(`✅ Found ${currentTx?.length || 0} records`);
      let totalFromTransactions = 0;
      currentTx?.forEach(record => {
        totalFromTransactions += record.amount || 0;
        console.log(`   Amount: ${record.amount} SPA`);
        console.log(`   Type: ${record.source_type || 'unknown'}`);
        console.log(`   Description: ${record.description || 'unknown'}`);
        console.log(`   Date: ${record.created_at}`);
        console.log('   ---');
      });
      console.log(`📊 TỔNG TỪ TRANSACTIONS: ${totalFromTransactions} SPA`);
    }

    // 6. PUBLIC_SPA_LEADERBOARD
    console.log('\n6. 📊 PUBLIC_SPA_LEADERBOARD:');
    const { data: leaderboard, error: leaderError } = await supabase
      .from('public_spa_leaderboard')
      .select('*')
      .eq('user_id', userId);
    
    if (leaderError) {
      console.log('❌ Error:', leaderError.message);
    } else {
      console.log(`✅ Found ${leaderboard?.length || 0} records`);
      leaderboard?.forEach(record => {
        console.log(`   Total SPA: ${record.total_spa || record.spa_points || 'unknown'}`);
        console.log(`   Rank: ${record.rank || record.position || 'unknown'}`);
        console.log('   ---');
      });
    }

    // SUMMARY
    console.log('\n🎯 TÓM TẮT ĐIỀU TRA:');
    console.log('===================');
    console.log(`User: ${userId.substring(0, 8)}...`);
    console.log(`SPA hiện tại: ${user350.spa_points} SPA`);
    console.log('');
    console.log('📋 CẦN KIỂM TRA:');
    console.log('- Có discrepancy giữa transaction total và balance thực tế không?');
    console.log('- Có missing transactions từ legacy tables không?');
    console.log('- Có duplicate transactions không?');
    console.log('- Có manual adjustments không được ghi lại không?');

  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
}

investigateAllSpaTables();
