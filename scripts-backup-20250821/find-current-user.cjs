const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findCurrentUser() {
  try {
    console.log('🔍 FINDING CURRENT USER WITH 350 SPA');
    console.log('===================================\n');
    
    // Get all users with SPA points
    const { data: rankings } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_points,
        profiles!inner(email, full_name)
      `)
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false });
    
    console.log(`Found ${rankings?.length || 0} users with SPA > 0:`);
    
    let currentUser = null;
    rankings?.forEach((r, i) => {
      console.log(`${i + 1}. ${r.profiles.full_name} (${r.profiles.email}): ${r.spa_points} SPA`);
      
      // Look for user with 350 SPA (from screenshot)
      if (r.spa_points === 350) {
        currentUser = r;
      }
    });
    
    if (!currentUser) {
      // If no exact 350, let's check users with moderate SPA amounts
      const candidates = rankings?.filter(r => r.spa_points >= 300 && r.spa_points <= 500);
      if (candidates && candidates.length > 0) {
        console.log(`\n🎯 Potential current user candidates (300-500 SPA):`);
        candidates.forEach(c => {
          console.log(`   - ${c.profiles.full_name} (${c.profiles.email}): ${c.spa_points} SPA`);
        });
        currentUser = candidates[0]; // Take first candidate
      }
    }
    
    if (!currentUser && rankings && rankings.length > 0) {
      console.log(`\n⚠️  No exact match. Checking first user with SPA:`);
      currentUser = rankings[0];
    }
    
    if (!currentUser) {
      console.log(`\n❌ No users found with SPA points`);
      return;
    }
    
    console.log(`\n🔍 Analyzing user: ${currentUser.profiles.full_name} (${currentUser.spa_points} SPA)`);
    
    // Check transactions for this user
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', currentUser.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n💳 SPA Transactions (${transactions?.length || 0}):`);
    if (transactions && transactions.length > 0) {
      let totalFromTransactions = 0;
      transactions.forEach(t => {
        totalFromTransactions += t.amount;
        console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
      });
      console.log(`   Total from transactions: ${totalFromTransactions} SPA`);
    } else {
      console.log(`   ❌ NO TRANSACTIONS! This explains missing transaction history`);
    }
    
    // Check notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n🔔 Notifications (${notifications?.length || 0}):`);
    if (notifications && notifications.length > 0) {
      notifications.slice(0, 10).forEach(n => {
        console.log(`   📢 ${n.title} - ${new Date(n.created_at).toLocaleString()}`);
        if (n.message) console.log(`      ${n.message}`);
      });
      if (notifications.length > 10) {
        console.log(`   ... and ${notifications.length - 10} more`);
      }
    } else {
      console.log(`   ❌ NO NOTIFICATIONS! This explains missing notifications in UI`);
    }
    
    // Summary
    console.log(`\n📊 ANALYSIS:`);
    console.log(`   Current SPA: ${currentUser.spa_points}`);
    console.log(`   Transactions: ${transactions?.length || 0}`);
    console.log(`   Notifications: ${notifications?.length || 0}`);
    
    if (currentUser.spa_points > 0 && (transactions?.length || 0) === 0) {
      console.log(`\n🚨 ISSUE CONFIRMED:`);
      console.log(`   ✅ User has SPA balance (${currentUser.spa_points})`);
      console.log(`   ❌ No spa_transactions (missing transaction history)`);
      console.log(`   ❌ No/few notifications (missing notification alerts)`);
      console.log(`\n💡 LIKELY CAUSES:`);
      console.log(`   1. SPA updated directly via database trigger/function`);
      console.log(`   2. milestoneService.ts not being called for SPA awards`);
      console.log(`   3. Different service handling SPA updates without logging`);
      
      console.log(`\n🔧 SOLUTIONS NEEDED:`);
      console.log(`   1. Check if there are database triggers updating SPA directly`);
      console.log(`   2. Ensure milestoneService.ts is called for all milestone completions`);
      console.log(`   3. Add transaction logging to any existing SPA update functions`);
    }
    
    return currentUser.user_id;
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findCurrentUser();
