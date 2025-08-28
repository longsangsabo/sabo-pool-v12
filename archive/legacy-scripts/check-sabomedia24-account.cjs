const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkSabomedia24() {
  console.log('🔍 KIỂM TRA USER sabomedia24@gmail.com');
  console.log('=====================================');

  try {
    // 1. Tìm user ID từ email trong bảng profiles
    console.log('\n1. 🔎 Tìm user ID:');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('email', 'sabomedia24@gmail.com')
      .single();

    if (userError) {
      console.log('❌ Không tìm thấy user:', userError.message);
      return;
    }

    console.log(`✅ User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.display_name}`);

    const userId = user.id;

    // 2. Kiểm tra spa_transactions
    console.log('\n2. 📋 spa_transactions:');
    const { data: transactions, error: txError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (txError) {
      console.log('❌ Lỗi:', txError.message);
    } else {
      console.log(`✅ Có ${transactions.length} transactions`);
      transactions.forEach((tx, i) => {
        console.log(`  ${i+1}. [${tx.created_at.substring(0, 10)}] ${tx.points > 0 ? '+' : ''}${tx.points} SPA`);
        console.log(`     Type: ${tx.source_type} | Description: ${tx.description}`);
        console.log(`     Ref: ${tx.reference_id || 'N/A'}`);
      });
    }

    // 3. Kiểm tra spa_points_log
    console.log('\n3. 📋 spa_points_log:');
    const { data: pointsLog, error: logError } = await supabase
      .from('spa_points_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (logError) {
      console.log('❌ Lỗi:', logError.message);
    } else {
      console.log(`✅ Có ${pointsLog.length} records trong spa_points_log`);
      pointsLog.forEach((log, i) => {
        console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] +${log.points} SPA - ${log.description}`);
        console.log(`     Category: ${log.category} | Ref: ${log.reference_id || 'N/A'}`);
      });
    }

    // 4. Kiểm tra spa_transaction_log
    console.log('\n4. 📋 spa_transaction_log:');
    const { data: txLog, error: txLogError } = await supabase
      .from('spa_transaction_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (txLogError) {
      console.log('❌ Lỗi:', txLogError.message);
    } else {
      console.log(`✅ Có ${txLog.length} records trong spa_transaction_log`);
      txLog.forEach((log, i) => {
        console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] ${log.points_change > 0 ? '+' : ''}${log.points_change} SPA`);
        console.log(`     Type: ${log.transaction_type} | ${log.previous_balance} → ${log.new_balance}`);
        console.log(`     Description: ${log.description}`);
      });
    }

    // 5. Kiểm tra current SPA
    console.log('\n5. 📊 Current SPA từ public_spa_leaderboard:');
    const { data: leaderboard, error: lbError } = await supabase
      .from('public_spa_leaderboard')
      .select('spa_points')
      .eq('user_id', userId)
      .single();

    if (lbError) {
      console.log('❌ Lỗi:', lbError.message);
    } else {
      console.log(`✅ Current SPA: ${leaderboard.spa_points}`);
    }

    console.log('\n🎯 KẾT LUẬN:');
    console.log('============');
    console.log('- Bảng nào có nhiều data nhất sẽ là nguồn chính cho SpaHistoryTab');
    console.log('- Nếu spa_points_log có nhiều records → dùng làm nguồn chính');
    console.log('- Nếu spa_transaction_log có nhiều records → dùng làm nguồn chính');
    console.log('- spa_transactions sẽ là fallback cho các transaction cũ');

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

checkSabomedia24();
