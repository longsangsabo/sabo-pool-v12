const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function directTableCheck() {
  try {
    console.log('🔍 DIRECT TABLE STRUCTURE CHECK');
    console.log('==============================\n');
    
    // Try different possible column names for SPA balance
    const possibleQueries = [
      { name: 'spa_points', query: () => supabase.from('player_rankings').select('user_id, spa_points').limit(5) },
      { name: 'spa_balance', query: () => supabase.from('player_rankings').select('user_id, spa_balance').limit(5) },
      { name: 'spa', query: () => supabase.from('player_rankings').select('user_id, spa').limit(5) },
      { name: 'points', query: () => supabase.from('player_rankings').select('user_id, points').limit(5) }
    ];
    
    let workingQuery = null;
    
    for (const test of possibleQueries) {
      try {
        console.log(`Testing column: ${test.name}...`);
        const { data, error } = await test.query();
        if (!error) {
          console.log(`✅ Column '${test.name}' exists!`);
          console.log(`   Found ${data?.length || 0} records`);
          if (data && data.length > 0) {
            console.log(`   Sample data:`, data[0]);
          }
          workingQuery = test;
          break;
        } else {
          console.log(`❌ Column '${test.name}' does not exist: ${error.message}`);
        }
      } catch (e) {
        console.log(`❌ Column '${test.name}' error: ${e.message}`);
      }
    }
    
    if (!workingQuery) {
      console.log('\n❌ Could not find SPA column. Let\'s check the table structure:');
      
      // Get all columns
      try {
        const { data, error } = await supabase.from('player_rankings').select('*').limit(1);
        if (!error && data && data.length > 0) {
          console.log('\n📋 Available columns in player_rankings:');
          Object.keys(data[0]).forEach(col => {
            console.log(`   - ${col}: ${typeof data[0][col]} = ${data[0][col]}`);
          });
        } else {
          console.log('❌ Could not fetch table structure:', error);
        }
      } catch (e) {
        console.log('❌ Error fetching table structure:', e.message);
      }
      return;
    }
    
    // Now let's check SPA transactions and notifications
    console.log('\n💳 Checking spa_transactions table:');
    try {
      const { data: transactions, error: txError } = await supabase
        .from('spa_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!txError) {
        console.log(`   Found ${transactions?.length || 0} transactions`);
        if (transactions && transactions.length > 0) {
          transactions.slice(0, 3).forEach(t => {
            console.log(`   - ${t.amount} SPA for user ${t.user_id.substring(0, 8)}... (${t.description})`);
          });
        }
      } else {
        console.log(`   ❌ Error: ${txError.message}`);
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    console.log('\n🔔 Checking notifications table:');
    try {
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!notifError) {
        console.log(`   Found ${notifications?.length || 0} notifications`);
        if (notifications && notifications.length > 0) {
          notifications.slice(0, 3).forEach(n => {
            console.log(`   - "${n.title}" for user ${n.user_id.substring(0, 8)}...`);
          });
        }
      } else {
        console.log(`   ❌ Error: ${notifError.message}`);
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
    // Check if there's a wallets table that might have SPA balance
    console.log('\n💰 Checking wallets table:');
    try {
      const { data: wallets, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .gt('points_balance', 0)
        .limit(5);
      
      if (!walletError) {
        console.log(`   Found ${wallets?.length || 0} wallets with points`);
        if (wallets && wallets.length > 0) {
          wallets.forEach(w => {
            console.log(`   - User ${w.user_id.substring(0, 8)}...: ${w.points_balance} points`);
          });
        }
      } else {
        console.log(`   ❌ Error: ${walletError.message}`);
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

directTableCheck();
