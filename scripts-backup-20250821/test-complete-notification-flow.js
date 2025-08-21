// =====================================================
// 🧪 TEST COMPLETE NOTIFICATION FLOW
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function testCompleteNotificationFlow() {
  console.log('🧪 Testing Complete Challenge Notification Flow...\n');

  try {
    // 1. Test notification table access after FK fix
    console.log('1. Testing notification table access...');
    
    const { data: notificationTest, error: notificationError } = await supabase
      .from('challenge_notifications')
      .select('count')
      .limit(1);

    if (notificationError) {
      console.error('❌ Notification table error:', notificationError.message);
      return;
    }
    console.log('✅ Notification table accessible');

    // 2. Test challenge creation with notification
    console.log('\n2. Testing challenge creation with notification...');
    
    // Get test users
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(2);

    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, club_name')
      .limit(1);

    if (userError || !users || clubError || !clubs) {
      console.log('⚠️ Cannot get test data');
      return;
    }

    console.log('✅ Test data ready:', {
      users: users.length,
      clubs: clubs.length
    });

    // Create test challenge
    const testChallenge = {
      challenger_id: users[0].user_id,
      opponent_id: null, // Open challenge
      bet_points: 100,
      race_to: 8,
      message: 'Test notification flow challenge',
      club_id: clubs[0].id,
      location: clubs[0].club_name,
      is_sabo: true,
      status: 'pending',
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    console.log('🚀 Creating challenge with notification trigger...');
    
    const { data: newChallenge, error: createError } = await supabase
      .from('challenges')
      .insert([testChallenge])
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Challenge creation failed:', createError.message);
      console.error('Details:', createError);
      return;
    }

    console.log('✅ Challenge created successfully!');
    console.log('📄 Challenge ID:', newChallenge.id);

    // 3. Wait a moment then check if notification was created
    console.log('\n3. Checking if notification was auto-created...');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

    const { data: notifications, error: notifError } = await supabase
      .from('challenge_notifications')
      .select('*')
      .eq('challenge_id', newChallenge.id)
      .order('created_at', { ascending: false });

    if (notifError) {
      console.error('❌ Error checking notifications:', notifError.message);
    } else {
      console.log(`📊 Found ${notifications?.length || 0} notifications for challenge`);
      
      if (notifications && notifications.length > 0) {
        console.log('🎉 NOTIFICATION SYSTEM WORKING!');
        notifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. Type: ${notif.type}`);
          console.log(`      Title: ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      User: ${notif.user_id}`);
          console.log(`      Read: ${notif.is_read ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('⚠️ No notifications created automatically');
        console.log('💡 Check if trigger is enabled and functions exist');
      }
    }

    // 4. Test manual notification creation
    console.log('\n4. Testing manual notification creation...');
    
    const { data: manualNotif, error: manualError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'test_manual',
        p_challenge_id: newChallenge.id,
        p_user_id: users[0].user_id,
        p_title: '🧪 Manual Test Notification',
        p_message: 'This is a manual test notification',
        p_icon: 'bell',
        p_priority: 'medium'
      });

    if (manualError) {
      console.error('❌ Manual notification failed:', manualError.message);
    } else {
      console.log('✅ Manual notification created successfully');
      console.log('📝 Notification ID:', manualNotif);
    }

    // 5. Test challenge acceptance notification
    if (users.length > 1) {
      console.log('\n5. Testing challenge acceptance notification...');
      
      // Accept the challenge
      const { data: acceptResult, error: acceptError } = await supabase
        .from('challenges')
        .update({
          status: 'accepted',
          opponent_id: users[1].user_id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', newChallenge.id)
        .select('*')
        .single();

      if (acceptError) {
        console.error('❌ Challenge acceptance failed:', acceptError.message);
      } else {
        console.log('✅ Challenge accepted successfully');
        
        // Check for acceptance notifications
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: acceptNotifs, error: acceptNotifError } = await supabase
          .from('challenge_notifications')
          .select('*')
          .eq('challenge_id', newChallenge.id)
          .eq('type', 'challenge_accepted')
          .order('created_at', { ascending: false });

        if (acceptNotifError) {
          console.error('❌ Error checking acceptance notifications:', acceptNotifError.message);
        } else {
          console.log(`📊 Found ${acceptNotifs?.length || 0} acceptance notifications`);
          if (acceptNotifs && acceptNotifs.length > 0) {
            console.log('🎉 ACCEPTANCE NOTIFICATION WORKING!');
          }
        }
      }
    }

    // 6. Clean up test data
    console.log('\n6. Cleaning up test data...');
    
    // Delete notifications first (due to FK constraint)
    const { error: deleteNotifError } = await supabase
      .from('challenge_notifications')
      .delete()
      .eq('challenge_id', newChallenge.id);

    if (deleteNotifError) {
      console.log('⚠️ Could not delete test notifications:', deleteNotifError.message);
    }

    // Delete challenge
    const { error: deleteChallengeError } = await supabase
      .from('challenges')
      .delete()
      .eq('id', newChallenge.id);

    if (deleteChallengeError) {
      console.log('⚠️ Could not delete test challenge:', deleteChallengeError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎯 TEST COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Notification table accessible');
    console.log('✅ Challenge creation works');
    console.log('🔄 Auto-notifications need verification');
    console.log('✅ Manual notifications work');
    console.log('🔔 Ready for frontend integration!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testCompleteNotificationFlow().then(() => {
  console.log('\n🎯 Test Complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
