const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testNotificationBadgeSync() {
  console.log('🧪 TESTING NOTIFICATION BADGE SYNC FIX...');
  console.log('');

  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';

  console.log('1. Creating test notifications...');
  
  const notificationIds = [];

  // Create 3 unread notifications
  for (let i = 1; i <= 3; i++) {
    const { data: id, error } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'sync_test',
        p_user_id: testUserId,
        p_title: `🔔 Sync Test ${i}`,
        p_message: `Testing notification badge sync - notification ${i}`,
        p_icon: 'test',
        p_priority: 'medium'
      });

    if (!error) {
      notificationIds.push(id);
      console.log(`   ✅ Created notification ${i}: ${id.slice(0,8)}...`);
    } else {
      console.log(`   ❌ Failed to create notification ${i}:`, error.message);
    }
  }

  console.log('');
  console.log('2. Verifying initial state...');

  // Check total and unread count
  const { data: totalNotifications, error: totalError } = await supabase
    .from('challenge_notifications')
    .select('id, title, is_read')
    .eq('user_id', testUserId);

  if (totalError) {
    console.log('❌ Failed to query notifications:', totalError.message);
    return;
  }

  const unreadCount = totalNotifications?.filter(n => !n.is_read).length || 0;
  console.log(`✅ Total notifications: ${totalNotifications?.length || 0}`);
  console.log(`✅ Unread notifications: ${unreadCount}`);

  if (unreadCount > 0) {
    console.log('');
    console.log('🎯 EXPECTED BEHAVIOR IN FRONTEND:');
    console.log(`• Notification bell should show red badge with "${unreadCount}"`);
    console.log('• When you mark notifications as read, badge should decrease');
    console.log('• When you mark all as read, badge should disappear');
    console.log('• When you refresh page/focus window, count should sync correctly');
  }

  console.log('');
  console.log('3. Testing mark one as read...');

  if (notificationIds.length > 0) {
    const firstId = notificationIds[0];
    const { error: markError } = await supabase
      .from('challenge_notifications')
      .update({ is_read: true })
      .eq('id', firstId);

    if (markError) {
      console.log('❌ Failed to mark notification as read:', markError.message);
    } else {
      console.log(`✅ Marked notification ${firstId.slice(0,8)}... as read`);
      
      // Check new unread count
      const { data: afterMarkData } = await supabase
        .from('challenge_notifications')
        .select('id')
        .eq('user_id', testUserId)
        .eq('is_read', false);

      const newUnreadCount = afterMarkData?.length || 0;
      console.log(`✅ New unread count: ${newUnreadCount}`);
      console.log(`🎯 Badge should now show "${newUnreadCount}"`);
    }
  }

  console.log('');
  console.log('4. Testing mark all as read...');

  const { error: markAllError } = await supabase
    .from('challenge_notifications')
    .update({ is_read: true })
    .eq('user_id', testUserId)
    .eq('is_read', false);

  if (markAllError) {
    console.log('❌ Failed to mark all as read:', markAllError.message);
  } else {
    console.log('✅ Marked all notifications as read');
    
    // Check final unread count
    const { data: finalData } = await supabase
      .from('challenge_notifications')
      .select('id')
      .eq('user_id', testUserId)
      .eq('is_read', false);

    const finalUnreadCount = finalData?.length || 0;
    console.log(`✅ Final unread count: ${finalUnreadCount}`);
    console.log('🎯 Badge should now be hidden (no unread notifications)');
  }

  console.log('');
  console.log('5. Cleanup test notifications...');

  for (const id of notificationIds) {
    await supabase
      .from('challenge_notifications')
      .delete()
      .eq('id', id);
  }
  console.log('✅ Cleaned up test notifications');

  console.log('');
  console.log('🎉 NOTIFICATION BADGE SYNC TEST COMPLETE!');
  console.log('');
  console.log('📱 TESTING INSTRUCTIONS:');
  console.log('1. Refresh your browser at http://localhost:8000');
  console.log('2. Login to your account');
  console.log('3. Check notification bell in header');
  console.log('4. Create new test notifications by running this script again');
  console.log('5. Verify badge count updates in real-time');
  console.log('6. Test marking notifications as read');
  console.log('7. Verify badge count decreases immediately');
  console.log('8. Test "mark all as read" functionality');
  console.log('9. Verify badge disappears when all read');
  console.log('');
  console.log('🔧 IMPROVEMENTS MADE:');
  console.log('✅ Optimistic UI updates (immediate response)');
  console.log('✅ Force refresh on window focus');
  console.log('✅ Force refresh on page visibility change'); 
  console.log('✅ Better error handling with state reversion');
  console.log('✅ Enhanced logging for debugging');
  console.log('✅ Periodic force refresh every 30 seconds');
}

testNotificationBadgeSync();
