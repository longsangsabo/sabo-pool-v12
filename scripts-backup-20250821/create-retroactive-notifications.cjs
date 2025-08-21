const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createRetroactiveNotifications() {
  console.log('🔄 CREATING RETROACTIVE NOTIFICATIONS...');
  console.log('Tạo notifications cho challenges đã được accept trước khi có trigger...');
  
  // Get accepted challenges that don't have notifications yet
  const { data: acceptedChallenges } = await supabase
    .from('challenges')
    .select('id, challenger_id, opponent_id, status, responded_at, created_at')
    .in('status', ['accepted', 'ongoing'])
    .not('responded_at', 'is', null)
    .order('responded_at', { ascending: false });
    
  if (!acceptedChallenges || acceptedChallenges.length === 0) {
    console.log('❌ No accepted challenges found');
    return;
  }
  
  console.log(`📊 Found ${acceptedChallenges.length} accepted challenges:`);
  
  for (const challenge of acceptedChallenges) {
    console.log(`\\nProcessing challenge ${challenge.id.slice(0,8)}...`);
    console.log(`  Status: ${challenge.status}, Accepted: ${challenge.responded_at}`);
    
    // Get profiles
    const { data: challengerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', challenge.challenger_id)
      .single();
      
    const { data: opponentProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', challenge.opponent_id)
      .single();
      
    const challengerName = challengerProfile?.full_name || 'Challenger';
    const opponentName = opponentProfile?.full_name || 'Opponent';
    
    console.log(`  👥 ${challengerName} vs ${opponentName}`);
    
    try {
      // Create notification for challenger (challenge was accepted)
      const { data: notif1, error: error1 } = await supabase
        .rpc('create_challenge_notification', {
          p_type: 'challenge_accepted',
          p_challenge_id: challenge.id,
          p_user_id: challenge.challenger_id,
          p_title: '🎉 Challenge Accepted!',
          p_message: `${opponentName} đã chấp nhận thách đấu của bạn!`,
          p_icon: 'check-circle',
          p_priority: 'high',
          p_action_text: 'Xem trận đấu',
          p_action_url: `/challenges/${challenge.id}`
        });
        
      if (error1) {
        console.log(`  ❌ Error creating challenger notification: ${error1.message}`);
      } else {
        console.log(`  ✅ Challenger notification: ${notif1}`);
      }
      
      // Create notification for opponent (confirmation)
      const { data: notif2, error: error2 } = await supabase
        .rpc('create_challenge_notification', {
          p_type: 'challenge_joined',
          p_challenge_id: challenge.id,
          p_user_id: challenge.opponent_id,
          p_title: '⚔️ Tham gia thành công!',
          p_message: `Bạn đã tham gia thách đấu của ${challengerName}!`,
          p_icon: 'play-circle',
          p_priority: 'medium',
          p_action_text: 'Xem trận đấu',
          p_action_url: `/challenges/${challenge.id}`
        });
        
      if (error2) {
        console.log(`  ❌ Error creating opponent notification: ${error2.message}`);
      } else {
        console.log(`  ✅ Opponent notification: ${notif2}`);
      }
      
    } catch (err) {
      console.log(`  ❌ Error processing challenge: ${err.message}`);
    }
  }
  
  // Check final notification count
  const { count } = await supabase
    .from('challenge_notifications')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\\n📊 Total notifications after creation: ${count || 0}`);
  
  console.log('\\n🎯 COMPLETED!');
  console.log('✅ Retroactive notifications created for existing accepted challenges');
  console.log('🔔 New challenges will automatically create notifications via triggers');
  console.log('📱 Users should now see notifications when logged in');
}

createRetroactiveNotifications();
