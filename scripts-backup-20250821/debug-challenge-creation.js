// =====================================================
// 🧪 DEBUG CHALLENGE CREATION ISSUES
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function debugChallengeCreation() {
  console.log('🧪 Debugging Challenge Creation Issues...\n');

  try {
    // 1. Check if notification tables exist
    console.log('1. Checking notification system tables...');
    
    const { data: notificationTables, error: tableError } = await supabase
      .from('challenge_notifications')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ challenge_notifications table error:', tableError.message);
      console.log('🔧 Need to deploy notification schema first!');
    } else {
      console.log('✅ challenge_notifications table exists');
    }

    // 2. Check challenges table structure  
    console.log('\n2. Checking challenges table structure...');
    
    const { data: challenges, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .limit(1);

    if (challengeError) {
      console.error('❌ challenges table error:', challengeError.message);
      return;
    } else {
      console.log('✅ challenges table accessible');
      if (challenges && challenges.length > 0) {
        console.log('📋 Sample challenge structure:', Object.keys(challenges[0]));
      }
    }

    // 3. Check for database triggers
    console.log('\n3. Checking database triggers...');
    
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_triggers_info');
      
    if (triggerError) {
      console.log('⚠️ Cannot check triggers (function may not exist):', triggerError.message);
    } else {
      console.log('✅ Triggers info:', triggers);
    }

    // 4. Try to create a simple test challenge
    console.log('\n4. Testing challenge creation...');
    
    // First, get a user to test with
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(2);

    if (userError || !users || users.length === 0) {
      console.log('⚠️ No users found for testing');
      return;
    }

    console.log(`✅ Found ${users.length} users for testing`);

    // Get clubs for testing
    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, club_name')
      .limit(1);

    if (clubError || !clubs || clubs.length === 0) {
      console.log('⚠️ No clubs found for testing');
      return;
    }

    console.log('✅ Found club for testing:', clubs[0].club_name);

    // Try to create a test challenge
    const testChallenge = {
      challenger_id: users[0].user_id,
      opponent_id: null, // Open challenge
      bet_points: 100,
      race_to: 8,
      message: 'Debug test challenge',
      club_id: clubs[0].id,
      location: clubs[0].club_name,
      is_sabo: true,
      status: 'pending',
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    console.log('\n🚀 Creating test challenge...');
    console.log('📋 Challenge data:', testChallenge);

    const { data: newChallenge, error: createError } = await supabase
      .from('challenges')
      .insert([testChallenge])
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Challenge creation failed:', createError);
      console.error('Error details:', {
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        code: createError.code
      });
      
      // Check if it's a trigger/notification related error
      if (createError.message.includes('notification') || 
          createError.message.includes('trigger') ||
          createError.message.includes('function')) {
        console.log('\n🔍 DIAGNOSIS: Notification system trigger conflict detected!');
        console.log('💡 SOLUTION: Need to deploy notification schema or disable triggers');
      }
    } else {
      console.log('✅ Challenge created successfully!');
      console.log('📄 New challenge:', {
        id: newChallenge.id,
        challenger_id: newChallenge.challenger_id,
        status: newChallenge.status,
        bet_points: newChallenge.bet_points
      });

      // Clean up test challenge
      console.log('\n🧹 Cleaning up test challenge...');
      const { error: deleteError } = await supabase
        .from('challenges')
        .delete()
        .eq('id', newChallenge.id);

      if (deleteError) {
        console.log('⚠️ Could not clean up test challenge:', deleteError.message);
      } else {
        console.log('✅ Test challenge cleaned up');
      }
    }

    // 5. Check for notification functions
    console.log('\n5. Checking notification functions...');
    
    const { data: funcResult, error: funcError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'test',
        p_challenge_id: null,
        p_user_id: users[0].user_id,
        p_title: 'Test',
        p_message: 'Test message',
        p_icon: 'bell',
        p_priority: 'medium'
      });

    if (funcError) {
      console.error('❌ Notification function error:', funcError.message);
      console.log('🔧 Notification functions need to be deployed!');
    } else {
      console.log('✅ Notification function works');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the debug
debugChallengeCreation().then(() => {
  console.log('\n🎯 Debug Complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});
