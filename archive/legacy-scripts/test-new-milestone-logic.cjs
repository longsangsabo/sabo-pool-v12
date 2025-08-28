const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testNewMilestoneLogic() {
  console.log('🧪 TESTING NEW MILESTONE SPA LOGIC');
  console.log('='.repeat(50));
  
  // Check sabomedia27@gmail.com
  const { data: user } = await supabase
    .from('profiles')
    .select('user_id, email, full_name')
    .eq('email', 'sabomedia27@gmail.com')
    .single();
    
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('👤 Found user:', user.full_name || user.email);
  console.log('   User ID:', user.user_id.slice(0,8) + '...');
  
  // Check if user has ranking record
  const { data: ranking } = await supabase
    .from('player_rankings')
    .select('spa_points')
    .eq('user_id', user.user_id)
    .single();
    
  console.log('\n🎯 RANKING STATUS:');
  if (!ranking) {
    console.log('❌ User has NO ranking record');
    console.log('   → This is why SPA shows 0 in profile');
    console.log('   → SPA cannot be awarded without ranking registration');
  } else {
    console.log('✅ User has ranking record');
    console.log('   Current SPA:', ranking.spa_points);
  }
  
  // Check milestones completed
  const { data: milestones } = await supabase
    .from('player_milestones')
    .select('*, milestones(name, spa_reward)')
    .eq('player_id', user.user_id)
    .eq('is_completed', true);
    
  console.log('\n🏆 COMPLETED MILESTONES:');
  if (milestones && milestones.length > 0) {
    milestones.forEach((m, i) => {
      console.log(`   ${i+1}. ${m.milestones?.name} - ${m.milestones?.spa_reward} SPA`);
      console.log(`      Completed: ${new Date(m.completed_at).toLocaleString()}`);
    });
  } else {
    console.log('   No completed milestones found');
  }
  
  // Check recent notifications for this user
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.user_id)
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('\n🔔 USER NOTIFICATIONS:');
  if (notifications && notifications.length > 0) {
    notifications.forEach((n, i) => {
      console.log(`   ${i+1}. ${n.type} - ${n.title}`);
      console.log(`      ${n.message}`);
      console.log(`      Created: ${new Date(n.created_at).toLocaleString()}`);
      if (n.metadata?.action_url) {
        console.log(`      Action: ${n.metadata.action_url}`);
      }
      console.log('');
    });
  } else {
    console.log('   ❌ No notifications found');
  }
  
  console.log('🎯 NEW SYSTEM BEHAVIOR:');
  console.log('='.repeat(50));
  console.log('✅ WHAT CHANGED:');
  console.log('1. Milestone completion → Check if user has ranking');
  console.log('2. NO ranking → Create "pending" notification');
  console.log('3. Notification message: "Để nhận SPA, vui lòng đăng ký hạng trước"');
  console.log('4. Action button → Navigate to ranking registration');
  console.log('');
  console.log('📱 USER EXPERIENCE:');
  console.log('• User completes milestone ✅');
  console.log('• Gets notification explaining why no SPA yet');
  console.log('• Can click to register ranking');
  console.log('• After ranking registration → Can claim pending SPA');
  console.log('');
  console.log('🔄 FOR EXISTING USERS:');
  console.log('• Your milestone is completed ✅');
  console.log('• Register ranking → SPA will be available');
  console.log('• New users get clear guidance immediately');
}

testNewMilestoneLogic().catch(console.error);
