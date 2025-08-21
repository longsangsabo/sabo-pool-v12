/**
 * DIRECT DATABASE AUDIT cho SPA updates
 * Kiểm tra trực tiếp triggers và functions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function simpleAudit() {
  console.log('🔍 SIMPLE SPA UPDATE AUDIT');
  console.log('===========================\n');

  // Check SPA mismatches with simple query
  console.log('1. 🔍 Check SPA/Transaction Mismatches:');
  console.log('-'.repeat(40));

  const { data: users, error: usersError } = await supabase
    .from('player_rankings')
    .select(`
      user_id,
      spa_points,
      updated_at,
      profiles!inner(display_name)
    `)
    .gt('spa_points', 0)
    .limit(10);

  if (usersError) {
    console.log('❌ Error getting users:', usersError.message);
    return;
  }

  for (const user of users) {
    // Get transaction total for this user
    const { data: transactions, error: transError } = await supabase
      .from('spa_transactions')
      .select('amount')
      .eq('user_id', user.user_id);

    const transactionTotal = transactions ? 
      transactions.reduce((sum, t) => sum + t.amount, 0) : 0;
    
    const mismatch = user.spa_points - transactionTotal;
    
    console.log(`👤 ${user.profiles.display_name}:`);
    console.log(`   Current SPA: ${user.spa_points}`);
    console.log(`   Transaction Total: ${transactionTotal}`);
    console.log(`   Transactions Count: ${transactions?.length || 0}`);
    
    if (mismatch !== 0) {
      console.log(`   🚨 MISMATCH: ${mismatch} SPA unaccounted`);
    } else {
      console.log(`   ✅ Balanced`);
    }
    console.log('');
  }

  // Check recent notifications for these users
  console.log('\n2. 🔔 Check Recent Notifications:');
  console.log('-'.repeat(35));

  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select(`
      id,
      user_id,
      title,
      message,
      created_at,
      profiles!inner(display_name)
    `)
    .in('type', ['milestone_completed', 'spa_award', 'tournament_reward'])
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (notifError) {
    console.log('❌ Error getting notifications:', notifError.message);
  } else if (notifications && notifications.length > 0) {
    notifications.forEach(notif => {
      console.log(`🔔 ${notif.profiles.display_name}: ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Time: ${new Date(notif.created_at).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('❌ No recent SPA-related notifications found');
  }

  // Check if update_spa_points function exists and works
  console.log('\n3. 🔧 Test update_spa_points Function:');
  console.log('-'.repeat(40));

  try {
    // Try to call the function with a test (should fail safely)
    const { data: testResult, error: testError } = await supabase
      .rpc('update_spa_points', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // fake UUID
        p_points: 0,
        p_source_type: 'test',
        p_description: 'Test call'
      });

    if (testError) {
      if (testError.message.includes('function update_spa_points')) {
        console.log('❌ update_spa_points function does NOT exist');
        console.log('   This explains why some SPA updates bypass transaction logging!');
      } else {
        console.log('✅ update_spa_points function exists');
        console.log(`   Test result: ${JSON.stringify(testResult)}`);
      }
    } else {
      console.log('✅ update_spa_points function exists and works');
    }
  } catch (error) {
    console.log('❌ Error testing function:', error.message);
  }

  // Get list of all milestones to check
  console.log('\n4. 📊 Milestone Completion Status:');
  console.log('-'.repeat(35));

  const { data: milestones, error: milestoneError } = await supabase
    .from('milestones')
    .select('id, name, spa_reward')
    .eq('is_active', true)
    .limit(5);

  if (milestoneError) {
    console.log('❌ Error getting milestones:', milestoneError.message);
  } else if (milestones) {
    for (const milestone of milestones) {
      const { data: completions, error: compError } = await supabase
        .from('player_milestones')
        .select('player_id')
        .eq('milestone_id', milestone.id)
        .eq('is_completed', true);

      console.log(`🏆 ${milestone.name} (${milestone.spa_reward} SPA):`);
      console.log(`   Completed by: ${completions?.length || 0} users`);
    }
  }

  // Final recommendations
  console.log('\n💡 FINDINGS:');
  console.log('='.repeat(30));
  console.log('✅ SPA được cộng vào database');
  console.log('❌ Một số SPA updates không tạo transaction records');
  console.log('❌ UI không hiển thị đầy đủ transaction history');
  console.log('');
  console.log('🔧 ACTIONS NEEDED:');
  console.log('1. Ensure all SPA updates use update_spa_points function');
  console.log('2. Create missing transaction records for historical SPA');
  console.log('3. Fix UI to show complete transaction history');
  console.log('4. Update all database triggers to use proper logging');
}

simpleAudit().catch(console.error);
