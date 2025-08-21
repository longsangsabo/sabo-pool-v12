const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createMultipleTestNotifications() {
  console.log('🎨 CREATING MULTIPLE TEST NOTIFICATIONS FOR DARK MODE TESTING...');
  
  // Get user
  const { data: users } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .limit(1);

  if (!users || users.length === 0) {
    console.log('❌ No users found');
    return;
  }

  const testUser = users[0];
  console.log(`👤 Creating notifications for: ${testUser.full_name}`);

  // Create notifications with different priorities
  const notifications = [
    {
      type: 'challenge_received',
      title: '⚔️ High Priority Challenge',
      message: 'You have received a high priority challenge from a skilled player!',
      priority: 'high',
      icon: 'sword'
    },
    {
      type: 'challenge_accepted',
      title: '✅ Challenge Accepted',
      message: 'Your challenge has been accepted. Good luck!',
      priority: 'medium',
      icon: 'check-circle'
    },
    {
      type: 'match_reminder_1h',
      title: '⏰ Urgent Match Reminder',
      message: 'Your match starts in 1 hour. Please be ready!',
      priority: 'urgent',
      icon: 'clock'
    },
    {
      type: 'club_approved',
      title: '🏢 Club Membership Approved',
      message: 'Welcome to the club! Your membership has been approved.',
      priority: 'low',
      icon: 'building'
    }
  ];

  for (const notif of notifications) {
    const { data: notificationId, error } = await supabase
      .rpc('create_challenge_notification', {
        p_type: notif.type,
        p_user_id: testUser.user_id,
        p_title: notif.title,
        p_message: notif.message,
        p_icon: notif.icon,
        p_priority: notif.priority
      });

    if (error) {
      console.log(`❌ Error creating ${notif.priority} notification:`, error);
    } else {
      console.log(`✅ Created ${notif.priority} notification: ${notif.title}`);
    }
  }

  console.log('\n🎯 DARK MODE TESTING:');
  console.log('1. Open http://localhost:8000');
  console.log('2. Login as Sang');
  console.log('3. Toggle dark mode (if available)');
  console.log('4. Click notification bell');
  console.log('5. Check all different priority colors in dark mode');
  console.log('');
  console.log('📱 EXPECTED IMPROVEMENTS:');
  console.log('→ Dark background for dropdown');
  console.log('→ Light text on dark background');
  console.log('→ Better contrast for priority badges');
  console.log('→ Improved hover states');
  console.log('→ Better mobile experience');
}

createMultipleTestNotifications();
