// ============================================================================
// REAL DATABASE SPA SYSTEM CHECK WITH SERVICE ROLE
// ============================================================================
// Purpose: Check actual SPA system using service role key
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpaSystemReality() {
  console.log('🔍 REAL DATABASE SPA SYSTEM CHECK');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Check if update_spa_points function exists
    console.log('1. 🔧 CHECKING UPDATE_SPA_POINTS FUNCTION:');
    const { data: functions, error: funcError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          p.proname as function_name,
          pg_get_function_arguments(p.oid) as arguments,
          pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'update_spa_points' 
        AND n.nspname = 'public';
      `
    });

    if (funcError) {
      console.log('❌ Function check error:', funcError.message);
    } else if (functions && functions.length > 0) {
      console.log('✅ update_spa_points function EXISTS');
      console.log('   Arguments:', functions[0].arguments);
      console.log('   Definition preview:', functions[0].definition.substring(0, 200) + '...');
    } else {
      console.log('❌ update_spa_points function NOT FOUND!');
    }
    console.log('');

    // 2. Check tables with SPA columns
    console.log('2. 📊 TABLES WITH SPA-RELATED COLUMNS:');
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .eq('table_schema', 'public')
      .or('column_name.ilike.%spa%,column_name.ilike.%point%');

    if (colError) {
      console.log('❌ Columns check error:', colError.message);
    } else {
      columns.forEach(col => {
        console.log(`   ✅ ${col.table_name}.${col.column_name} (${col.data_type})`);
      });
    }
    console.log('');

    // 3. Check player_rankings SPA data
    console.log('3. 💰 PLAYER_RANKINGS SPA DATA:');
    const { data: rankings, error: rankError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, created_at, updated_at')
      .not('spa_points', 'is', null)
      .order('spa_points', { ascending: false })
      .limit(10);

    if (rankError) {
      console.log('❌ Rankings check error:', rankError.message);
    } else {
      console.log(`   ✅ Found ${rankings.length} users with SPA points:`);
      rankings.forEach((user, i) => {
        console.log(`   ${i+1}. User: ${user.user_id.substring(0, 8)}... | SPA: ${user.spa_points} | Updated: ${new Date(user.updated_at).toLocaleString()}`);
      });
    }
    console.log('');

    // 4. Check spa_transactions data
    console.log('4. 📋 SPA_TRANSACTIONS DATA:');
    const { data: transactions, error: txError } = await supabase
      .from('spa_transactions')
      .select('user_id, transaction_type, amount, description, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) {
      console.log('❌ Transactions check error:', txError.message);
    } else {
      console.log(`   ✅ Found ${transactions.length} recent transactions:`);
      transactions.forEach((tx, i) => {
        console.log(`   ${i+1}. User: ${tx.user_id.substring(0, 8)}... | ${tx.transaction_type} | ${tx.amount} SPA | ${tx.description}`);
        console.log(`      Date: ${new Date(tx.created_at).toLocaleString()}`);
      });
    }
    console.log('');

    // 5. Check milestone-related SPA transactions
    console.log('5. 🏆 MILESTONE-RELATED SPA TRANSACTIONS:');
    const { data: milestoneTransactions, error: milestoneError } = await supabase
      .from('spa_transactions')
      .select('user_id, transaction_type, amount, description, created_at')
      .or('description.ilike.%milestone%,transaction_type.eq.retroactive_milestone')
      .order('created_at', { ascending: false })
      .limit(15);

    if (milestoneError) {
      console.log('❌ Milestone transactions error:', milestoneError.message);
    } else if (milestoneTransactions.length > 0) {
      console.log(`   ✅ Found ${milestoneTransactions.length} milestone transactions:`);
      milestoneTransactions.forEach((tx, i) => {
        console.log(`   ${i+1}. User: ${tx.user_id.substring(0, 8)}... | +${tx.amount} SPA | ${tx.description}`);
        console.log(`      Date: ${new Date(tx.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   ❌ No milestone-related transactions found!');
    }
    console.log('');

    // 6. Check specific user lss2ps@gmail.com
    console.log('6. 🎯 SPECIFIC USER CHECK: lss2ps@gmail.com');
    
    // Get user ID first
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      const targetUser = authUsers.users.find(user => user.email === 'lss2ps@gmail.com');
      
      if (!targetUser) {
        console.log('❌ User lss2ps@gmail.com not found in auth system');
      } else {
        console.log(`   ✅ Found user: ${targetUser.id}`);
        
        // Check their ranking
        const { data: userRanking, error: userRankError } = await supabase
          .from('player_rankings')
          .select('*')
          .eq('user_id', targetUser.id)
          .single();

        if (userRankError) {
          console.log('   ❌ No ranking record found:', userRankError.message);
        } else {
          console.log('   ✅ Player Ranking:');
          console.log(`      - SPA Points: ${userRanking.spa_points || 0}`);
          console.log(`      - Created: ${new Date(userRanking.created_at).toLocaleString()}`);
          console.log(`      - Updated: ${new Date(userRanking.updated_at).toLocaleString()}`);
        }

        // Check their transactions
        const { data: userTransactions, error: userTxError } = await supabase
          .from('spa_transactions')
          .select('*')
          .eq('user_id', targetUser.id)
          .order('created_at', { ascending: false });

        if (userTxError) {
          console.log('   ❌ Transaction error:', userTxError.message);
        } else if (userTransactions.length > 0) {
          console.log(`   ✅ Found ${userTransactions.length} transactions:`);
          userTransactions.forEach((tx, i) => {
            console.log(`      ${i+1}. ${tx.transaction_type} | ${tx.amount} SPA | ${tx.description}`);
            console.log(`         Date: ${new Date(tx.created_at).toLocaleString()}`);
          });
        } else {
          console.log('   ❌ No transactions found for this user');
        }

        // Check their milestones
        const { data: userMilestones, error: userMilestoneError } = await supabase
          .from('player_milestones')
          .select(`
            *,
            milestones:milestone_id (
              name,
              milestone_type,
              spa_reward
            )
          `)
          .eq('player_id', targetUser.id);

        if (userMilestoneError) {
          console.log('   ❌ Milestone error:', userMilestoneError.message);
        } else if (userMilestones.length > 0) {
          console.log(`   ✅ Found ${userMilestones.length} milestones:`);
          userMilestones.forEach((milestone, i) => {
            console.log(`      ${i+1}. ${milestone.milestones.name} (${milestone.milestones.milestone_type})`);
            console.log(`         SPA Reward: ${milestone.milestones.spa_reward} | Completed: ${milestone.is_completed}`);
            console.log(`         Completed at: ${milestone.completed_at ? new Date(milestone.completed_at).toLocaleString() : 'N/A'}`);
          });
        } else {
          console.log('   ❌ No milestones found for this user');
        }
      }
    }
    console.log('');

    // 7. Overall statistics
    console.log('7. 📈 OVERALL STATISTICS:');
    
    // Total users in player_rankings
    const { count: totalUsers, error: countError } = await supabase
      .from('player_rankings')
      .select('*', { count: 'exact', head: true });
    
    // Users with milestone progress
    const { count: usersWithMilestones, error: milestoneCountError } = await supabase
      .from('player_milestones')
      .select('player_id', { count: 'exact', head: true });

    // Total SPA transactions
    const { count: totalTransactions, error: txCountError } = await supabase
      .from('spa_transactions')
      .select('*', { count: 'exact', head: true });

    console.log(`   ✅ Total users in player_rankings: ${totalUsers || 'Unknown'}`);
    console.log(`   ✅ Users with milestones: ${usersWithMilestones || 'Unknown'}`);
    console.log(`   ✅ Total SPA transactions: ${totalTransactions || 'Unknown'}`);
    console.log(`   ⚠️  Users WITHOUT milestones: ${totalUsers && usersWithMilestones ? totalUsers - usersWithMilestones : 'Unknown'}`);

    console.log('');
    console.log('🏁 REAL DATABASE CHECK COMPLETE');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSpaSystemReality();
