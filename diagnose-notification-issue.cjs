const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 KIỂM TRA CHI TIẾT NOTIFICATION SYSTEM...');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseNotificationIssue() {
  console.log('\n1. Kiểm tra notifications trong database...');
  
  // Check notifications count first
  const { count, error: countError } = await supabase
    .from('challenge_notifications')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.log('❌ Error checking count:', countError.message);
  } else {
    console.log(`📊 Total notifications in DB: ${count || 0}`);
  }
  
  // Try to get notifications data
  const { data: notifications, error: notifError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (notifError) {
    console.log('❌ Error accessing notifications:', notifError.message);
    console.log('🔧 This might be due to RLS policies blocking anonymous access');
  } else {
    console.log(`✅ Successfully queried notifications: ${notifications?.length || 0} found`);
    notifications?.forEach((n, i) => {
      console.log(`  ${i+1}. ${n.type} - ${n.title}`);
      console.log(`     User: ${n.user_id?.slice(0,8)}...`);
      console.log(`     Created: ${n.created_at}`);
      console.log(`     Read: ${n.is_read}`);
      console.log('     ---');
    });
  }
  
  console.log('\n2. Kiểm tra database triggers và functions...');
  
  // Test if notification function exists
  const { data: functionTest, error: functionError } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'function_test',
      p_user_id: 'e30e1d1d-d714-4678-b63c-9f403ea2aeac',
      p_title: 'Function Test',
      p_message: 'Testing if function exists',
      p_icon: 'test-tube',
      p_priority: 'medium'
    });
    
  if (functionError) {
    console.log('❌ Notification function error:', functionError.message);
    if (functionError.message.includes('could not find function')) {
      console.log('🔧 SOLUTION: Run challenge-notification-schema.sql in Supabase Dashboard');
    }
  } else {
    console.log('✅ Notification function works, created ID:', functionTest);
  }
  
  console.log('\n3. Kiểm tra recent challenge activity...');
  
  const { data: recentChallenges } = await supabase
    .from('challenges')
    .select('id, status, challenger_id, opponent_id, created_at, responded_at')
    .order('created_at', { ascending: false })
    .limit(3);
    
  console.log('📋 Recent challenges:');
  recentChallenges?.forEach((c, i) => {
    console.log(`  ${i+1}. ${c.id.slice(0,8)}... (${c.status})`);
    console.log(`     Created: ${c.created_at}`);
    if (c.responded_at) {
      console.log(`     ✅ Accepted: ${c.responded_at}`);
    }
    console.log(`     Challenger: ${c.challenger_id?.slice(0,8)}...`);
    console.log(`     Opponent: ${c.opponent_id?.slice(0,8) || 'NULL'}...`);
    console.log('     ---');
  });
  
  console.log('\n4. Kiểm tra schema files...');
  
  const fs = require('fs');
  
  // Check if schema file exists
  if (fs.existsSync('./challenge-notification-schema.sql')) {
    console.log('✅ challenge-notification-schema.sql exists');
    
    const schemaContent = fs.readFileSync('./challenge-notification-schema.sql', 'utf8');
    
    if (schemaContent.includes('CREATE TRIGGER challenge_created_notification_trigger')) {
      console.log('✅ Challenge creation trigger found in schema');
    } else {
      console.log('❌ Challenge creation trigger NOT found in schema');
    }
    
    if (schemaContent.includes('trigger_challenge_created_notification')) {
      console.log('✅ Challenge creation function found in schema');
    } else {
      console.log('❌ Challenge creation function NOT found in schema');
    }
    
    // Check for challenge status update trigger
    if (schemaContent.includes('AFTER UPDATE ON challenges')) {
      console.log('✅ Challenge update trigger found in schema');
    } else {
      console.log('❌ Challenge update trigger NOT found in schema');
      console.log('🔧 Missing trigger for when challenge status changes to "accepted"');
    }
  } else {
    console.log('❌ challenge-notification-schema.sql NOT found');
  }
  
  console.log('\n5. Test manual notification creation cho accepted challenge...');
  
  // Try to create notification for accepted challenge manually
  const acceptedChallengeId = 'd0ba6ff2-843a-4683-94fe-1ac9c77c1134';
  const challengerId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
  
  const { data: manualNotif, error: manualError } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'challenge_accepted',
      p_challenge_id: acceptedChallengeId,
      p_user_id: challengerId,
      p_title: '🎉 Challenge Accepted!',
      p_message: 'Võ Long Sang has accepted your challenge!',
      p_icon: 'check-circle',
      p_priority: 'high'
    });
    
  if (manualError) {
    console.log('❌ Manual notification creation failed:', manualError.message);
  } else {
    console.log('✅ Manual notification created successfully:', manualNotif);
  }
  
  console.log('\n🎯 DIAGNOSIS SUMMARY:');
  console.log('====================');
  
  if (functionError) {
    console.log('❌ PRIMARY ISSUE: Notification function missing');
    console.log('🔧 SOLUTION: Run challenge-notification-schema.sql in Supabase Dashboard');
  } else if (count === 0) {
    console.log('❌ PRIMARY ISSUE: No notifications created despite function working');
    console.log('🔧 POSSIBLE CAUSES:');
    console.log('   1. Database triggers not installed');
    console.log('   2. Triggers installed after challenges were created');
    console.log('   3. RLS policies blocking trigger execution');
  } else {
    console.log('⚠️ ISSUE: Notifications exist but not visible to user');
    console.log('🔧 POSSIBLE CAUSES:');
    console.log('   1. RLS policies blocking read access');
    console.log('   2. Frontend not authenticated properly');
    console.log('   3. Notification component not fetching correctly');
  }
}

diagnoseNotificationIssue();
