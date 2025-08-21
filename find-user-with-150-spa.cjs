const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function findUserWith150SPA() {
  console.log('🔍 TÌM USER CÓ 150 SPA');
  console.log('====================');

  try {
    // 1. Tìm trong profile table với email sabomedia24
    console.log('\n1. 📋 Tìm trong profiles với email sabomedia24:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', '%sabomedia24%');

    if (profileError) {
      console.log('❌ Lỗi:', profileError.message);
    } else {
      console.log(`✅ Tìm thấy ${profiles.length} profiles`);
      profiles.forEach((p, i) => {
        console.log(`  ${i+1}. ID: ${p.id}`);
        console.log(`     Email: ${p.email}`);
        console.log(`     Username: ${p.username}`);
        console.log(`     Display Name: ${p.display_name}`);
      });

      // Nếu tìm thấy user, check SPA data
      if (profiles.length > 0) {
        const userId = profiles[0].id;
        
        console.log(`\n🎯 KIỂM TRA SPA DATA CHO USER: ${userId}`);
        console.log('============================================');

        // Check spa_transactions
        const { data: transactions, error: txError } = await supabase
          .from('spa_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        console.log(`\n📋 spa_transactions: ${transactions?.length || 0} records`);
        transactions?.forEach((tx, i) => {
          console.log(`  ${i+1}. [${tx.created_at.substring(0, 10)}] ${tx.points > 0 ? '+' : ''}${tx.points} SPA`);
          console.log(`     Type: ${tx.source_type} | Description: ${tx.description}`);
          console.log(`     Reference: ${tx.reference_id?.substring(0, 8)}...`);
        });

        // Check spa_points_log
        const { data: pointsLog, error: logError } = await supabase
          .from('spa_points_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        console.log(`\n📋 spa_points_log: ${pointsLog?.length || 0} records`);
        pointsLog?.forEach((log, i) => {
          console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] +${log.points} SPA`);
          console.log(`     Category: ${log.category} | Description: ${log.description}`);
          console.log(`     Reference: ${log.reference_id?.substring(0, 8)}...`);
        });

        // Check current SPA balance
        const { data: leaderboard, error: lbError } = await supabase
          .from('public_spa_leaderboard')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!lbError && leaderboard) {
          console.log(`\n💰 Current SPA Balance: ${leaderboard.spa_points}`);
        }
      }
    }

    // 2. Backup: Tìm user nào có đúng 150 SPA
    console.log('\n2. 📋 Tìm tất cả user có 150 SPA:');
    const { data: spa150Users, error: spa150Error } = await supabase
      .from('public_spa_leaderboard')
      .select('user_id, spa_points, profiles!inner(email, username, display_name)')
      .eq('spa_points', 150);

    if (spa150Error) {
      console.log('❌ Lỗi:', spa150Error.message);
    } else {
      console.log(`✅ Có ${spa150Users.length} users với 150 SPA`);
      spa150Users.forEach((user, i) => {
        console.log(`  ${i+1}. User ID: ${user.user_id}`);
        console.log(`     Email: ${user.profiles.email}`);
        console.log(`     Username: ${user.profiles.username}`);
        console.log(`     Display: ${user.profiles.display_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

findUserWith150SPA();
