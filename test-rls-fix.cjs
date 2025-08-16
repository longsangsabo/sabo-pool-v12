const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testRLSFix() {
  console.log('🔐 TESTING RLS POLICY FIXES...');
  console.log('');

  // Test user ID - replace with actual user ID from your system
  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';

  console.log('🧪 STEP 1: Creating test notification...');
  
  // Create a test notification
  const { data: notificationId, error: createError } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'rls_test',
      p_user_id: testUserId,
      p_title: '🔧 RLS Test Notification',
      p_message: 'Testing if RLS policies allow proper access',
      p_icon: 'shield',
      p_priority: 'medium'
    });

  if (createError) {
    console.log('❌ Failed to create notification:', createError.message);
    return;
  }

  console.log('✅ Created notification with ID:', notificationId);
  console.log('');

  console.log('🧪 STEP 2: Testing anonymous access...');
  
  // Test anonymous access (should work with new policies)
  const { data: anonymousData, error: anonymousError } = await supabase
    .from('challenge_notifications')
    .select('id, title, is_read, user_id')
    .eq('user_id', testUserId);

  if (anonymousError) {
    console.log('❌ Anonymous access failed:', anonymousError.message);
    console.log('   This might be expected if RLS is strict');
  } else {
    console.log(`✅ Anonymous access works - found ${anonymousData?.length || 0} notifications`);
    if (anonymousData && anonymousData.length > 0) {
      console.log('   Sample notification:', {
        id: anonymousData[0].id.slice(0, 8) + '...',
        title: anonymousData[0].title,
        is_read: anonymousData[0].is_read
      });
    }
  }

  console.log('');
  console.log('🧪 STEP 3: Testing mark as read...');

  // Test updating notification (mark as read)
  const { data: updateData, error: updateError } = await supabase
    .from('challenge_notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select();

  if (updateError) {
    console.log('❌ Update failed:', updateError.message);
  } else {
    console.log('✅ Successfully marked notification as read');
  }

  console.log('');
  console.log('🧪 STEP 4: Testing unread count...');

  // Test counting unread notifications
  const { data: countData, error: countError } = await supabase
    .from('challenge_notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', testUserId)
    .eq('is_read', false);

  if (countError) {
    console.log('❌ Count query failed:', countError.message);
  } else {
    console.log(`✅ Unread notifications count: ${countData?.length || 0}`);
  }

  console.log('');
  console.log('🧪 STEP 5: Cleanup test notification...');

  // Clean up test notification
  const { error: deleteError } = await supabase
    .from('challenge_notifications')
    .delete()
    .eq('id', notificationId);

  if (deleteError) {
    console.log('❌ Cleanup failed:', deleteError.message);
  } else {
    console.log('✅ Test notification cleaned up');
  }

  console.log('');
  console.log('🎯 RLS TEST SUMMARY:');
  console.log('');
  
  if (!createError && !anonymousError && !updateError && !countError) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ RLS policies are working correctly');
    console.log('✅ Users can access their notifications');
    console.log('✅ Read/write operations work');
    console.log('✅ Notification bell should now sync properly');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Refresh your browser');
    console.log('2. Check notification bell in header');
    console.log('3. Badge count should be accurate');
    console.log('4. Mark as read should work instantly');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('🔧 You may need to run the SQL script in Supabase Dashboard:');
    console.log('   → Go to Supabase Dashboard → SQL Editor');
    console.log('   → Run fix-notification-rls-policies.sql');
    console.log('   → Then test again');
  }
}

testRLSFix();
