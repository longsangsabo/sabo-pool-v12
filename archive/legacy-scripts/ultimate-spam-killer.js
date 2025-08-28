/**
 * ULTIMATE MILESTONE SPAM KILLER
 * This script disables the call_milestone_triggers function that's calling Edge Functions
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function killMilestoneSpam() {
  console.log('☠️ ULTIMATE MILESTONE SPAM KILLER...\n');

  try {
    // 1. Replace the call_milestone_triggers function with a no-op version
    console.log('1. 🛑 Replacing call_milestone_triggers function with no-op...');
    
    const noOpFunctionSQL = `
      -- Replace call_milestone_triggers with no-op to stop spam
      CREATE OR REPLACE FUNCTION public.call_milestone_triggers(p_events JSONB)
      RETURNS void AS $$
      BEGIN
        -- NO-OP: This function has been disabled to prevent notification spam
        -- Original function was calling Edge Functions that trigger notifications
        RAISE NOTICE 'call_milestone_triggers disabled to prevent spam. Events ignored: %', p_events;
        RETURN;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Also disable the array version
      CREATE OR REPLACE FUNCTION public.call_milestone_triggers(events_data jsonb[])
      RETURNS jsonb AS $$
      BEGIN
        -- NO-OP: This function has been disabled to prevent notification spam
        RAISE NOTICE 'call_milestone_triggers (array) disabled to prevent spam. Events count: %', array_length(events_data, 1);
        RETURN jsonb_build_object('disabled', true, 'events_ignored', array_length(events_data, 1));
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Try multiple approaches to execute this
    const approaches = [
      // Approach 1: Try direct RPC
      () => supabase.rpc('exec_sql', { sql_query: noOpFunctionSQL }),
      
      // Approach 2: Try as a stored procedure
      () => supabase.rpc('disable_milestone_triggers'),
      
      // Approach 3: Create the no-op function via a wrapper
      () => supabase.rpc('create_noop_milestone_function')
    ];

    let success = false;
    for (const approach of approaches) {
      try {
        const { error } = await approach();
        if (!error) {
          console.log('   ✅ Successfully disabled call_milestone_triggers function!');
          success = true;
          break;
        }
      } catch (e) {
        // Continue to next approach
      }
    }

    if (!success) {
      console.log('   ⚠️ Could not disable function via RPC (expected)');
      console.log('   The function is still active in database');
    }

    // 2. Emergency: Delete all new milestone notifications from last hour
    console.log('\n2. 🗑️ Emergency cleanup - Remove all notifications from last hour...');
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentNotifs, error: fetchError } = await supabase
      .from('notifications')
      .select('id, created_at, title, type')
      .or('type.like.milestone%,title.ilike.%milestone%')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('   ❌ Error fetching recent notifications:', fetchError.message);
    } else if (recentNotifs?.length) {
      console.log(`   Found ${recentNotifs.length} milestone notifications from last hour:`);
      recentNotifs.slice(0, 10).forEach((notif, i) => {
        const time = new Date(notif.created_at).toLocaleTimeString();
        console.log(`      ${i+1}. ${notif.title} (${time})`);
      });

      // Delete them all
      const { error: deleteError, count } = await supabase
        .from('notifications')
        .delete()
        .in('id', recentNotifs.map(n => n.id));

      if (deleteError) {
        console.log('   ❌ Error deleting notifications:', deleteError.message);
      } else {
        console.log(`   ✅ Deleted ${count || recentNotifs.length} spam notifications`);
      }
    } else {
      console.log('   ✅ No recent milestone notifications found');
    }

    // 3. Check for pattern - is spam still happening?
    console.log('\n3. 🔍 Checking for ongoing spam pattern...');
    
    const lastMinute = new Date(Date.now() - 60 * 1000).toISOString();
    
    const { data: veryRecentNotifs } = await supabase
      .from('notifications')
      .select('id, created_at, title')
      .or('type.like.milestone%,title.ilike.%milestone%')
      .gte('created_at', lastMinute)
      .order('created_at', { ascending: false });

    if (veryRecentNotifs?.length) {
      console.log(`   🚨 WARNING: ${veryRecentNotifs.length} notifications created in last minute!`);
      console.log('   Spam is still happening. Additional measures needed.');
      
      veryRecentNotifs.forEach((notif, i) => {
        const time = new Date(notif.created_at).toLocaleTimeString();
        console.log(`      ${i+1}. ${notif.title} (${time})`);
      });
    } else {
      console.log('   ✅ No notifications in last minute - spam may have stopped');
    }

    // 4. Create a comprehensive status report
    console.log('\n4. 📊 Creating status report...');
    
    const { data: allMilestoneNotifs } = await supabase
      .from('notifications')
      .select('id, created_at, is_read, type')
      .or('type.like.milestone%,title.ilike.%milestone%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (allMilestoneNotifs?.length) {
      const unreadCount = allMilestoneNotifs.filter(n => !n.is_read).length;
      const last24h = allMilestoneNotifs.filter(n => 
        new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      
      console.log(`   📈 Total milestone notifications (recent 50): ${allMilestoneNotifs.length}`);
      console.log(`   📭 Unread: ${unreadCount}`);
      console.log(`   📅 Created in last 24h: ${last24h}`);
      
      // Check if notifications are still being created
      const latest = allMilestoneNotifs[0];
      if (latest) {
        const latestTime = new Date(latest.created_at);
        const minutesAgo = Math.floor((Date.now() - latestTime.getTime()) / 60000);
        console.log(`   🕐 Latest notification: ${minutesAgo} minutes ago`);
        
        if (minutesAgo < 5) {
          console.log('   🚨 Recent activity detected - spam may be ongoing');
        } else {
          console.log('   ✅ No recent activity - spam appears stopped');
        }
      }
    }

    console.log('\n☠️ ULTIMATE SPAM KILLER COMPLETED!');
    
    console.log('\n🎯 ACTIONS TAKEN:');
    console.log('   1. Attempted to disable call_milestone_triggers function');
    console.log('   2. Removed all milestone notifications from last hour');
    console.log('   3. Analyzed spam patterns');
    console.log('   4. Created comprehensive status report');
    
    console.log('\n🔍 NEXT STEPS FOR MONITORING:');
    console.log('   • Wait 5 minutes and check for new notifications');
    console.log('   • Monitor browser console for real-time notification spam');
    console.log('   • Check if specific user actions trigger new notifications');
    console.log('   • If spam continues, Edge Functions need to be disabled');

    console.log('\n⚡ IF SPAM STILL CONTINUES:');
    console.log('   1. Disable Edge Functions: milestone-triggers, milestone-event');
    console.log('   2. Check for cron jobs or background tasks');
    console.log('   3. Look for other triggers calling milestone functions');
    console.log('   4. Consider temporary database access to disable all triggers');

  } catch (error) {
    console.error('❌ Error in ultimate spam killer:', error);
  }
}

// Run the ultimate spam killer
killMilestoneSpam().then(() => {
  console.log('\n💀 Ultimate spam killer completed!');
  console.log('🕐 Please wait 5 minutes and monitor for new notifications');
}).catch(console.error);
