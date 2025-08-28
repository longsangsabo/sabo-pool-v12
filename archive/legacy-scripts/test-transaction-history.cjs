const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testTransactionHistory() {
  try {
    console.log('🔍 Testing SPA transaction history for milestone rewards...\n');

    // 1. Check current milestone awards from today
    const { data: milestoneAwards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('*, milestones(name, spa_reward)')
      .eq('event_type', 'rank_registration')
      .gte('awarded_at', '2025-08-22T00:00:00Z')
      .order('awarded_at', { ascending: false });

    if (awardsError) {
      console.error('Error fetching milestone awards:', awardsError);
      return;
    }

    console.log(`📋 Found ${milestoneAwards.length} milestone awards from today`);

    // 2. Check corresponding transaction records
    for (const award of milestoneAwards) {
      console.log(`\n👤 Checking user ${award.player_id.slice(0, 8)}...`);
      console.log(`   🏆 Milestone: ${award.milestones?.name || 'Unknown'} (+${award.spa_points_awarded} SPA)`);
      console.log(`   📅 Awarded: ${award.awarded_at}`);

      // Check if transaction record exists
      const { data: transactions, error: txError } = await supabase
        .from('spa_transactions')
        .select('*')
        .eq('user_id', award.player_id)
        .eq('reference_id', award.milestone_id)
        .eq('source_type', 'milestone_reward');

      if (txError) {
        console.log(`   ❌ Error checking transactions: ${txError.message}`);
        continue;
      }

      if (transactions.length === 0) {
        console.log(`   ❌ NO TRANSACTION RECORD - User won't see transaction history`);
      } else {
        console.log(`   ✅ HAS TRANSACTION RECORD - User will see detailed history`);
        transactions.forEach(tx => {
          console.log(`      - ${tx.description} (+${tx.amount} SPA)`);
          console.log(`      - Created: ${tx.created_at}`);
        });
      }
    }

    // 3. Test what user sees in transaction history
    console.log('\n🧪 Testing user transaction history views...');
    console.log('='.repeat(60));

    const uniqueUsers = [...new Set(milestoneAwards.map(award => award.player_id))];
    
    for (const userId of uniqueUsers.slice(0, 3)) { // Test first 3 users
      console.log(`\n👤 User ${userId.slice(0, 8)} transaction history:`);

      // Simulate what SpaHistoryTab.tsx queries
      const { data: userTransactions, error: userTxError } = await supabase
        .from('spa_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userTxError) {
        console.log(`   ❌ Error: ${userTxError.message}`);
        continue;
      }

      if (userTransactions.length === 0) {
        console.log(`   📝 No transaction history - User will see empty list`);
      } else {
        console.log(`   📝 Transaction history (${userTransactions.length} records):`);
        userTransactions.forEach((tx, index) => {
          const sourceLabel = {
            'milestone_reward': '🏆 Milestone',
            'legacy_award': '📜 Lịch sử cũ',
            'tournament_reward': '🏅 Giải đấu',
            'challenge_win': '⚔️ Thách đấu'
          }[tx.source_type] || '❓ Khác';

          console.log(`      ${index + 1}. ${sourceLabel}: ${tx.description}`);
          console.log(`         +${tx.amount} SPA • ${new Date(tx.created_at).toLocaleString()}`);
        });
      }

      // Check total from transactions vs current SPA
      const totalFromTransactions = userTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      const { data: ranking } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      const currentSpa = ranking?.spa_points || 0;
      
      console.log(`   💰 Current SPA: ${currentSpa}`);
      console.log(`   📊 Transaction total: ${totalFromTransactions}`);
      
      if (currentSpa === totalFromTransactions) {
        console.log(`   ✅ PERFECT MATCH - Complete transaction history`);
      } else {
        console.log(`   ⚠️  MISMATCH - Missing ${currentSpa - totalFromTransactions} SPA in history`);
      }
    }

    // 4. Summary and recommendations
    console.log('\n' + '='.repeat(60));
    console.log('📊 TRANSACTION HISTORY ANALYSIS SUMMARY');
    console.log('='.repeat(60));

    const totalAwards = milestoneAwards.length;
    let awardsWithTransactions = 0;

    for (const award of milestoneAwards) {
      const { data: tx } = await supabase
        .from('spa_transactions')
        .select('id')
        .eq('user_id', award.player_id)
        .eq('reference_id', award.milestone_id)
        .eq('source_type', 'milestone_reward')
        .limit(1);

      if (tx && tx.length > 0) {
        awardsWithTransactions++;
      }
    }

    console.log(`🏆 Total milestone awards today: ${totalAwards}`);
    console.log(`📝 Awards with transaction records: ${awardsWithTransactions}`);
    console.log(`📈 Coverage: ${((awardsWithTransactions / totalAwards) * 100).toFixed(1)}%`);

    if (awardsWithTransactions === totalAwards) {
      console.log('🎉 PERFECT! All milestone awards have transaction history');
      console.log('Users will see detailed transaction sources in their SPA tab');
    } else {
      const missing = totalAwards - awardsWithTransactions;
      console.log(`⚠️  ${missing} milestone awards missing transaction records`);
      console.log('Users will see SPA balance but not detailed source history');
      console.log('\n💡 RECOMMENDATION:');
      console.log('1. Deploy update-milestone-transaction-system.sql in Supabase Dashboard');
      console.log('2. The function will automatically create missing transaction records');
      console.log('3. Future milestone awards will automatically create transaction history');
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error testing transaction history:', error);
  }
}

// Run the test
testTransactionHistory();
