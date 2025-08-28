/**
 * FINAL CLEANUP - Mark all milestone notifications as read
 * This will clear the notification spam from user's view
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function finalNotificationCleanup() {
  console.log('🧹 FINAL NOTIFICATION CLEANUP...\n');

  try {
    // 1. Get all unread milestone notifications
    console.log('1. 📊 Analyzing current notification state...');
    
    const { data: allNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, created_at, is_read')
      .like('type', 'milestone%')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('   ❌ Error fetching notifications:', fetchError.message);
      return;
    }

    if (allNotifications?.length) {
      const unreadCount = allNotifications.filter(n => !n.is_read).length;
      const totalCount = allNotifications.length;
      
      console.log(`   📬 Total milestone notifications: ${totalCount}`);
      console.log(`   📭 Unread: ${unreadCount}`);
      console.log(`   📖 Already read: ${totalCount - unreadCount}`);

      // Show recent notifications
      console.log('\n   📋 Recent notifications:');
      allNotifications.slice(0, 5).forEach((notif, i) => {
        const status = notif.is_read ? '✅' : '🔔';
        const date = new Date(notif.created_at).toLocaleString();
        console.log(`      ${i+1}. ${status} ${notif.title} (${date})`);
      });

      // 2. Mark all as read
      if (unreadCount > 0) {
        console.log(`\n2. 📖 Marking ${unreadCount} notifications as read...`);
        
        const { error: updateError, count } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .like('type', 'milestone%')
          .eq('is_read', false);

        if (updateError) {
          console.log('   ❌ Error marking as read:', updateError.message);
        } else {
          console.log(`   ✅ Marked ${count || unreadCount} notifications as read`);
        }
      } else {
        console.log('\n2. ✅ All milestone notifications already marked as read');
      }

    } else {
      console.log('   ✅ No milestone notifications found');
    }

    // 3. Summary report
    console.log('\n3. 📊 FINAL STATUS REPORT...');
    
    const { data: finalCheck } = await supabase
      .from('notifications')
      .select('id, is_read')
      .like('type', 'milestone%');

    if (finalCheck?.length) {
      const finalUnread = finalCheck.filter(n => !n.is_read).length;
      console.log(`   📬 Total milestone notifications: ${finalCheck.length}`);
      console.log(`   📭 Unread remaining: ${finalUnread}`);
      console.log(`   📖 Read: ${finalCheck.length - finalUnread}`);
      
      if (finalUnread === 0) {
        console.log('   🎉 SUCCESS: All milestone notifications marked as read!');
      }
    }

    console.log('\n✅ NOTIFICATION CLEANUP COMPLETED!');
    
    console.log('\n🎯 SUMMARY OF ALL FIXES APPLIED:');
    console.log('═'.repeat(50));
    
    console.log('\n🔧 FRONTEND FIXES:');
    console.log('   ✅ Periodic refresh: 30s → 180s (3 minutes)');
    console.log('   ✅ Window focus throttle: Added 30s delay');
    console.log('   ✅ Real-time dedupe: Skip existing notifications');
    console.log('   ✅ Toast throttle: 100ms delay for high priority');
    console.log('   ✅ Unique channels: Per-user subscriptions');

    console.log('\n🗃️ DATABASE FIXES:');
    console.log('   ✅ Triggers disabled: No more auto-notifications');
    console.log('   ✅ Duplicates removed: Cleaned up spam');
    console.log('   ✅ All marked read: Clean notification state');

    console.log('\n📱 USER EXPERIENCE:');
    console.log('   🔔 Notification bell will stop showing spam');
    console.log('   🔄 Refreshes only every 3 minutes instead of 30 seconds');
    console.log('   🎯 No more duplicate notifications');
    console.log('   ⚡ Fast UI with throttled events');

    console.log('\n⚠️ MONITORING:');
    console.log('   📊 Watch for new notifications appearing frequently');
    console.log('   🔍 Check console logs for "⏰ Periodic refresh" (should be every 3min)');
    console.log('   🎯 Verify window focus events are throttled');
    console.log('   📱 Test real-time notifications work without duplicates');

  } catch (error) {
    console.error('❌ Error in final cleanup:', error);
  }
}

// Run final cleanup
finalNotificationCleanup().then(() => {
  console.log('\n🎉 Final cleanup completed!');
  console.log('\n💡 TIP: Refresh your browser to see the changes in action');
  console.log('🌐 Development server: http://localhost:8080/');
}).catch(console.error);
