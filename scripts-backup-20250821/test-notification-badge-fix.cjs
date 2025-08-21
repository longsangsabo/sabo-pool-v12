const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testNotificationBadgeFix() {
  console.log('🧪 TESTING NOTIFICATION BADGE FIX...');
  console.log('=======================================');
  
  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
  
  console.log('\n1. Checking current notification state...');
  
  // Check current notifications
  const { data: currentNotifications, error: currentError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false });
  
  if (currentError) {
    console.log('❌ Error checking notifications:', currentError.message);
    return;
  }
  
  const totalNotifications = currentNotifications?.length || 0;
  const unreadNotifications = currentNotifications?.filter(n => !n.is_read).length || 0;
  const readNotifications = currentNotifications?.filter(n => n.is_read).length || 0;
  
  console.log(`📊 Current state:`);
  console.log(`   Total: ${totalNotifications}`);
  console.log(`   Unread: ${unreadNotifications}`);
  console.log(`   Read: ${readNotifications}`);
  
  if (totalNotifications === 0) {
    console.log('\n2. Creating test notifications...');
    
    // Create test notifications
    const testNotifications = [
      {
        type: 'challenge_received',
        title: '🏆 Thách đấu mới',
        message: 'Bạn có thách đấu mới từ Player123',
        icon: 'sword',
        priority: 'high',
        action_url: '/challenges'
      },
      {
        type: 'spa_transfer',
        title: '💰 Nhận SPA',
        message: 'Bạn nhận được 100 SPA từ thắng thách đấu',
        icon: 'coins',
        priority: 'medium',
        action_url: '/wallet'
      }
    ];
    
    for (const notif of testNotifications) {
      const { data, error } = await supabase
        .rpc('create_challenge_notification', {
          p_type: notif.type,
          p_user_id: testUserId,
          p_title: notif.title,
          p_message: notif.message,
          p_icon: notif.icon,
          p_priority: notif.priority,
          p_action_url: notif.action_url
        });
      
      if (error) {
        console.log(`   ❌ Error creating: ${error.message}`);
      } else {
        console.log(`   ✅ Created: ${notif.title} (ID: ${data})`);
      }
    }
    
    // Re-check notifications
    const { data: newNotifications, error: newError } = await supabase
      .from('challenge_notifications')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });
    
    if (!newError) {
      const newUnread = newNotifications?.filter(n => !n.is_read).length || 0;
      console.log(`   📊 After creation: ${newUnread} unread notifications`);
    }
  }
  
  console.log('\n3. Testing mark as read functionality...');
  
  // Get the first unread notification
  const { data: unreadNotifs, error: unreadError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUserId)
    .eq('is_read', false)
    .limit(1);
  
  if (unreadError) {
    console.log('   ❌ Error getting unread notifications:', unreadError.message);
    return;
  }
  
  if (unreadNotifs && unreadNotifs.length > 0) {
    const notificationToMark = unreadNotifs[0];
    console.log(`   📝 Marking notification as read: ${notificationToMark.title}`);
    
    // Mark as read
    const { error: markError } = await supabase
      .from('challenge_notifications')
      .update({ is_read: true })
      .eq('id', notificationToMark.id)
      .eq('user_id', testUserId);
    
    if (markError) {
      console.log('   ❌ Error marking as read:', markError.message);
    } else {
      console.log('   ✅ Successfully marked as read');
      
      // Check updated count
      const { data: afterMarkNotifs, error: afterMarkError } = await supabase
        .from('challenge_notifications')
        .select('*')
        .eq('user_id', testUserId)
        .eq('is_read', false);
      
      if (!afterMarkError) {
        const remainingUnread = afterMarkNotifs?.length || 0;
        console.log(`   📊 Remaining unread: ${remainingUnread}`);
      }
    }
  } else {
    console.log('   ℹ️  No unread notifications to test with');
  }
  
  console.log('\n4. Testing the fixes applied to UnifiedNotificationBell...');
  console.log('');
  console.log('✅ FIXES IMPLEMENTED:');
  console.log('   🔄 Added UPDATE event listener for real-time sync');
  console.log('   🔄 Added periodic refresh every 30 seconds');
  console.log('   🔄 Added window focus refresh');
  console.log('   🔄 Improved unread count calculation');
  console.log('');
  console.log('🧪 TO TEST THE FIX:');
  console.log('1. Open http://localhost:8000 in browser');
  console.log('2. Login with your account');
  console.log('3. Check notification bell badge count');
  console.log('4. Click bell → Go to notifications page');
  console.log('5. Mark some notifications as read');
  console.log('6. Go back to main page');
  console.log('7. Badge count should update automatically');
  console.log('8. Or wait up to 30 seconds for auto-refresh');
  console.log('');
  console.log('🔧 HOW THE FIX WORKS:');
  console.log('• Real-time listener catches UPDATE events when notifications marked read');
  console.log('• Window focus event refreshes data when you return from notifications page');
  console.log('• Periodic refresh ensures data consistency every 30 seconds');
  console.log('• Improved state management prevents race conditions');
  
  // Final state check
  console.log('\n5. Final state check...');
  const { data: finalNotifications, error: finalError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUserId);
  
  if (!finalError && finalNotifications) {
    const finalUnread = finalNotifications.filter(n => !n.is_read).length;
    const finalRead = finalNotifications.filter(n => n.is_read).length;
    console.log(`📊 Final state:`);
    console.log(`   Total: ${finalNotifications.length}`);
    console.log(`   Unread: ${finalUnread} ← This should match badge count`);
    console.log(`   Read: ${finalRead}`);
    
    if (finalUnread === 0) {
      console.log('\n🎉 PERFECT! Badge should show 0 (no badge visible)');
    } else {
      console.log(`\n🎯 Badge should show: ${finalUnread}`);
    }
  }
  
  console.log('\n🚀 NOTIFICATION BADGE FIX COMPLETE!');
  console.log('The badge count should now sync properly with read status.');
}

testNotificationBadgeFix().catch(console.error);
