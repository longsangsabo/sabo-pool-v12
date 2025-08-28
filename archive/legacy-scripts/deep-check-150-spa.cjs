const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function deepCheckUser150SPA() {
  console.log('🔍 DEEP CHECK USER 150 SPA');
  console.log('==========================');

  const userId = '235579f4-d922-49a1-ab92-247c9cb969ea'; // sabomedia24@gmail.com

  try {
    // 1. Check tất cả bảng SPA có thể
    console.log('\n1. 📋 Kiểm tra tất cả bảng SPA:');
    
    // spa_transactions
    const { data: tx1 } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId);
    console.log(`spa_transactions: ${tx1?.length || 0} records`);

    // spa_points_log  
    const { data: tx2 } = await supabase
      .from('spa_points_log')
      .select('*')
      .eq('user_id', userId);
    console.log(`spa_points_log: ${tx2?.length || 0} records`);

    // spa_transaction_log
    const { data: tx3 } = await supabase
      .from('spa_transaction_log')
      .select('*')
      .eq('user_id', userId);
    console.log(`spa_transaction_log: ${tx3?.length || 0} records`);

    // legacy_spa_points với player_id
    const { data: tx4 } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .eq('player_id', userId);
    console.log(`legacy_spa_points (by ID): ${tx4?.length || 0} records`);

    // legacy_spa_points với email
    const { data: tx5 } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .eq('player_id', 'sabomedia24@gmail.com');
    console.log(`legacy_spa_points (by email): ${tx5?.length || 0} records`);

    // 2. Check current balance
    console.log('\n2. 📋 Current SPA Balance:');
    const { data: balance, error: balError } = await supabase
      .from('public_spa_leaderboard')
      .select('*')
      .eq('user_id', userId);

    if (balError) {
      console.log('❌ Lỗi leaderboard:', balError.message);
    } else {
      console.log(`✅ Leaderboard records: ${balance.length}`);
      balance.forEach(b => {
        console.log(`  SPA: ${b.spa_points} | Rank: ${b.rank}`);
      });
    }

    // 3. Tìm user nào có data trong spa_points_log để làm mẫu
    console.log('\n3. 📋 Tìm user có data trong spa_points_log làm mẫu:');
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('spa_points_log')
      .select('user_id')
      .limit(5);

    if (sampleError) {
      console.log('❌ Lỗi:', sampleError.message);
    } else {
      console.log(`✅ Có ${sampleUsers.length} users trong spa_points_log`);
      
      if (sampleUsers.length > 0) {
        const sampleUserId = sampleUsers[0].user_id;
        console.log(`\n🎯 Kiểm tra user mẫu: ${sampleUserId}`);
        
        const { data: sampleLogs } = await supabase
          .from('spa_points_log')
          .select('*')
          .eq('user_id', sampleUserId)
          .limit(3);

        sampleLogs?.forEach((log, i) => {
          console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] +${log.points} SPA`);
          console.log(`     Category: ${log.category} | Description: ${log.description}`);
          console.log(`     Reference: ${log.reference_id?.substring(0, 8)}...`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

deepCheckUser150SPA();
