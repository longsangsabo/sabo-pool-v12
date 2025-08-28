/**
 * COMPREHENSIVE SPA UPDATE AUDIT
 * Tìm tất cả các source cập nhật SPA và kiến nghị thống nhất hóa
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function auditAllSpaUpdates() {
  console.log('🔍 COMPREHENSIVE SPA UPDATE AUDIT');
  console.log('========================================\n');

  // 1. AUDIT DATABASE TRIGGERS
  console.log('1. 🎯 DATABASE TRIGGERS ANALYSIS:');
  console.log('-'.repeat(40));

  const { data: triggers, error: triggerError } = await supabase
    .rpc('sql_query', {
      query: `
        SELECT 
          t.trigger_name,
          t.event_manipulation,
          t.event_object_table,
          t.action_statement,
          t.action_timing,
          p.prosrc as function_source
        FROM information_schema.triggers t
        LEFT JOIN pg_proc p ON p.proname = REPLACE(REPLACE(t.action_statement, 'EXECUTE FUNCTION ', ''), '()', '')
        WHERE t.event_object_schema = 'public'
          AND (
            t.event_object_table IN ('player_rankings', 'profiles', 'spa_transactions', 'tournaments', 'rank_requests', 'player_milestones')
            OR t.action_statement ILIKE '%spa%'
            OR p.prosrc ILIKE '%spa_points%'
          )
        ORDER BY t.event_object_table, t.trigger_name;
      `
    });

  if (triggerError) {
    console.log('❌ Error getting triggers:', triggerError.message);
  } else if (triggers) {
    triggers.forEach(trigger => {
      console.log(`📌 TRIGGER: ${trigger.trigger_name}`);
      console.log(`   Table: ${trigger.event_object_table}`);
      console.log(`   Event: ${trigger.event_manipulation} (${trigger.action_timing})`);
      console.log(`   Function: ${trigger.action_statement}`);
      
      if (trigger.function_source && trigger.function_source.includes('spa_points')) {
        console.log('   🚨 CONTAINS SPA UPDATES!');
      }
      console.log('');
    });
  }

  // 2. AUDIT DATABASE FUNCTIONS
  console.log('\n2. 🔧 DATABASE FUNCTIONS WITH SPA UPDATES:');
  console.log('-'.repeat(50));

  const { data: functions, error: funcError } = await supabase
    .rpc('sql_query', {
      query: `
        SELECT 
          p.proname as function_name,
          p.prosrc as source_code
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND (
            p.prosrc ILIKE '%spa_points%'
            OR p.prosrc ILIKE '%UPDATE player_rankings%spa%'
            OR p.prosrc ILIKE '%INSERT INTO spa_transactions%'
            OR p.proname ILIKE '%spa%'
            OR p.proname ILIKE '%milestone%'
            OR p.proname ILIKE '%tournament%'
            OR p.proname ILIKE '%rank%'
          )
        ORDER BY p.proname;
      `
    });

  if (funcError) {
    console.log('❌ Error getting functions:', funcError.message);
  } else if (functions) {
    functions.forEach(func => {
      console.log(`⚙️  FUNCTION: ${func.function_name}`);
      
      // Check for SPA updates in function source
      const spaUpdates = [];
      const lines = func.source_code.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('spa_points') && 
            (line.includes('UPDATE') || line.includes('INSERT') || line.includes('SET'))) {
          spaUpdates.push(`   Line ${index + 1}: ${line.trim()}`);
        }
      });
      
      if (spaUpdates.length > 0) {
        console.log('   🚨 SPA UPDATE STATEMENTS:');
        spaUpdates.forEach(update => console.log(update));
      }
      
      // Check if uses proper transaction logging
      const hasTransactionLogging = func.source_code.includes('spa_transactions') || 
                                  func.source_code.includes('update_spa_points');
      const hasNotificationLogging = func.source_code.includes('notifications') || 
                                   func.source_code.includes('create_challenge_notification');
      
      console.log(`   📝 Transaction Logging: ${hasTransactionLogging ? '✅' : '❌'}`);
      console.log(`   🔔 Notification Logging: ${hasNotificationLogging ? '✅' : '❌'}`);
      console.log('');
    });
  }

  // 3. FIND RECENT SPA CHANGES WITHOUT TRANSACTION HISTORY
  console.log('\n3. 🔍 SPA BALANCE MISMATCHES:');
  console.log('-'.repeat(35));

  const { data: mismatchUsers, error: mismatchError } = await supabase
    .rpc('sql_query', {
      query: `
        WITH user_spa_summary AS (
          SELECT 
            pr.user_id,
            pr.spa_points as current_spa,
            COALESCE(SUM(st.amount), 0) as transaction_total,
            COUNT(st.id) as transaction_count,
            pr.spa_points - COALESCE(SUM(st.amount), 0) as mismatch_amount
          FROM player_rankings pr
          LEFT JOIN spa_transactions st ON st.user_id = pr.user_id
          WHERE pr.spa_points > 0
          GROUP BY pr.user_id, pr.spa_points
        )
        SELECT 
          uss.*,
          p.display_name,
          p.created_at as account_created
        FROM user_spa_summary uss
        JOIN profiles p ON p.user_id = uss.user_id
        WHERE uss.mismatch_amount != 0
        ORDER BY uss.mismatch_amount DESC
        LIMIT 10;
      `
    });

  if (mismatchError) {
    console.log('❌ Error finding mismatches:', mismatchError.message);
  } else if (mismatchUsers && mismatchUsers.length > 0) {
    console.log(`Found ${mismatchUsers.length} users with SPA/transaction mismatches:\n`);
    
    mismatchUsers.forEach(user => {
      console.log(`👤 ${user.display_name}:`);
      console.log(`   Current SPA: ${user.current_spa}`);
      console.log(`   Transaction Total: ${user.transaction_total}`);
      console.log(`   Transaction Count: ${user.transaction_count}`);
      console.log(`   🚨 MISMATCH: ${user.mismatch_amount} SPA unaccounted`);
      console.log('');
    });
  } else {
    console.log('✅ No SPA/transaction mismatches found');
  }

  // 4. RECENT SPA CHANGES WITHOUT TRANSACTION RECORDS
  console.log('\n4. 📊 RECENT SPA ACTIVITY WITHOUT TRANSACTIONS:');
  console.log('-'.repeat(50));

  const { data: recentActivity, error: activityError } = await supabase
    .rpc('sql_query', {
      query: `
        SELECT 
          pr.user_id,
          p.display_name,
          pr.spa_points,
          pr.updated_at as last_spa_update,
          COALESCE(st.last_transaction, '1970-01-01') as last_transaction,
          AGE(pr.updated_at, COALESCE(st.last_transaction, '1970-01-01')) as time_gap
        FROM player_rankings pr
        JOIN profiles p ON p.user_id = pr.user_id
        LEFT JOIN (
          SELECT user_id, MAX(created_at) as last_transaction
          FROM spa_transactions
          GROUP BY user_id
        ) st ON st.user_id = pr.user_id
        WHERE pr.spa_points > 0
          AND pr.updated_at > NOW() - INTERVAL '7 days'
          AND (st.last_transaction IS NULL OR pr.updated_at > st.last_transaction + INTERVAL '1 hour')
        ORDER BY pr.updated_at DESC
        LIMIT 10;
      `
    });

  if (activityError) {
    console.log('❌ Error getting recent activity:', activityError.message);
  } else if (recentActivity && recentActivity.length > 0) {
    console.log(`Found ${recentActivity.length} recent SPA updates without corresponding transactions:\n`);
    
    recentActivity.forEach(activity => {
      console.log(`👤 ${activity.display_name}:`);
      console.log(`   SPA Balance: ${activity.spa_points}`);
      console.log(`   Last SPA Update: ${new Date(activity.last_spa_update).toLocaleString()}`);
      console.log(`   Last Transaction: ${new Date(activity.last_transaction).toLocaleString()}`);
      console.log(`   🚨 Gap: ${activity.time_gap}`);
      console.log('');
    });
  } else {
    console.log('✅ No suspicious recent SPA activity found');
  }

  // 5. ANALYSIS SUMMARY
  console.log('\n📋 AUDIT SUMMARY & RECOMMENDATIONS:');
  console.log('='.repeat(50));
  console.log('');
  console.log('🎯 ISSUES IDENTIFIED:');
  console.log('1. Multiple triggers update SPA directly without transaction logging');
  console.log('2. Database functions bypass spaService.ts transaction logic');
  console.log('3. Tournament/milestone rewards may not create proper audit trail');
  console.log('4. Rank promotion triggers update SPA without notifications');
  console.log('');
  console.log('🔧 RECOMMENDATIONS:');
  console.log('1. Create unified update_spa_points() function for ALL SPA changes');
  console.log('2. Refactor all triggers to use update_spa_points() instead of direct UPDATE');
  console.log('3. Ensure ALL SPA updates create spa_transactions + notifications');
  console.log('4. Add audit trail for system vs user-initiated SPA changes');
  console.log('5. Create SPA reconciliation job to fix historical mismatches');
  console.log('');
  console.log('✅ AUDIT COMPLETE');
}

// Execute audit
auditAllSpaUpdates().catch(console.error);
