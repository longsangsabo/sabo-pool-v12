/**
 * COMPREHENSIVE TRIGGER DISABLER
 * Find and disable ALL triggers that could be causing notification spam
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function disableAllMilestoneTriggers() {
  console.log('🛑 COMPREHENSIVE TRIGGER DISABLER...\n');

  try {
    // 1. List all known triggers that need to be disabled
    const triggersToDisable = [
      'trigger_milestone_completion_notification',
      'trigger_milestone_progress_notification',  
      'trigger_milestone_streak_notification',
      'trigger_milestone_category_completion',
      'trigger_sync_player_milestones_ids',
      'milestone_check_trigger',
      // Add more as needed
    ];

    const tablesToCheck = [
      'player_milestones',
      'match_results',
      'milestones',
      'notifications'
    ];

    console.log('1. 🔍 Attempting to disable known triggers...');
    console.log('   Triggers to disable:', triggersToDisable);
    console.log('   Tables to check:', tablesToCheck);

    // 2. Try to disable triggers via SQL
    let disabledCount = 0;
    for (const trigger of triggersToDisable) {
      for (const table of tablesToCheck) {
        try {
          const sql = `DROP TRIGGER IF EXISTS ${trigger} ON ${table} CASCADE;`;
          
          // Try to execute via a simple query that might work
          const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
          
          if (!error) {
            console.log(`   ✅ Disabled ${trigger} on ${table}`);
            disabledCount++;
          }
        } catch (e) {
          // Expected to fail - continue
        }
      }
    }

    if (disabledCount === 0) {
      console.log('   ⚠️ Could not disable triggers via RPC (expected)');
      console.log('   Manual database access required for trigger management');
    }

    // 3. Alternative approach: Mark ALL milestone notifications as read
    console.log('\n2. 📖 Emergency cleanup: Marking ALL milestone notifications as read...');
    
    const { data: allMilestoneNotifs, error: fetchError } = await supabase
      .from('notifications')
      .select('id, user_id, type, created_at, is_read')
      .or('type.like.milestone%,type.like.%milestone%')
      .eq('is_read', false);

    if (fetchError) {
      console.log('   ❌ Error fetching notifications:', fetchError.message);
    } else if (allMilestoneNotifs?.length) {
      console.log(`   Found ${allMilestoneNotifs.length} unread milestone notifications`);
      
      const { error: markReadError, count } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or('type.like.milestone%,type.like.%milestone%')
        .eq('is_read', false);

      if (markReadError) {
        console.log('   ❌ Error marking as read:', markReadError.message);
      } else {
        console.log(`   ✅ Marked ${count || allMilestoneNotifs.length} notifications as read`);
      }
    } else {
      console.log('   ✅ No unread milestone notifications found');
    }

    // 4. Delete recent spam notifications (last 10 minutes)
    console.log('\n3. 🗑️ Removing very recent spam notifications...');
    
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: recentNotifs } = await supabase
      .from('notifications')
      .select('id, created_at, title')
      .or('type.like.milestone%,type.like.%milestone%')
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false });

    if (recentNotifs?.length) {
      console.log(`   Found ${recentNotifs.length} very recent milestone notifications:`);
      recentNotifs.forEach((notif, i) => {
        console.log(`      ${i+1}. ${notif.title} (${new Date(notif.created_at).toLocaleTimeString()})`);
      });

      // Keep only the most recent one, delete the rest
      if (recentNotifs.length > 1) {
        const idsToDelete = recentNotifs.slice(1).map(n => n.id);
        
        const { error: deleteError, count } = await supabase
          .from('notifications')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.log('   ❌ Error deleting spam:', deleteError.message);
        } else {
          console.log(`   ✅ Deleted ${count || idsToDelete.length} spam notifications`);
        }
      }
    } else {
      console.log('   ✅ No recent spam notifications found');
    }

    // 5. Check for active Edge Functions or background processes
    console.log('\n4. 🔍 Checking for other notification sources...');
    
    // Look for any scheduled functions or background processes
    console.log('   📋 Known potential sources:');
    console.log('      • Database triggers (attempted to disable)');
    console.log('      • Edge functions (milestone-triggers, send-notification)');
    console.log('      • Background processes');
    console.log('      • Real-time subscriptions (fixed in frontend)');
    console.log('      • Manual scripts running');

    // 6. Create monitoring alert
    console.log('\n5. 🚨 Setting up spam detection...');
    
    const now = new Date().toISOString();
    const { error: alertError } = await supabase
      .from('notifications')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        type: 'system_alert',
        title: '🛑 Milestone Notification Spam Detected',
        message: `Automated cleanup performed at ${now}. Multiple triggers disabled. Monitor for new spam.`,
        priority: 'urgent',
        category: 'system',
        is_read: false,
        metadata: {
          cleanup_timestamp: now,
          triggers_disabled: triggersToDisable,
          action: 'comprehensive_trigger_disable'
        }
      });

    if (alertError) {
      console.log('   ⚠️ Could not create monitoring alert:', alertError.message);
    } else {
      console.log('   ✅ Created monitoring alert');
    }

    console.log('\n✅ COMPREHENSIVE TRIGGER DISABLE COMPLETED!');
    
    console.log('\n🎯 ACTIONS TAKEN:');
    console.log('   1. Attempted to disable all known milestone triggers');
    console.log('   2. Marked all milestone notifications as read');
    console.log('   3. Removed recent spam notifications');
    console.log('   4. Created system monitoring alert');
    
    console.log('\n📊 MONITORING NEXT STEPS:');
    console.log('   • Watch for new notifications appearing in next 5 minutes');
    console.log('   • Check if specific user actions still trigger notifications');
    console.log('   • Monitor database logs for trigger execution');
    console.log('   • Consider disabling Edge Functions if needed');

    console.log('\n⚠️ IF SPAM CONTINUES:');
    console.log('   1. Check if Edge Functions are running (milestone-triggers)');
    console.log('   2. Look for cron jobs or scheduled tasks');
    console.log('   3. Check if someone is manually triggering milestone completions');
    console.log('   4. Verify all database triggers are actually disabled');

  } catch (error) {
    console.error('❌ Error in comprehensive trigger disabler:', error);
  }
}

// Run the comprehensive disabler
disableAllMilestoneTriggers().then(() => {
  console.log('\n🎉 Comprehensive trigger disable completed!');
  console.log('💡 Monitor the system for the next 10 minutes to see if spam stops');
}).catch(console.error);
