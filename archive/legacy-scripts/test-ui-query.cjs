/**
 * VERIFY UI FIX BY TESTING QUERY
 * Test exact query mà UI sẽ chạy để hiển thị SPA transaction history
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use anon key như UI thực tế
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testUIQuery() {
  console.log('🧪 TESTING UI QUERY FOR SPA TRANSACTIONS');
  console.log('========================================\n');

  const testUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9'; // BOSA user

  try {
    // Step 1: Test exact query from SpaHistoryTab.tsx
    console.log('1. 📱 Testing SpaHistoryTab.tsx query...');
    console.log(`   User ID: ${testUserId.substring(0, 8)}... (BOSA)`);
    
    const { data: transactions, error: txError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    if (txError) {
      console.log('❌ Query failed:', txError.message);
      console.log('   This means UI will also fail and show "Chưa có giao dịch SPA nào"');
      return;
    }

    console.log(`✅ Query successful - found ${transactions.length} transactions`);
    
    if (transactions.length === 0) {
      console.log('📋 UI will show: "Chưa có giao dịch SPA nào"');
      console.log('   This confirms the problem - no transaction records exist');
    } else {
      console.log('📋 UI will show transaction history:');
      transactions.forEach((tx, i) => {
        console.log(`   ${i+1}. ${tx.transaction_type === 'credit' ? '+' : '-'}${Math.abs(tx.amount)} SPA`);
        console.log(`      From: ${tx.source_type}`);
        console.log(`      Description: ${tx.description}`);
        console.log(`      Date: ${new Date(tx.created_at).toLocaleString()}`);
      });
    }

    // Step 2: Test user's SPA balance
    console.log('\n2. 💰 Testing SPA balance query...');
    
    const { data: ranking, error: rankError } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', testUserId)
      .single();

    if (rankError) {
      console.log('❌ Balance query failed:', rankError.message);
    } else {
      console.log(`✅ Current SPA balance: ${ranking.spa_points}`);
      
      const txTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      console.log(`   Transaction total: ${txTotal}`);
      console.log(`   Gap: ${ranking.spa_points - txTotal} SPA`);
    }

    // Step 3: Simulate UI component behavior
    console.log('\n3. 🖥️  UI Component Simulation...');
    
    if (transactions.length === 0) {
      console.log(`
📱 SpaHistoryTab.tsx will render:
┌─────────────────────────────────────────┐
│  Số dư SPA hiện tại                     │
│  ${ranking?.spa_points || 0} SPA                                │
│                                         │
│  ❌ Chưa có giao dịch SPA nào           │
│                                         │
└─────────────────────────────────────────┘
      `);
    } else {
      console.log(`
📱 SpaHistoryTab.tsx will render:
┌─────────────────────────────────────────┐
│  Số dư SPA hiện tại                     │
│  ${ranking?.spa_points || 0} SPA                                │
│                                         │
│  📊 Lịch sử giao dịch (${transactions.length})                │
│  ${transactions.map(tx => `│  • ${tx.description.substring(0, 30)}...`).join('\n')}
│                                         │
└─────────────────────────────────────────┘
      `);
    }

    // Step 4: Provide solution
    console.log('\n4. 🔧 SOLUTION STATUS:');
    
    if (transactions.length === 0) {
      console.log('❌ PROBLEM CONFIRMED: No transaction records found');
      console.log('');
      console.log('🎯 TO FIX THIS:');
      console.log('1. Login to Supabase Dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Run this SQL:');
      console.log(`
INSERT INTO public.spa_transactions (
  user_id, amount, transaction_type, source_type, 
  description, status, metadata
) VALUES (
  '${testUserId}',
  ${ranking?.spa_points || 350},
  'credit',
  'legacy_award',
  'Legacy SPA balance - Historical milestone rewards',
  'completed',
  '{"retroactive": true}'::jsonb
);
      `);
      console.log('4. Refresh the app - user should see transaction history');
    } else {
      console.log('✅ PROBLEM FIXED: Transaction records exist');
      console.log('   User should now see transaction history in UI');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUIQuery().catch(console.error);
