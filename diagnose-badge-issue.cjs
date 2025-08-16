const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseBadgeIssue() {
  console.log('🔍 DIAGNOSING NOTIFICATION BADGE ISSUE...');
  console.log('');

  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';

  console.log('1. Creating multiple test notifications...');
  
  const notifications = [
    { title: '📧 Test Unread 1', is_read: false },
    { title: '📧 Test Unread 2', is_read: false },
    { title: '📧 Test Read 1', is_read: true }
  ];

  const notificationIds = [];

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];
    
    const { data: id, error } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'badge_test',
        p_user_id: testUserId,
        p_title: notif.title,
        p_message: 'Testing badge synchronization',
        p_icon: 'test',
        p_priority: 'medium'
      });

    if (!error) {
      notificationIds.push(id);
      console.log(`   ✅ Created: ${notif.title}`);
      
      // If it should be read, mark it as read
      if (notif.is_read) {
        await supabase
          .from('challenge_notifications')
          .update({ is_read: true })
          .eq('id', id);
        console.log(`   📖 Marked as read: ${notif.title}`);
      }
    } else {
      console.log(`   ❌ Failed to create: ${notif.title}`);
    }
  }

  console.log('');
  console.log('2. Checking notification counts...');

  // Check total notifications
  const { data: totalData, error: totalError } = await supabase
    .from('challenge_notifications')
    .select('id, title, is_read')
    .eq('user_id', testUserId);

  if (totalError) {
    console.log('❌ Total query failed:', totalError.message);
  } else {
    console.log(`✅ Total notifications: ${totalData?.length || 0}`);
    if (totalData) {
      totalData.forEach(notif => {
        console.log(`   ${notif.is_read ? '📖' : '📧'} ${notif.title} (Read: ${notif.is_read})`);
      });
    }
  }

  // Check unread count
  const { data: unreadData, error: unreadError } = await supabase
    .from('challenge_notifications')
    .select('id')
    .eq('user_id', testUserId)
    .eq('is_read', false);

  if (unreadError) {
    console.log('❌ Unread query failed:', unreadError.message);
  } else {
    console.log(`✅ Unread notifications: ${unreadData?.length || 0}`);
  }

  console.log('');
  console.log('3. Testing mark all as read...');

  // Mark all as read
  const { data: markAllData, error: markAllError } = await supabase
    .from('challenge_notifications')
    .update({ is_read: true })
    .eq('user_id', testUserId)
    .eq('is_read', false);

  if (markAllError) {
    console.log('❌ Mark all failed:', markAllError.message);
  } else {
    console.log('✅ Marked all notifications as read');
  }

  // Check unread count again
  const { data: finalUnreadData, error: finalUnreadError } = await supabase
    .from('challenge_notifications')
    .select('id')
    .eq('user_id', testUserId)
    .eq('is_read', false);

  if (finalUnreadError) {
    console.log('❌ Final unread query failed:', finalUnreadError.message);
  } else {
    console.log(`✅ Final unread count: ${finalUnreadData?.length || 0}`);
  }

  console.log('');
  console.log('4. Cleanup test notifications...');

  // Clean up
  for (const id of notificationIds) {
    await supabase
      .from('challenge_notifications')
      .delete()
      .eq('id', id);
  }
  console.log('✅ Cleaned up test notifications');

  console.log('');
  console.log('🎯 DIAGNOSIS COMPLETE:');
  console.log('');
  
  if (!totalError && !unreadError && !markAllError && !finalUnreadError) {
    console.log('✅ DATABASE OPERATIONS ARE WORKING CORRECTLY');
    console.log('');
    console.log('🔍 THE ISSUE IS LIKELY IN FRONTEND:');
    console.log('1. UnifiedNotificationBell may be caching old data');
    console.log('2. Real-time subscriptions might not be triggering');
    console.log('3. State updates are not syncing between components');
    console.log('');
    console.log('🔧 SOLUTION:');
    console.log('1. Add useEffect to refresh on focus');
    console.log('2. Improve real-time subscription handling');
    console.log('3. Force state refresh after mark as read operations');
  } else {
    console.log('❌ DATABASE ISSUES DETECTED');
    console.log('Need to fix RLS policies first');
  }
}

diagnoseBadgeIssue();
