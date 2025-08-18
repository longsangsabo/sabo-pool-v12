const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSangMilestones() {
  try {
    console.log('=== KIỂM TRA MILESTONE USER SANG ===');

    // Find user Sang
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_id, full_name, created_at')
      .eq('full_name', 'Sang')
      .single();

    if (!userProfile) {
      console.log('❌ User Sang not found');
      return;
    }

    const userId = userProfile.user_id;
    console.log('👤 User: ' + userProfile.full_name + ' (' + userId.substring(0,8) + '...)');
    console.log('📅 Account created: ' + userProfile.created_at);

    // Check current SPA balance
    const { data: balance } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();
    
    console.log('💰 Current SPA: ' + (balance?.spa_points || 0) + ' SPA');

    // Check milestone events
    console.log('\n🎯 MILESTONE EVENTS:');
    const { data: events } = await supabase
      .from('milestone_events')
      .select('*')
      .eq('player_id', userId)
      .order('created_at', { ascending: false });
    
    if (events && events.length > 0) {
      console.log('   Found ' + events.length + ' events:');
      events.forEach((e, i) => {
        console.log('   ' + (i+1) + '. ' + e.event_type + ' at ' + e.created_at);
      });
    } else {
      console.log('   ❌ No milestone events found');
    }

    // Check milestone awards
    console.log('\n🏆 MILESTONE AWARDS:');
    const { data: awards } = await supabase
      .from('milestone_awards')
      .select('*')
      .eq('player_id', userId)
      .order('awarded_at', { ascending: false });
    
    if (awards && awards.length > 0) {
      console.log('   Found ' + awards.length + ' awards:');
      awards.forEach((a, i) => {
        console.log('   ' + (i+1) + '. ' + a.spa_points_awarded + ' SPA (' + a.status + ') at ' + a.awarded_at);
      });
    } else {
      console.log('   ❌ No milestone awards found');
    }

    // Check SPA transactions
    console.log('\n💳 SPA TRANSACTIONS:');
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (transactions && transactions.length > 0) {
      console.log('   Found ' + transactions.length + ' transactions:');
      transactions.forEach((t, i) => {
        console.log('   ' + (i+1) + '. ' + t.transaction_type + ' ' + t.amount + ' SPA from ' + t.source_type);
        console.log('      Description: ' + t.description);
      });
    } else {
      console.log('   ❌ No SPA transactions found');
    }

    // Check available milestones
    console.log('\n📋 AVAILABLE MILESTONES:');
    const { data: availableMilestones } = await supabase
      .from('milestones')
      .select('id, name, description, spa_reward, milestone_type')
      .order('spa_reward', { ascending: true });
    
    if (availableMilestones && availableMilestones.length > 0) {
      console.log('   System has ' + availableMilestones.length + ' milestones:');
      availableMilestones.forEach((m, i) => {
        console.log('   ' + (i+1) + '. ' + m.name + ' (' + m.spa_reward + ' SPA) - ' + m.milestone_type);
      });
    } else {
      console.log('   ❌ No milestones found in system');
    }

    // Manual trigger account creation milestone
    console.log('\n🚀 MANUAL TRIGGER TEST:');
    console.log('Attempting to manually trigger account creation milestone...');
    
    try {
      // Call milestone service directly
      const { data: milestoneResult, error: milestoneError } = await supabase.functions.invoke('milestone-triggers', {
        body: {
          event_type: 'account_creation',
          player_id: userId,
          metadata: {
            account_created_at: userProfile.created_at
          }
        }
      });

      if (milestoneError) {
        console.log('❌ Milestone trigger error:', milestoneError.message);
      } else {
        console.log('✅ Milestone trigger result:', milestoneResult);
      }
    } catch (err) {
      console.log('❌ Exception:', err.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSangMilestones();
