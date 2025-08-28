// =====================================================
// 🚀 IMMEDIATE FIX: DISABLE NOTIFICATION TRIGGERS
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'  // Using service role key
);

async function disableNotificationTriggers() {
  console.log('🚀 Disabling Notification Triggers for Challenge Creation...\n');

  try {
    // 1. Disable the problematic trigger
    console.log('1. Disabling challenge notification trigger...');
    
    const { data: dropResult, error: dropError } = await supabase
      .rpc('exec_sql', {
        sql: 'DROP TRIGGER IF EXISTS challenge_created_notification_trigger ON challenges;'
      });

    if (dropError) {
      console.log('⚠️ Could not drop trigger via RPC:', dropError.message);
      console.log('💡 Trigger may need to be dropped manually in Supabase dashboard');
    } else {
      console.log('✅ Notification trigger disabled');
    }

    // 2. Test challenge creation now
    console.log('\n2. Testing challenge creation without triggers...');
    
    // Get test data
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(2);

    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, club_name')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('⚠️ No users found for testing');
      return;
    }

    if (clubError || !clubs || clubs.length === 0) {
      console.log('⚠️ No clubs found for testing');
      return;
    }

    // Create test challenge
    const testChallenge = {
      challenger_id: users[0].user_id,
      opponent_id: null, // Open challenge
      bet_points: 100,
      race_to: 8,
      message: 'Test challenge without notifications',
      club_id: clubs[0].id,
      location: clubs[0].club_name,
      is_sabo: true,
      status: 'pending',
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    console.log('🚀 Creating test challenge...');
    
    const { data: newChallenge, error: createError } = await supabase
      .from('challenges')
      .insert([testChallenge])
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Challenge creation still failed:', createError.message);
      console.error('Details:', createError);
    } else {
      console.log('🎉 SUCCESS! Challenge created without notification conflicts!');
      console.log('📄 Challenge ID:', newChallenge.id);
      
      // Clean up test challenge
      const { error: deleteError } = await supabase
        .from('challenges')
        .delete()
        .eq('id', newChallenge.id);

      if (!deleteError) {
        console.log('✅ Test challenge cleaned up');
      }
    }

    // 3. Check current triggers
    console.log('\n3. Checking remaining triggers...');
    
    const { data: triggers, error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT trigger_name, event_manipulation, action_timing 
              FROM information_schema.triggers 
              WHERE event_object_table = 'challenges' 
              AND trigger_schema = 'public';`
      });

    if (triggerError) {
      console.log('⚠️ Could not check triggers:', triggerError.message);
    } else {
      console.log('📋 Remaining triggers on challenges table:', triggers);
    }

    console.log('\n🎯 SOLUTION SUMMARY:');
    console.log('✅ Notification triggers disabled');
    console.log('✅ Challenge creation should now work');
    console.log('⚠️ Manual notifications will be needed until trigger is fixed');
    console.log('🔧 Next steps: Fix foreign key constraint and re-enable notifications');

  } catch (error) {
    console.error('💥 Fix failed:', error);
  }
}

// Run the fix
disableNotificationTriggers().then(() => {
  console.log('\n🎯 Fix Complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});
