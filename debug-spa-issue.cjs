const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSPAIssue() {
  try {
    console.log('🔍 DEBUGGING SPA DISPLAY ISSUE');
    console.log('==============================\n');
    
    // First, let's see what's in player_rankings table directly
    const { data: allRankings, error: rankingError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_balance')
      .gt('spa_balance', 0);
    
    if (rankingError) {
      console.log('❌ Error accessing player_rankings:', rankingError);
      return;
    }
    
    console.log(`📊 Users with SPA > 0: ${allRankings?.length || 0}`);
    
    if (allRankings && allRankings.length > 0) {
      // Get profile info for these users
      for (const ranking of allRankings.slice(0, 5)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', ranking.user_id)
          .single();
        
        console.log(`👤 ${profile?.full_name || 'Unknown'} (${profile?.email || 'No email'}): ${ranking.spa_balance} SPA`);
        
        // Check their transactions
        const { data: transactions } = await supabase
          .from('spa_transactions')
          .select('id, amount, description, created_at')
          .eq('user_id', ranking.user_id);
        
        console.log(`   💳 Transactions: ${transactions?.length || 0}`);
        
        // Check their notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('id, title, created_at')
          .eq('user_id', ranking.user_id);
        
        console.log(`   🔔 Notifications: ${notifications?.length || 0}`);
        
        if (transactions && transactions.length > 0) {
          console.log(`   Recent transactions:`);
          transactions.slice(0, 3).forEach(t => {
            console.log(`     ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description}`);
          });
        }
        console.log('');
      }
    }
    
    // Let's also check recent spa_transactions to see if any exist
    const { data: recentTransactions } = await supabase
      .from('spa_transactions')
      .select('user_id, amount, description, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`📊 Recent SPA transactions (last 10):`);
    if (recentTransactions && recentTransactions.length > 0) {
      recentTransactions.forEach(t => {
        console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (User: ${t.user_id.substring(0, 8)}...)`);
      });
    } else {
      console.log('   ❌ NO RECENT TRANSACTIONS FOUND');
    }
    
    // Check recent notifications  
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('user_id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`\n🔔 Recent notifications (last 10):`);
    if (recentNotifications && recentNotifications.length > 0) {
      recentNotifications.forEach(n => {
        console.log(`   📢 ${n.title} (User: ${n.user_id.substring(0, 8)}...)`);
      });
    } else {
      console.log('   ❌ NO RECENT NOTIFICATIONS FOUND');
    }
    
    // Summary
    console.log(`\n📋 SUMMARY:`);
    console.log(`   Users with SPA: ${allRankings?.length || 0}`);
    console.log(`   Recent transactions: ${recentTransactions?.length || 0}`);
    console.log(`   Recent notifications: ${recentNotifications?.length || 0}`);
    
    if ((allRankings?.length || 0) > 0 && (recentTransactions?.length || 0) === 0) {
      console.log(`\n🚨 ISSUE CONFIRMED:`);
      console.log(`   ✅ Users have SPA balances`);
      console.log(`   ❌ No spa_transactions (explains missing transaction history in UI)`);
      console.log(`   ❌ No/few notifications (explains missing notifications in UI)`);
      console.log(`\n💡 LIKELY CAUSE:`);
      console.log(`   - SPA balance is being updated directly in database`);
      console.log(`   - Our milestoneService.ts transaction/notification logic is not running`);
      console.log(`   - Need to check if there's another service updating SPA`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSPAIssue();
