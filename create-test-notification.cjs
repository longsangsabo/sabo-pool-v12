const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestNotification() {
  console.log('🧪 CREATING TEST NOTIFICATION FOR USER TESTING...\n');
  
  // Get user
  const { data: users } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .limit(1);
    
  if (!users || users.length === 0) {
    console.log('❌ No users found');
    return;
  }
  
  const user = users[0];
  console.log('👤 Creating notification for:', user.full_name);
  
  try {
    const { data: notificationId, error } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'user_test',
        p_user_id: user.user_id,
        p_title: '🔔 Test Notification - Click This!',
        p_message: 'This is a test notification to verify the notification bell works. You can click to mark as read.',
        p_icon: 'bell',
        p_priority: 'high',
        p_action_text: 'Mark as Read',
        p_action_url: null
      });
      
    if (error) {
      console.log('❌ Failed to create notification:', error.message);
      if (error.message.includes('could not find function')) {
        console.log('\n💡 SOLUTION: Run complete-notification-system-setup.sql in Supabase Dashboard');
      }
    } else {
      console.log('✅ Test notification created with ID:', notificationId);
      console.log('\n🎯 NOW TEST AS USER:');
      console.log('1. Open http://localhost:8003');
      console.log('2. Login as', user.full_name);
      console.log('3. Look for red badge (1) on notification bell');
      console.log('4. Click bell to see the test notification');
      console.log('5. Click notification to mark as read');
      console.log('6. Badge should disappear');
      
      console.log('\n📱 EXPECTED USER EXPERIENCE:');
      console.log('→ Bell shows red badge with "1"');
      console.log('→ Click opens dropdown with test notification');
      console.log('→ High priority notification (orange background)');
      console.log('→ Click notification marks it as read');
      console.log('→ Badge disappears after marking read');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

createTestNotification();
