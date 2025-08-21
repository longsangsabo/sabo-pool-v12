const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createMissingNotifications() {
  console.log('🔔 CREATING MISSING NOTIFICATIONS FOR ACCEPTED CHALLENGE...');
  
  // Get the accepted challenge details
  const challengeId = 'd0ba6ff2-843a-4683-94fe-1ac9c77c1134';
  const challengerId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
  const opponentId = '18f6e853-92b1-4064-b648-7b8b33a0b5df';
  
  // Get profiles for names
  const { data: challengerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', challengerId)
    .single();
    
  const { data: opponentProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', opponentId)
    .single();
    
  const challengerName = challengerProfile?.full_name || 'Challenger';
  const opponentName = opponentProfile?.full_name || 'Opponent';
  
  console.log('👤 Participants:', { challengerName, opponentName });
  
  console.log('\n📨 Creating notifications...');
  
  // 1. Notification for challenger (challenge was accepted)
  const { data: notif1, error: error1 } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'challenge_accepted',
      p_challenge_id: challengeId,
      p_user_id: challengerId,
      p_title: '🎉 Challenge Accepted!',
      p_message: `${opponentName} has accepted your challenge!`,
      p_icon: 'check-circle',
      p_priority: 'high',
      p_action_text: 'View Match',
      p_action_url: `/challenges/${challengeId}`,
      p_metadata: JSON.stringify({ challengeId, action: 'view_challenge' })
    });
    
  if (error1) {
    console.log('❌ Error creating challenger notification:', error1);
  } else {
    console.log('✅ Challenger notification created:', notif1);
  }
  
  // 2. Notification for opponent (confirmation of joining)
  const { data: notif2, error: error2 } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'challenge_joined',
      p_challenge_id: challengeId,
      p_user_id: opponentId,
      p_title: '⚔️ Challenge Joined!',
      p_message: `You have joined ${challengerName}'s challenge!`,
      p_icon: 'play-circle',
      p_priority: 'medium',
      p_action_text: 'View Match',
      p_action_url: `/challenges/${challengeId}`,
      p_metadata: JSON.stringify({ challengeId, action: 'view_challenge' })
    });
    
  if (error2) {
    console.log('❌ Error creating opponent notification:', error2);
  } else {
    console.log('✅ Opponent notification created:', notif2);
  }
  
  // 3. Optional: Create match reminder for 1 hour before (if scheduled)
  const { data: challenge } = await supabase
    .from('challenges')
    .select('scheduled_time')
    .eq('id', challengeId)
    .single();
    
  if (challenge?.scheduled_time) {
    const scheduledTime = new Date(challenge.scheduled_time);
    const reminderTime = new Date(scheduledTime.getTime() - 60 * 60 * 1000); // 1 hour before
    
    // Only create reminder if it's in the future
    if (reminderTime > new Date()) {
      const { data: notif3, error: error3 } = await supabase
        .rpc('create_challenge_notification', {
          p_type: 'match_reminder_1h',
          p_challenge_id: challengeId,
          p_user_id: challengerId,
          p_title: '⏰ Match Starting Soon',
          p_message: `Your match with ${opponentName} starts in 1 hour!`,
          p_icon: 'clock',
          p_priority: 'high',
          p_scheduled_for: reminderTime.toISOString()
        });
        
      const { data: notif4, error: error4 } = await supabase
        .rpc('create_challenge_notification', {
          p_type: 'match_reminder_1h',
          p_challenge_id: challengeId,
          p_user_id: opponentId,
          p_title: '⏰ Match Starting Soon',
          p_message: `Your match with ${challengerName} starts in 1 hour!`,
          p_icon: 'clock',
          p_priority: 'high',
          p_scheduled_for: reminderTime.toISOString()
        });
        
      console.log('⏰ Scheduled reminders:', { notif3, notif4 });
    }
  }
  
  console.log('\n🎯 RESULT:');
  console.log('✅ Notifications have been created for the accepted challenge');
  console.log('📱 Users should now see notifications in the UI when logged in');
  console.log('🌐 Visit http://localhost:8000 and log in to see notifications');
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Đăng nhập vào ứng dụng tại http://localhost:8000');
  console.log('2. Kiểm tra notification bell icon ở top-right');
  console.log('3. Test tạo challenge mới để xem notifications tự động');
}

createMissingNotifications();
