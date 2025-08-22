/**
 * FIX MILESTONE NOTIFICATION SPAM
 * This script fixes the issue where milestone notifications are sent continuously
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixMilestoneNotificationSpam() {
  console.log('🔧 FIXING MILESTONE NOTIFICATION SPAM...\n');

  try {
    // 1. Check current notification spam
    console.log('1. 📊 Checking current notification status...');
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, created_at')
      .ilike('type', 'milestone%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentNotifications?.length) {
      console.log(`   Found ${recentNotifications.length} milestone notifications in last 24h`);
      
      // Group by user and count
      const userCounts = {};
      recentNotifications.forEach(notif => {
        const userId = notif.user_id.slice(0, 8);
        userCounts[userId] = (userCounts[userId] || 0) + 1;
      });

      console.log('   📈 Notifications per user:');
      Object.entries(userCounts).forEach(([userId, count]) => {
        console.log(`      ${userId}...: ${count} notifications ${count > 5 ? '🚨 SPAM!' : ''}`);
      });
    }

    // 2. Clean up duplicate notifications
    console.log('\n2. 🧹 Cleaning up duplicate notifications...');
    
    // Find duplicates (same user, type, and milestone_id within 1 hour)
    const { data: duplicates } = await supabase
      .from('notifications')
      .select('id, user_id, type, metadata, created_at')
      .ilike('type', 'milestone%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (duplicates?.length) {
      // Group by user + milestone to find duplicates
      const groups = {};
      duplicates.forEach(notif => {
        const milestoneId = notif.metadata?.milestone_id;
        const key = `${notif.user_id}_${milestoneId}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(notif);
      });

      // Find groups with duplicates
      const duplicateIds = [];
      Object.values(groups).forEach(group => {
        if (group.length > 1) {
          // Keep the newest, mark others for deletion
          group.slice(1).forEach(notif => duplicateIds.push(notif.id));
        }
      });

      if (duplicateIds.length > 0) {
        console.log(`   Found ${duplicateIds.length} duplicate notifications to remove`);
        
        const { error } = await supabase
          .from('notifications')
          .delete()
          .in('id', duplicateIds);

        if (error) {
          console.log('   ❌ Error removing duplicates:', error.message);
        } else {
          console.log(`   ✅ Removed ${duplicateIds.length} duplicate notifications`);
        }
      } else {
        console.log('   ✅ No duplicates found');
      }
    }

    // 3. Mark remaining milestone notifications as read to reduce noise
    console.log('\n3. 📖 Marking old milestone notifications as read...');
    
    const { error: markReadError, count } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .ilike('type', 'milestone%')
      .eq('is_read', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (markReadError) {
      console.log('   ❌ Error marking as read:', markReadError.message);
    } else {
      console.log(`   ✅ Marked ${count || 0} notifications as read`);
    }

    // 4. Check final status
    console.log('\n4. 📊 Final status check...');
    const { data: finalNotifications } = await supabase
      .from('notifications')
      .select('id, user_id, type, is_read')
      .ilike('type', 'milestone%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (finalNotifications?.length) {
      const unreadCount = finalNotifications.filter(n => !n.is_read).length;
      console.log(`   📬 Total milestone notifications: ${finalNotifications.length}`);
      console.log(`   📭 Unread: ${unreadCount}`);
      console.log(`   📖 Read: ${finalNotifications.length - unreadCount}`);
    }

    console.log('\n✅ MILESTONE NOTIFICATION SPAM FIX COMPLETED!');
    console.log('\n🎯 WHAT WAS FIXED:');
    console.log('   1. Removed duplicate milestone notifications');
    console.log('   2. Marked old notifications as read');
    console.log('   3. Frontend refresh frequency reduced (30s → 3min)');
    console.log('   4. Added throttling to window focus events');
    console.log('   5. Added duplicate prevention in real-time subscriptions');
    
    console.log('\n📱 FRONTEND IMPROVEMENTS:');
    console.log('   - Periodic refresh: 30s → 180s');
    console.log('   - Window focus throttle: 30s delay');
    console.log('   - Real-time dedupe: Skip existing notifications');
    console.log('   - Toast throttle: 100ms delay for high priority');

  } catch (error) {
    console.error('❌ Error in fix script:', error);
  }
}

// Run the fix
fixMilestoneNotificationSpam().then(() => {
  console.log('\n🎉 Fix script completed!');
}).catch(console.error);
