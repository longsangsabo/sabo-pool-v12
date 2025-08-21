#!/usr/bin/env node

/**
 * Check unified notification system status
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUnifiedNotificationSystem() {
  console.log('🔍 CHECKING UNIFIED NOTIFICATION SYSTEM');
  console.log('======================================\n');

  try {
    // Check for notifications table
    console.log('📋 1. Checking for `notifications` table...');
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ notifications table not found:', error.message);
      } else {
        console.log('✅ notifications table exists');
        console.log('   Sample columns available');
      }
    } catch (err) {
      console.log('❌ notifications table access failed:', err.message);
    }

    // Check for challenge_notifications table (current)
    console.log('\n📋 2. Checking current `challenge_notifications` table...');
    try {
      const { data, error } = await supabase
        .from('challenge_notifications')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ challenge_notifications table not found:', error.message);
      } else {
        console.log('✅ challenge_notifications table exists');
        console.log('   Current system is using this table');
      }
    } catch (err) {
      console.log('❌ challenge_notifications table access failed:', err.message);
    }

    // Check for create_unified_notification function
    console.log('\n🔧 3. Checking for `create_unified_notification` function...');
    try {
      const { data, error } = await supabase.rpc('create_unified_notification', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_type: 'test',
        p_title: 'Test',
        p_message: 'Test'
      });
      
      if (error) {
        console.log('❌ create_unified_notification function not found:', error.message);
      } else {
        console.log('✅ create_unified_notification function exists');
      }
    } catch (err) {
      console.log('❌ create_unified_notification function access failed:', err.message);
    }

    // Check for create_challenge_notification function (current)
    console.log('\n🔧 4. Checking current `create_challenge_notification` function...');
    try {
      const { data, error } = await supabase.rpc('create_challenge_notification', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_type: 'test',
        p_title: 'Test',
        p_message: 'Test'
      });
      
      if (error) {
        console.log('❌ create_challenge_notification function not found:', error.message);
      } else {
        console.log('✅ create_challenge_notification function exists');
        console.log('   Current system is using this function');
      }
    } catch (err) {
      console.log('❌ create_challenge_notification function access failed:', err.message);
    }

    // Get notification count from current system
    console.log('\n📊 5. Current notification system stats...');
    try {
      const { data, error } = await supabase
        .from('challenge_notifications')
        .select('*', { count: 'exact' })
        .limit(0);
      
      if (error) {
        console.log('❌ Cannot get notification count:', error.message);
      } else {
        console.log(`✅ Current notifications count: ${data?.length || 0}`);
      }
    } catch (err) {
      console.log('❌ Notification count failed:', err.message);
    }

    console.log('\n🎯 UNIFIED SYSTEM STATUS:');
    console.log('========================');
    console.log('Current System: challenge_notifications table + create_challenge_notification function');
    console.log('Target System: notifications table + create_unified_notification function');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Create notifications table with new columns');
    console.log('2. Create create_unified_notification function');
    console.log('3. Create useUnifiedNotifications hook');
    console.log('4. Update components to use new system');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkUnifiedNotificationSystem().then(() => {
  console.log('\n✅ Unified notification system check complete');
}).catch(err => {
  console.error('❌ Check failed:', err);
  process.exit(1);
});
