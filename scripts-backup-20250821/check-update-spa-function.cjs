const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUpdateSpaPointsFunction() {
  try {
    console.log('🔍 CHECKING update_spa_points FUNCTION');
    console.log('===================================\n');
    
    // Test the function to see if it exists and what it does
    console.log('🧪 Testing update_spa_points function with fake data...');
    
    // Use a non-existent user ID to test without affecting real data
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    try {
      const { data, error } = await supabase.rpc('update_spa_points', {
        p_user_id: testUserId,
        p_amount: 1,
        p_transaction_type: 'test',
        p_description: 'Test call to check function'
      });
      
      if (error) {
        console.log('❌ Function call failed:', error.message);
        if (error.message.includes('does not exist')) {
          console.log('   Function update_spa_points does not exist');
        }
      } else {
        console.log('✅ Function exists and responds');
        console.log('   Response:', data);
      }
    } catch (e) {
      console.log('❌ Function test error:', e.message);
    }
    
    // Now let's check what's really happening with real users
    console.log('\n🔍 Finding users and checking their transaction patterns...');
    
    // Get a sample of users from profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .not('user_id', 'is', null)
      .limit(5);
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found');
      return;
    }
    
    console.log(`Found ${profiles.length} users to check:`);
    
    for (const profile of profiles) {
      console.log(`\n👤 ${profile.full_name} (${profile.email}):`);
      
      // Check their ranking
      const { data: ranking } = await supabase
        .from('player_rankings')
        .select('spa_points, created_at, updated_at')
        .eq('user_id', profile.user_id)
        .single();
      
      if (ranking) {
        console.log(`   💰 SPA: ${ranking.spa_points || 0}`);
        console.log(`   📅 Updated: ${new Date(ranking.updated_at).toLocaleString()}`);
        
        // Check their transactions
        const { data: transactions } = await supabase
          .from('spa_transactions')
          .select('amount, description, created_at')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false });
        
        console.log(`   💳 Transactions: ${transactions?.length || 0}`);
        if (transactions && transactions.length > 0) {
          const total = transactions.reduce((sum, t) => sum + t.amount, 0);
          console.log(`      Total from transactions: ${total} SPA`);
          if (total !== (ranking.spa_points || 0)) {
            console.log(`      ⚠️  MISMATCH! Ranking has ${ranking.spa_points} but transactions total ${total}`);
          }
          
          // Show recent transactions
          transactions.slice(0, 3).forEach(t => {
            console.log(`      - ${t.amount > 0 ? '+' : ''}${t.amount} SPA: ${t.description}`);
          });
        } else {
          if ((ranking.spa_points || 0) > 0) {
            console.log(`      ⚠️  NO TRANSACTIONS but has ${ranking.spa_points} SPA!`);
            console.log(`      🔍 SPA was added directly to player_rankings`);
          }
        }
        
        // Check their notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('title, created_at')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        console.log(`   🔔 Recent notifications: ${notifications?.length || 0}`);
        if (notifications && notifications.length > 0) {
          notifications.forEach(n => {
            console.log(`      - ${n.title} (${new Date(n.created_at).toLocaleString()})`);
          });
        }
      } else {
        console.log(`   ❌ No ranking record`);
      }
    }
    
    console.log('\n📊 SUMMARY DIAGNOSIS:');
    console.log('Looking for patterns in SPA awards without transactions/notifications...');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUpdateSpaPointsFunction();
