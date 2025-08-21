const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 CHECKING NOTIFICATION SYSTEM STATUS...');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkNotificationStatus() {
  try {
    // 1. Check recent challenges with status changes
    console.log('\n🔄 1. Checking recent challenge activity...');
    const { data: recentChallenges, error: recentError } = await supabase
      .from('challenges')
      .select('id, status, challenger_id, opponent_id, created_at, responded_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.log('❌ Recent challenges error:', recentError.message);
      return;
    }

    console.log(`🎯 Found ${recentChallenges?.length || 0} recent challenges:`);
    recentChallenges?.forEach((c, i) => {
      console.log(`  ${i+1}. ID: ${c.id.slice(0,8)}...`);
      console.log(`     Status: ${c.status}`);
      console.log(`     Challenger: ${c.challenger_id?.slice(0,8) || 'NULL'}...`);
      console.log(`     Opponent: ${c.opponent_id?.slice(0,8) || 'NULL'}...`);
      console.log(`     Created: ${c.created_at}`);
      if (c.responded_at) {
        console.log(`     Responded: ${c.responded_at}`);
      }
      console.log('     ---');
    });

    // 2. Check notifications table
    console.log('\n📨 2. Checking challenge_notifications table...');
    const { data: notifications, error: notifError } = await supabase
      .from('challenge_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (notifError) {
      console.log('❌ Notifications table error:', notifError.message);
      
      // Test FK constraint by trying to insert
      console.log('\n🧪 3. Testing FK constraint...');
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);
        
      if (!profileError && profiles && profiles.length > 0) {
        const testUserId = profiles[0].user_id;
        console.log(`Testing with user_id: ${testUserId.slice(0,8)}...`);
        
        const { error: insertError } = await supabase
          .from('challenge_notifications')
          .insert({
            type: 'test_fk',
            user_id: testUserId,
            title: 'FK Test',
            message: 'Testing FK constraint',
            icon: 'bell',
            priority: 'medium'
          });
          
        if (insertError) {
          console.log('❌ FK CONSTRAINT ERROR:', insertError.message);
          console.log('🔧 SOLUTION: Run final-fk-constraint-fix.sql in Supabase Dashboard');
        } else {
          console.log('✅ FK Constraint working! Cleaning up test...');
          await supabase
            .from('challenge_notifications')
            .delete()
            .eq('type', 'test_fk')
            .eq('user_id', testUserId);
        }
      }
    } else {
      console.log(`📬 Found ${notifications?.length || 0} notifications:`);
      notifications?.forEach((n, i) => {
        console.log(`  ${i+1}. Type: ${n.type}`);
        console.log(`     User: ${n.user_id?.slice(0,8)}...`);
        console.log(`     Title: ${n.title}`);
        console.log(`     Created: ${n.created_at}`);
        console.log('     ---');
      });
      
      // If notifications exist but we have recent accepted challenges, check for missing notifications
      const acceptedChallenges = recentChallenges?.filter(c => c.status === 'accepted' && c.responded_at) || [];
      if (acceptedChallenges.length > 0) {
        console.log(`\n🎉 Found ${acceptedChallenges.length} accepted challenges:`);
        
        for (const challenge of acceptedChallenges) {
          console.log(`  Challenge ${challenge.id.slice(0,8)}... accepted at ${challenge.responded_at}`);
          
          // Check if notifications exist for this challenge participants
          const { data: relatedNotifications } = await supabase
            .from('challenge_notifications')
            .select('type, title, created_at')
            .in('user_id', [challenge.challenger_id, challenge.opponent_id])
            .gte('created_at', challenge.responded_at);
            
          console.log(`    Related notifications since acceptance: ${relatedNotifications?.length || 0}`);
          relatedNotifications?.forEach(n => {
            console.log(`      - ${n.type}: ${n.title}`);
          });
        }
      }
    }

    // 4. Check if challengeNotificationEventHandler service exists
    console.log('\n🔔 4. Checking notification handler service...');
    try {
      const fs = require('fs');
      const handlerPath = './src/services/challengeNotificationEventHandler.ts';
      if (fs.existsSync(handlerPath)) {
        console.log('✅ challengeNotificationEventHandler service exists');
        const content = fs.readFileSync(handlerPath, 'utf8');
        if (content.includes('handleChallengeCreated')) {
          console.log('✅ handleChallengeCreated method found');
        }
        if (content.includes('handleChallengeStatusChanged')) {
          console.log('✅ handleChallengeStatusChanged method found');
        }
      } else {
        console.log('❌ challengeNotificationEventHandler service NOT FOUND');
      }
    } catch (err) {
      console.log('⚠️ Could not check handler service:', err.message);
    }

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    const hasAcceptedChallenges = recentChallenges?.some(c => c.status === 'accepted') || false;
    const hasNotifications = (notifications?.length || 0) > 0;
    const hasFK_Error = notifError && notifError.message.includes('violates foreign key constraint');
    
    if (hasFK_Error) {
      console.log('🚨 PRIMARY ISSUE: FK constraint error prevents notifications');
      console.log('🔧 ACTION NEEDED: Run final-fk-constraint-fix.sql in Supabase Dashboard');
    } else if (hasAcceptedChallenges && !hasNotifications) {
      console.log('⚠️ ISSUE: Challenges accepted but no notifications created');
      console.log('🔧 ACTION NEEDED: Check notification triggers or handlers');
    } else if (hasNotifications) {
      console.log('✅ Notification system appears to be working');
    } else {
      console.log('ℹ️ No recent activity to evaluate notification system');
    }

  } catch (error) {
    console.log('❌ Check failed:', error.message);
  }
}

checkNotificationStatus();
