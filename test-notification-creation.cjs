const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Simulate the notification creation that should happen when challenge is accepted
async function simulateNotificationCreation() {
  console.log('🧪 SIMULATING NOTIFICATION CREATION...');
  
  // Get the recent accepted challenge
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'ongoing')
    .eq('id', 'd0ba6ff2-843a-4683-94fe-1ac9c77c1134')
    .single();
    
  if (!challenge) {
    console.log('❌ Challenge not found');
    return;
  }
  
  console.log('📋 Challenge found:', {
    id: challenge.id.slice(0,8),
    challenger_id: challenge.challenger_id?.slice(0,8),
    opponent_id: challenge.opponent_id?.slice(0,8),
    status: challenge.status
  });
  
  // Get profiles for names
  const { data: challengerProfile } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('user_id', challenge.challenger_id)
    .single();
    
  const { data: opponentProfile } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('user_id', challenge.opponent_id)
    .single();
    
  console.log('👤 Profiles:', {
    challenger: challengerProfile?.full_name || 'Unknown',
    opponent: opponentProfile?.full_name || 'Unknown'
  });
  
  // Try to create notifications manually to test the flow
  console.log('\n📨 Attempting to create notifications...');
  
  // Notification for challenger (challenge was accepted)
  const challengerNotification = {
    type: 'challenge_accepted',
    user_id: challenge.challenger_id,
    title: 'Challenge Accepted!',
    message: `${opponentProfile?.full_name || 'A player'} has accepted your challenge!`,
    icon: 'check-circle',
    priority: 'high',
    data: {
      challengeId: challenge.id,
      action: 'view_challenge'
    }
  };
  
  const { data: notif1, error: error1 } = await supabase
    .from('challenge_notifications')
    .insert(challengerNotification)
    .select()
    .single();
    
  if (error1) {
    console.log('❌ Error creating challenger notification:', error1);
  } else {
    console.log('✅ Challenger notification created:', notif1.id);
  }
  
  // Notification for opponent (confirm participation)
  const opponentNotification = {
    type: 'challenge_joined',
    user_id: challenge.opponent_id,
    title: 'Challenge Joined!',
    message: `You have joined ${challengerProfile?.full_name || 'a player'}'s challenge!`,
    icon: 'play-circle',
    priority: 'medium',
    data: {
      challengeId: challenge.id,
      action: 'view_challenge'
    }
  };
  
  const { data: notif2, error: error2 } = await supabase
    .from('challenge_notifications')
    .insert(opponentNotification)
    .select()
    .single();
    
  if (error2) {
    console.log('❌ Error creating opponent notification:', error2);
  } else {
    console.log('✅ Opponent notification created:', notif2.id);
  }
  
  // Check final count
  const { data: allNotifications } = await supabase
    .from('challenge_notifications')
    .select('*');
    
  console.log(`\n📊 Total notifications now: ${allNotifications?.length || 0}`);
}

simulateNotificationCreation();
