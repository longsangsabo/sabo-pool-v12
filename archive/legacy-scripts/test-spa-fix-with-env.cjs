/**
 * TEST SPA FIX WITH SERVICE ROLE KEY FROM ENV
 * Verify transaction records were created for all users
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key from env to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testSpaFixResults() {
  console.log('🧪 TESTING SPA FIX RESULTS WITH SERVICE ROLE');
  console.log('===========================================\n');

  try {
    // Step 1: Check total legacy transactions created
    console.log('1. 📊 Checking legacy transaction records...');
    
    const { data: legacyTransactions, error: legacyError } = await supabase
      .from('spa_transactions')
      .select('user_id, amount, created_at')
      .eq('source_type', 'legacy_award')
      .order('created_at', { ascending: false });

    if (legacyError) {
      console.log('❌ Error getting legacy transactions:', legacyError.message);
      return;
    }

    console.log(`✅ Found ${legacyTransactions.length} legacy transaction records`);
    console.log('📋 Recent legacy transactions:');
    
    legacyTransactions.slice(0, 5).forEach((tx, i) => {
      console.log(`   ${i+1}. User ${tx.user_id.substring(0, 8)}... +${tx.amount} SPA`);
      console.log(`      Created: ${new Date(tx.created_at).toLocaleString()}`);
    });

    // Step 2: Check specific user BOSA
    console.log('\n2. 🎯 Checking BOSA user specifically...');
    
    const bosaUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9';
    
    const { data: bosaTransactions, error: bosaError } = await supabase
      .from('spa_transactions')
      .select('amount, description, created_at, source_type')
      .eq('user_id', bosaUserId)
      .order('created_at', { ascending: false });

    if (bosaError) {
      console.log('❌ Error getting BOSA transactions:', bosaError.message);
    } else {
      console.log(`   BOSA transaction count: ${bosaTransactions.length}`);
      const txTotal = bosaTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      console.log(`   BOSA transaction total: ${txTotal} SPA`);
      
      console.log('   📋 BOSA transactions:');
      bosaTransactions.forEach((tx, i) => {
        console.log(`      ${i+1}. +${tx.amount} SPA from ${tx.source_type}`);
        console.log(`         ${tx.description}`);
      });
    }

    // Step 3: Check users with SPA vs transaction gaps
    console.log('\n3. 🔍 Checking remaining gaps...');
    
    const { data: usersWithSpa, error: usersError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false })
      .limit(10);

    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
    } else {
      console.log(`   Checking top ${usersWithSpa.length} users with SPA...\n`);
      
      let fixedUsers = 0;
      let remainingGaps = 0;
      
      for (const user of usersWithSpa) {
        // Get user transactions
        const { data: userTx } = await supabase
          .from('spa_transactions')
          .select('amount')
          .eq('user_id', user.user_id);
        
        const txTotal = userTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const gap = user.spa_points - txTotal;
        
        if (gap === 0) {
          fixedUsers++;
        } else if (gap > 0) {
          remainingGaps++;
          console.log(`   ⚠️  User ${user.user_id.substring(0, 8)}... still has ${gap} SPA gap`);
        }
      }
      
      console.log(`\n📊 Gap Analysis:`);
      console.log(`   ✅ Fixed users: ${fixedUsers}/${usersWithSpa.length}`);
      console.log(`   ❌ Users with remaining gaps: ${remainingGaps}`);
      
      if (remainingGaps === 0) {
        console.log('🎉 ALL GAPS FIXED! Every user should now see transaction history');
      }
    }

    // Step 4: Test UI query simulation with anon key
    console.log('\n4. 🖥️  Testing UI query with anon key...');
    
    const anonSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data: anonQuery, error: anonError } = await anonSupabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', bosaUserId)
      .order('created_at', { ascending: false });

    if (anonError) {
      console.log('❌ Anon query failed:', anonError.message);
      console.log('   This means UI will still show "Chưa có giao dịch SPA nào"');
      console.log('   RLS policy may be blocking anon access to transactions');
    } else {
      console.log(`✅ Anon query successful: ${anonQuery.length} transactions visible`);
      if (anonQuery.length > 0) {
        console.log('🎉 UI should now show transaction history!');
      } else {
        console.log('⚠️  UI will still show "Chưa có giao dịch SPA nào" - RLS issue');
      }
    }

    // Step 5: Summary and next steps
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log(`✅ Legacy transactions created: ${legacyTransactions.length}`);
    console.log(`✅ Service role can see transactions: Yes`);
    console.log(`${anonQuery && anonQuery.length > 0 ? '✅' : '❌'} Anon key can see transactions: ${anonQuery ? 'Yes' : 'No'}`);
    
    if (!anonQuery || anonQuery.length === 0) {
      console.log('\n🔧 NEXT STEPS NEEDED:');
      console.log('1. Check RLS policies on spa_transactions table');
      console.log('2. Ensure authenticated users can read their own transactions');
      console.log('3. May need to update RLS policy to allow users to see their own records');
    } else {
      console.log('\n🎉 SUCCESS! Fix is complete and working!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSpaFixResults().catch(console.error);
