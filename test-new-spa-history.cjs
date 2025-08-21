const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testNewSpaHistoryLogic() {
  console.log('🧪 TESTING NEW SPA HISTORY LOGIC');
  console.log('=================================');

  const userId = 'b58d9334-b9e9-4039-8c13-a6c70b88c688'; // User sabo

  try {
    // Simulate new SpaHistoryTab logic
    console.log('🔍 Fetching SPA history from multiple tables...');
    
    // 1. Fetch from spa_points_log (most detailed)
    const { data: pointsLogData, error: pointsLogError } = await supabase
      .from('spa_points_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 2. Fetch from spa_transactions (legacy/fallback)
    const { data: transactionData, error } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || pointsLogError) {
      console.error('Error fetching SPA data:', { error, pointsLogError });
      return;
    }

    // Convert and merge all data sources
    const allTransactions = [];

    console.log('\n📋 PROCESSING DATA SOURCES:');
    
    // 1. Process spa_points_log (primary source)
    console.log(`\n1️⃣ spa_points_log: ${pointsLogData?.length || 0} records`);
    if (pointsLogData && pointsLogData.length > 0) {
      pointsLogData.forEach((log, i) => {
        console.log(`  ${i+1}. [${log.created_at.substring(0, 10)}] +${log.points} SPA`);
        console.log(`     Category: ${log.category} | Description: ${log.description}`);
        console.log(`     Ref: ${log.reference_id?.substring(0, 8)}...`);
        
        allTransactions.push({
          id: `log_${log.id}`,
          amount: log.points,
          source_type: log.category || 'milestone',
          description: log.description || `+${log.points} SPA`,
          created_at: log.created_at,
          source: 'spa_points_log'
        });
      });
    }

    // 2. Process spa_transactions (only if no detailed records)
    console.log(`\n2️⃣ spa_transactions: ${transactionData?.length || 0} records`);
    if (transactionData && transactionData.length > 0) {
      transactionData.forEach((tx, i) => {
        console.log(`  ${i+1}. [${tx.created_at.substring(0, 10)}] ${tx.amount > 0 ? '+' : ''}${tx.amount} SPA`);
        console.log(`     Type: ${tx.source_type} | Description: ${tx.description}`);
        
        // Only add if no detailed records found
        if (allTransactions.length === 0) {
          allTransactions.push({
            id: tx.id,
            amount: tx.amount,
            source_type: tx.source_type || 'legacy',
            description: tx.description,
            created_at: tx.created_at,
            source: 'spa_transactions'
          });
        }
      });
    }

    // Sort by date
    allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`\n🎯 FINAL RESULT: ${allTransactions.length} transactions to display`);
    console.log('===============================================');
    
    allTransactions.forEach((tx, i) => {
      console.log(`${i+1}. [${tx.created_at.substring(0, 10)}] ${tx.amount > 0 ? '+' : ''}${tx.amount} SPA`);
      console.log(`   📂 Source: ${tx.source} | Type: ${tx.source_type}`);
      console.log(`   📝 ${tx.description}`);
      console.log(`   ID: ${tx.id}`);
      console.log('');
    });

    if (allTransactions.length > 0) {
      console.log('✅ SUCCESS: User sẽ thấy được chi tiết thay vì chỉ "legacy award"!');
    } else {
      console.log('❌ ISSUE: Vẫn không có detailed records');
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

testNewSpaHistoryLogic();
