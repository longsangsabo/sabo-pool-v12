/**
 * CHECK SPA TABLES STRUCTURE & DATA
 * Kiểm tra table nào có data và cấu trúc như thế nào
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpaTablesData() {
  console.log('🔍 SPA TABLES DATA CHECK');
  console.log('========================\n');

  // Check spa_transactions table
  console.log('1. 📊 SPA_TRANSACTIONS TABLE:');
  console.log('-'.repeat(30));
  
  try {
    const { data: spaTransactions, error: spaError } = await supabase
      .from('spa_transactions')
      .select('*')
      .limit(5);

    if (spaError) {
      console.log('❌ spa_transactions error:', spaError.message);
    } else {
      console.log(`✅ Found ${spaTransactions.length} records in spa_transactions`);
      if (spaTransactions.length > 0) {
        console.log('📋 Sample record:');
        console.log(JSON.stringify(spaTransactions[0], null, 2));
      }
    }
  } catch (error) {
    console.log('❌ spa_transactions error:', error.message);
  }

  console.log('\n');

  // Check spa_points_log table
  console.log('2. 📊 SPA_POINTS_LOG TABLE:');
  console.log('-'.repeat(30));
  
  try {
    const { data: spaPointsLog, error: logError } = await supabase
      .from('spa_points_log')
      .select('*')
      .limit(5);

    if (logError) {
      console.log('❌ spa_points_log error:', logError.message);
    } else {
      console.log(`✅ Found ${spaPointsLog.length} records in spa_points_log`);
      if (spaPointsLog.length > 0) {
        console.log('📋 Sample record:');
        console.log(JSON.stringify(spaPointsLog[0], null, 2));
      }
    }
  } catch (error) {
    console.log('❌ spa_points_log error:', error.message);
  }

  console.log('\n');

  // Check player_rankings with SPA
  console.log('3. 📊 PLAYER_RANKINGS WITH SPA:');
  console.log('-'.repeat(35));
  
  try {
    const { data: rankings, error: rankError } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_points,
        updated_at,
        profiles!inner(display_name)
      `)
      .gt('spa_points', 0)
      .limit(5);

    if (rankError) {
      console.log('❌ player_rankings error:', rankError.message);
    } else {
      console.log(`✅ Found ${rankings.length} users with SPA > 0`);
      rankings.forEach((user, i) => {
        console.log(`${i+1}. ${user.profiles.display_name}: ${user.spa_points} SPA`);
        console.log(`   Updated: ${new Date(user.updated_at).toLocaleString()}`);
      });
    }
  } catch (error) {
    console.log('❌ player_rankings error:', error.message);
  }

  console.log('\n');

  // Count total records in each table
  console.log('4. 📈 RECORD COUNTS:');
  console.log('-'.repeat(20));

  try {
    const { count: spaTransCount } = await supabase
      .from('spa_transactions')
      .select('*', { count: 'exact', head: true });
    
    const { count: spaLogCount } = await supabase
      .from('spa_points_log')
      .select('*', { count: 'exact', head: true });

    const { count: spaUsersCount } = await supabase
      .from('player_rankings')
      .select('*', { count: 'exact', head: true })
      .gt('spa_points', 0);

    console.log(`📊 spa_transactions: ${spaTransCount || 0} records`);
    console.log(`📊 spa_points_log: ${spaLogCount || 0} records`);
    console.log(`📊 users with SPA > 0: ${spaUsersCount || 0} users`);

    // Analysis
    console.log('\n💡 ANALYSIS:');
    console.log('='.repeat(15));
    
    if ((spaUsersCount || 0) > 0 && (spaTransCount || 0) === 0 && (spaLogCount || 0) === 0) {
      console.log('❌ CRITICAL ISSUE: Users have SPA but NO transaction records!');
      console.log('   This confirms SPA is being updated directly in database');
      console.log('   without creating transaction history.');
    } else if ((spaTransCount || 0) > 0) {
      console.log('✅ spa_transactions table has data - UI should query this table');
    } else if ((spaLogCount || 0) > 0) {
      console.log('✅ spa_points_log table has data - UI should query this table');
    }

  } catch (error) {
    console.log('❌ Count error:', error.message);
  }

  console.log('\n✅ TABLE CHECK COMPLETE');
}

checkSpaTablesData().catch(console.error);
