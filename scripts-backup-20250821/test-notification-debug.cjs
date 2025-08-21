const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createAndCheckNotification() {
  console.log('🔔 CREATING TEST NOTIFICATION...');
  
  // First, get a valid user ID
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .limit(1);

  if (userError) {
    console.log('❌ Error getting users:', userError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('❌ No users found in profiles table');
    return;
  }

  const testUser = users[0];
  console.log(`👤 Creating notification for: ${testUser.full_name} (${testUser.user_id})`);

  // Create notification using function
  const { data: notificationId, error: createError } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'test_notification',
      p_user_id: testUser.user_id,
      p_title: '🧪 Test Notification',
      p_message: 'This is a test to check if notifications work correctly!',
      p_icon: 'bell',
      p_priority: 'high'
    });

  if (createError) {
    console.log('❌ Error creating notification:', createError);
    
    if (createError.message.includes('could not find function')) {
      console.log('\n🔧 SOLUTION: Run the complete-notification-system-setup.sql script in Supabase Dashboard');
    }
    return;
  }

  console.log('✅ Notification created with ID:', notificationId);

  // Now try to fetch it back
  console.log('\n🔍 FETCHING NOTIFICATION BACK...');
  const { data: fetchedNotifications, error: fetchError } = await supabase
    .from('challenge_notifications')
    .select('*')
    .eq('user_id', testUser.user_id)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.log('❌ Error fetching notifications:', fetchError);
    console.log('💡 This might be RLS policy blocking anonymous access');
  } else {
    console.log(`✅ Found ${fetchedNotifications?.length || 0} notifications for user`);
    
    if (fetchedNotifications && fetchedNotifications.length > 0) {
      const latest = fetchedNotifications[0];
      console.log('\n📄 LATEST NOTIFICATION:');
      console.log('  Title:', latest.title);
      console.log('  Message:', latest.message);
      console.log('  Priority:', latest.priority);
      console.log('  Read:', latest.is_read);
    }
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Open http://localhost:8000');
  console.log(`2. Login as ${testUser.full_name}`);
  console.log('3. Check notification bell for red badge');
  console.log('4. Click bell to see dropdown');
}

createAndCheckNotification();
