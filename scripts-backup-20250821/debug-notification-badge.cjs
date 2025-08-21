const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugNotificationBadgeIssue() {
  console.log('🔍 DEBUGGING NOTIFICATION BADGE ISSUE...');
  console.log('=======================================');
  
  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
  
  // 1. Check current notification state
  console.log('\n1. CHECKING CURRENT NOTIFICATION STATE:');
  
  const { data: allNotifications, error: fetchError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false });
  
  if (fetchError) {
    console.log('❌ Error fetching notifications:', fetchError);
    return;
  }
  
  const totalCount = allNotifications?.length || 0;
  const unreadCount = allNotifications?.filter(n => !n.is_read).length || 0;
  const readCount = allNotifications?.filter(n => n.is_read).length || 0;
  
  console.log(`📊 Total notifications: ${totalCount}`);
  console.log(`🔴 Unread notifications: ${unreadCount}`);
  console.log(`✅ Read notifications: ${readCount}`);
  
  if (totalCount > 0) {
    console.log('\n📋 NOTIFICATION DETAILS:');
    allNotifications?.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   ID: ${notif.id}`);
      console.log(`   Status: ${notif.is_read ? '✅ Read' : '🔴 Unread'}`);
      console.log(`   Created: ${new Date(notif.created_at).toLocaleString()}`);
      console.log('');
    });
  }
  
  // 2. Create test notification to verify system
  console.log('2. CREATING TEST NOTIFICATION...');
  
  const { data: newNotificationId, error: createError } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'debug_test',
      p_user_id: testUserId,
      p_title: '🔧 Debug Test Notification',
      p_message: 'Testing notification badge sync. This notification should appear in both bell and full page.',
      p_icon: 'tool',
      p_priority: 'medium'
    });
  
  if (createError) {
    console.log('❌ Error creating test notification:', createError);
    return;
  }
  
  console.log('✅ Created test notification with ID:', newNotificationId);
  
  // 3. Verify the new notification
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  console.log('\n3. VERIFYING TEST NOTIFICATION...');
  
  const { data: updatedNotifications, error: verifyError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (verifyError) {
    console.log('❌ Error verifying notification:', verifyError);
    return;
  }
  
  const latestNotification = updatedNotifications?.[0];
  if (latestNotification && latestNotification.id === newNotificationId) {
    console.log('✅ Test notification verified:');
    console.log(`   Title: ${latestNotification.title}`);
    console.log(`   Status: ${latestNotification.is_read ? 'Read' : 'Unread'}`);
    console.log(`   Created: ${new Date(latestNotification.created_at).toLocaleString()}`);
  } else {
    console.log('❌ Test notification not found or ID mismatch');
  }
  
  // 4. Test marking as read
  console.log('\n4. TESTING MARK AS READ FUNCTIONALITY...');
  
  const { error: markReadError } = await supabase
    .from('challenge_notifications')
    .update({ is_read: true })
    .eq('id', newNotificationId)
    .eq('user_id', testUserId);
  
  if (markReadError) {
    console.log('❌ Error marking notification as read:', markReadError);
  } else {
    console.log('✅ Successfully marked test notification as read');
  }
  
  // 5. Final count check
  console.log('\n5. FINAL COUNT CHECK...');
  
  const { data: finalNotifications, error: finalError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUserId);
  
  if (finalError) {
    console.log('❌ Error in final check:', finalError);
    return;
  }
  
  const finalTotal = finalNotifications?.length || 0;
  const finalUnread = finalNotifications?.filter(n => !n.is_read).length || 0;
  
  console.log(`📊 Final total: ${finalTotal}`);
  console.log(`🔴 Final unread: ${finalUnread}`);
  
  // 6. Clean up test notification
  console.log('\n6. CLEANING UP TEST NOTIFICATION...');
  
  const { error: deleteError } = await supabase
    .from('challenge_notifications')
    .delete()
    .eq('id', newNotificationId);
  
  if (deleteError) {
    console.log('❌ Error deleting test notification:', deleteError);
  } else {
    console.log('✅ Test notification cleaned up');
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('==============');
  
  if (finalUnread > 0) {
    console.log('🔴 ISSUE FOUND: You have unread notifications but badge might not be syncing');
    console.log('');
    console.log('💡 POSSIBLE CAUSES:');
    console.log('1. Real-time subscription not working between components');
    console.log('2. State not updating after mark-as-read operations');
    console.log('3. Different data sources between UnifiedNotificationBell and NotificationsFullPage');
    console.log('4. Caching issues in the frontend');
    console.log('');
    console.log('🔧 SOLUTIONS TO TRY:');
    console.log('1. Refresh the page completely');
    console.log('2. Check browser developer tools for real-time subscription errors');
    console.log('3. Verify that both components use the same data fetching logic');
    console.log('4. Implement shared state management for notification count');
  } else {
    console.log('✅ NO UNREAD NOTIFICATIONS: Badge should show 0 or not appear');
    console.log('');
    console.log('❓ IF BADGE STILL SHOWS NUMBER:');
    console.log('1. The frontend might be caching old state');
    console.log('2. Try hard refresh (Ctrl+Shift+R)');
    console.log('3. Check if UnifiedNotificationBell is subscribed to real-time updates');
  }
  
  console.log('\n📱 TESTING STEPS:');
  console.log('================');
  console.log('1. Open http://localhost:8000 in browser');
  console.log('2. Login with your account');
  console.log('3. Check notification bell badge number');
  console.log('4. Click bell to open notifications page');
  console.log('5. Mark a notification as read');
  console.log('6. Go back and check if bell badge updated');
  console.log('7. If badge still shows wrong number, try hard refresh');
}

debugNotificationBadgeIssue();
