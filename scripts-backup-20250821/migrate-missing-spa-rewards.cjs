const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function migrateMissingSpaRewards() {
  console.log('🔧 MIGRATING MISSING SPA REWARDS');
  console.log('='.repeat(50));
  
  // Find all completed milestones with SPA rewards but no corresponding transactions
  console.log('🔍 Finding completed milestones without SPA transactions...');
  
  const { data: completedMilestones, error } = await supabase
    .from('player_milestones')
    .select(`
      id,
      player_id,
      milestone_id,
      completed_at,
      milestones (
        id,
        name,
        spa_reward,
        milestone_type
      )
    `)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false });
    
  if (error) {
    console.log('❌ Error fetching milestones:', error.message);
    return;
  }
  
  console.log(`📊 Found ${completedMilestones?.length || 0} completed milestones`);
  
  let fixed = 0;
  let alreadyProcessed = 0;
  let errors = 0;
  
  for (const milestone of completedMilestones || []) {
    if (!milestone.milestones?.spa_reward || milestone.milestones.spa_reward <= 0) {
      continue; // Skip milestones with no SPA reward
    }
    
    // Check if this milestone already has a transaction
    const { data: existingTransaction } = await supabase
      .from('spa_transactions')
      .select('id')
      .eq('user_id', milestone.player_id)
      .eq('source_type', 'milestone_award')
      .eq('reference_id', milestone.milestone_id)
      .single();
      
    if (existingTransaction) {
      alreadyProcessed++;
      continue;
    }
    
    console.log(`\\n🔧 Fixing milestone for user ${milestone.player_id.slice(0,8)}...`);
    console.log(`   Milestone: ${milestone.milestones.name}`);
    console.log(`   SPA Reward: ${milestone.milestones.spa_reward}`);
    console.log(`   Completed: ${new Date(milestone.completed_at).toLocaleString()}`);
    
    try {
      // Check if user has ranking record
      const { data: ranking } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', milestone.player_id)
        .single();
        
      if (!ranking) {
        console.log('   ❌ No ranking record - creating pending notification only');
        
        // Create pending notification
        await supabase.from('notifications').insert({
          user_id: milestone.player_id,
          type: 'milestone_completed_pending',
          category: 'achievement',
          title: '🏆 Hoàn thành milestone!',
          message: `🎉 Chúc mừng! Bạn đã hoàn thành "${milestone.milestones.name}". Để nhận ${milestone.milestones.spa_reward} SPA, vui lòng đăng ký hạng trước.`,
          priority: 'high',
          metadata: { 
            milestone_id: milestone.milestone_id, 
            milestone_type: milestone.milestones.milestone_type,
            milestone_name: milestone.milestones.name,
            spa_reward: milestone.milestones.spa_reward,
            pending_spa: true,
            action_required: true,
            action_url: '/ranking/register',
            migrated: true
          }
        });
        
        console.log('   ✅ Created pending notification');
        
      } else {
        console.log('   ✅ Has ranking record - awarding SPA');
        
        // Award SPA
        const newBalance = (ranking.spa_points || 0) + milestone.milestones.spa_reward;
        await supabase
          .from('player_rankings')
          .update({ spa_points: newBalance })
          .eq('user_id', milestone.player_id);
          
        // Create transaction record
        await supabase.from('spa_transactions').insert({
          user_id: milestone.player_id,
          amount: milestone.milestones.spa_reward,
          source_type: 'milestone_award',
          transaction_type: 'credit',
          description: `Milestone completed: ${milestone.milestones.name} (migrated)`,
          status: 'completed',
          reference_id: milestone.milestone_id
        });
        
        // Create success notification
        await supabase.from('notifications').insert({
          user_id: milestone.player_id,
          type: 'milestone_completed',
          category: 'achievement',
          title: '🏆 SPA đã được cộng!',
          message: `🎉 Chúc mừng! Bạn đã nhận được ${milestone.milestones.spa_reward} SPA từ milestone "${milestone.milestones.name}"!`,
          priority: 'high',
          metadata: { 
            milestone_id: milestone.milestone_id, 
            milestone_type: milestone.milestones.milestone_type,
            milestone_name: milestone.milestones.name,
            spa_reward: milestone.milestones.spa_reward,
            celebration: true,
            action_url: '/milestones',
            migrated: true
          }
        });
        
        console.log(`   ✅ Awarded ${milestone.milestones.spa_reward} SPA, new balance: ${newBalance}`);
        console.log('   ✅ Created transaction and notification');
      }
      
      fixed++;
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errors++;
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\\n📊 MIGRATION SUMMARY:');
  console.log('='.repeat(50));
  console.log(`✅ Fixed milestones: ${fixed}`);
  console.log(`⚪ Already processed: ${alreadyProcessed}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total checked: ${completedMilestones?.length || 0}`);
  
  if (fixed > 0) {
    console.log('\\n🎉 Migration completed successfully!');
    console.log('Users should now see their SPA and notifications.');
  }
}

migrateMissingSpaRewards().catch(console.error);
