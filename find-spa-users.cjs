const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAllUsersWithSPA() {
  try {
    console.log('🔍 FINDING ALL USERS WITH SPA');
    console.log('=============================\n');
    
    // Get all users with SPA > 0
    const { data: rankings } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_balance,
        profiles!inner(email, full_name)
      `)
      .gt('spa_balance', 0)
      .order('spa_balance', { ascending: false });
    
    if (!rankings || rankings.length === 0) {
      console.log('❌ No users found with SPA > 0');
      return;
    }
    
    console.log(`Found ${rankings.length} users with SPA > 0:`);
    rankings.forEach((r, i) => {
      console.log(`${i + 1}. ${r.profiles.full_name} (${r.profiles.email}): ${r.spa_balance} SPA`);
    });
    
    // Let's check the user with highest SPA balance
    const topUser = rankings[0];
    console.log(`\n🔍 Checking top user: ${topUser.profiles.full_name} (${topUser.spa_balance} SPA)`);
    
    // Check SPA transactions
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', topUser.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n💳 SPA Transactions (${transactions?.length || 0}):`);
    if (transactions && transactions.length > 0) {
      transactions.slice(0, 10).forEach(t => {
        console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
      });
      if (transactions.length > 10) {
        console.log(`   ... and ${transactions.length - 10} more`);
      }
    } else {
      console.log('   ❌ NO TRANSACTIONS! This explains why no history shows in UI');
    }
    
    // Check notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', topUser.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n🔔 Notifications (${notifications?.length || 0}):`);
    if (notifications && notifications.length > 0) {
      notifications.slice(0, 5).forEach(n => {
        console.log(`   📢 ${n.title} - ${new Date(n.created_at).toLocaleString()}`);
      });
      if (notifications.length > 5) {
        console.log(`   ... and ${notifications.length - 5} more`);
      }
    } else {
      console.log('   ❌ NO NOTIFICATIONS! This explains why no notifications show in UI');
    }
    
    // Check milestones
    const { data: milestones } = await supabase
      .from('player_milestones')
      .select(`
        *,
        milestones!inner(name, spa_reward)
      `)
      .eq('user_id', topUser.user_id)
      .eq('completed', true)
      .order('completed_at', { ascending: false });
    
    console.log(`\n🎯 Completed Milestones (${milestones?.length || 0}):`);
    if (milestones && milestones.length > 0) {
      let totalExpectedSPA = 0;
      milestones.forEach(m => {
        totalExpectedSPA += m.milestones.spa_reward || 0;
        console.log(`   ✅ ${m.milestones.name} (+${m.milestones.spa_reward} SPA) - ${new Date(m.completed_at).toLocaleString()}`);
      });
      
      console.log(`\n📊 ANALYSIS:`);
      console.log(`   Milestones total SPA: ${totalExpectedSPA}`);
      console.log(`   Actual SPA balance: ${topUser.spa_balance}`);
      console.log(`   Transactions recorded: ${transactions?.length || 0}`);
      console.log(`   Notifications sent: ${notifications?.length || 0}`);
      
      if (totalExpectedSPA > 0 && (transactions?.length || 0) === 0) {
        console.log(`\n🚨 PROBLEM IDENTIFIED:`);
        console.log(`   ✅ User completed milestones`);
        console.log(`   ✅ SPA balance updated (${topUser.spa_balance})`);
        console.log(`   ❌ No spa_transactions created (explains missing history)`);
        console.log(`   ❌ No notifications created (explains missing notifications)`);
        console.log(`\n💡 SOLUTION NEEDED:`);
        console.log(`   1. milestoneService.ts may not be creating transactions/notifications`);
        console.log(`   2. Or there's a different service updating SPA balance directly`);
        console.log(`   3. Need to check if our updated milestoneService.ts is actually being used`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAllUsersWithSPA();
