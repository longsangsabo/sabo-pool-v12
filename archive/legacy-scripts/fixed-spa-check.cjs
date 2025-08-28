const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixedSPACheck() {
  try {
    console.log('🔍 CHECKING SPA WITH CORRECT COLUMN NAME');
    console.log('========================================\n');
    
    // Check users with SPA > 0 using correct column name
    const { data: rankings } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_points,
        profiles!inner(email, full_name)
      `)
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false });
    
    if (!rankings || rankings.length === 0) {
      console.log('❌ No users found with spa_points > 0');
      return;
    }
    
    console.log(`Found ${rankings.length} users with SPA > 0:`);
    
    // Check the top user (most likely the current user with 350 SPA)
    let targetUser = null;
    rankings.forEach((r, i) => {
      console.log(`${i + 1}. ${r.profiles.full_name} (${r.profiles.email}): ${r.spa_points} SPA`);
      if (r.spa_points === 350) {
        targetUser = r;
      }
    });
    
    if (!targetUser) {
      console.log('\n⚠️  No user found with exactly 350 SPA. Checking top user instead.');
      targetUser = rankings[0];
    }
    
    console.log(`\n🔍 Analyzing: ${targetUser.profiles.full_name} (${targetUser.spa_points} SPA)`);
    
    // Check SPA transactions for this user
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', targetUser.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n💳 SPA Transactions (${transactions?.length || 0}):`);
    if (transactions && transactions.length > 0) {
      transactions.forEach(t => {
        console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
      });
    } else {
      console.log('   ❌ NO TRANSACTIONS FOUND! This explains missing history in UI');
    }
    
    // Check notifications for this user
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUser.user_id)
      .order('created_at', { ascending: false});
    
    console.log(`\n🔔 Notifications (${notifications?.length || 0}):`);
    if (notifications && notifications.length > 0) {
      notifications.slice(0, 5).forEach(n => {
        console.log(`   📢 ${n.title} - ${new Date(n.created_at).toLocaleString()}`);
        if (n.message) console.log(`      ${n.message}`);
      });
      if (notifications.length > 5) {
        console.log(`   ... and ${notifications.length - 5} more`);
      }
    } else {
      console.log('   ❌ NO NOTIFICATIONS FOUND! This explains missing notifications in UI');
    }
    
    // Check completed milestones
    const { data: milestones } = await supabase
      .from('player_milestones')
      .select(`
        *,
        milestones!inner(name, spa_reward)
      `)
      .eq('user_id', targetUser.user_id)
      .eq('completed', true)
      .order('completed_at', { ascending: false });
    
    console.log(`\n🎯 Completed Milestones (${milestones?.length || 0}):`);
    if (milestones && milestones.length > 0) {
      let totalSPA = 0;
      milestones.forEach(m => {
        totalSPA += m.milestones.spa_reward || 0;
        console.log(`   ✅ ${m.milestones.name} (+${m.milestones.spa_reward} SPA) - ${new Date(m.completed_at).toLocaleString()}`);
      });
      
      console.log(`\n📊 DIAGNOSIS:`);
      console.log(`   Expected SPA from milestones: ${totalSPA}`);
      console.log(`   Actual SPA balance: ${targetUser.spa_points}`);
      console.log(`   SPA transactions recorded: ${transactions?.length || 0}`);
      console.log(`   Notifications created: ${notifications?.length || 0}`);
      
      if (totalSPA === targetUser.spa_points && (transactions?.length || 0) === 0) {
        console.log(`\n🚨 PROBLEM CONFIRMED:`);
        console.log(`   ✅ User completed milestones and SPA was awarded`);
        console.log(`   ❌ NO spa_transactions were created (missing transaction history)`);
        console.log(`   ❌ NO notifications were created (missing notification alerts)`);
        console.log(`\n💡 ROOT CAUSE:`);
        console.log(`   - milestoneService.ts is not creating transactions and notifications`);
        console.log(`   - SPA is being updated directly, bypassing our service logic`);
        console.log(`   - Need to check if there's another SPA update mechanism`);
      } else if (totalSPA !== targetUser.spa_points) {
        console.log(`\n⚠️  SPA MISMATCH: Expected ${totalSPA} but got ${targetUser.spa_points}`);
      }
    } else {
      console.log('   ❌ No completed milestones found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixedSPACheck();
