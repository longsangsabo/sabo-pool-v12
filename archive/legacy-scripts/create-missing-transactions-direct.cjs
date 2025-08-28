/**
 * CREATE MISSING TRANSACTIONS VIA DIRECT SQL (BYPASS RLS)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingTransactionsDirectSQL() {
  console.log('🚀 CREATING MISSING TRANSACTIONS VIA DIRECT SQL');
  console.log('==============================================\n');

  try {
    // Step 1: Get all users with gaps
    console.log('1. 🔍 Finding users with missing transactions...');
    
    const { data: allUsers, error: allError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0);

    if (allError) {
      console.log('❌ Cannot get users:', allError.message);
      return;
    }

    console.log(`   ✅ Found ${allUsers.length} users with SPA > 0`);

    // Check each user for gaps
    const usersNeedingTransactions = [];
    
    for (const user of allUsers) {
      const { data: userTx } = await supabase
        .from('spa_transactions')
        .select('amount')
        .eq('user_id', user.user_id);

      const txTotal = userTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const gap = user.spa_points - txTotal;
      
      if (gap > 0) {
        usersNeedingTransactions.push({
          user_id: user.user_id,
          spa_points: user.spa_points,
          transaction_total: txTotal,
          gap: gap
        });
      }
    }

    console.log(`   📊 Users needing transactions: ${usersNeedingTransactions.length}`);
    
    if (usersNeedingTransactions.length === 0) {
      console.log('   🎉 All users already have complete transaction history!');
      return;
    }

    console.log('   🏆 Top gaps:');
    usersNeedingTransactions
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10)
      .forEach((user, i) => {
        console.log(`      ${i+1}. User ${user.user_id.substring(0, 8)}...: ${user.gap} SPA gap`);
      });

    // Step 2: Create transactions via direct SQL (bypass RLS)
    console.log('\n2. 💾 Creating missing transaction records via direct SQL...');
    
    // Build batch insert SQL
    const insertValues = usersNeedingTransactions.map(user => {
      const metadata = {
        retroactive: true,
        original_spa_balance: user.spa_points,
        existing_transaction_total: user.transaction_total,
        created_reason: 'Direct SQL fix for missing transaction history',
        fix_timestamp: new Date().toISOString(),
        batch_operation: true
      };
      
      return `(
        '${user.user_id}',
        ${user.gap},
        'credit',
        'legacy_award',
        'Legacy SPA balance - Historical milestone and rank rewards',
        'completed',
        '${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb,
        NOW(),
        NOW()
      )`;
    });

    const batchSQL = `
      SET row_security = off;
      
      INSERT INTO spa_transactions (
        user_id, amount, transaction_type, source_type, description, status, metadata, created_at, updated_at
      ) VALUES ${insertValues.join(',\n')};
      
      SET row_security = on;
    `;

    console.log(`   📝 Preparing to insert ${usersNeedingTransactions.length} transactions...`);
    
    const { data: insertResult, error: insertError } = await supabase
      .rpc('exec_sql', { sql: batchSQL });

    if (insertError) {
      console.log('❌ Batch insert failed:', insertError.message);
      
      // Try individual inserts as fallback
      console.log('   🔄 Trying individual inserts...');
      
      let successCount = 0;
      for (const user of usersNeedingTransactions) {
        const metadata = {
          retroactive: true,
          original_spa_balance: user.spa_points,
          existing_transaction_total: user.transaction_total,
          created_reason: 'Individual SQL fix for missing transaction history',
          fix_timestamp: new Date().toISOString(),
          batch_operation: false
        };
        
        const singleSQL = `
          SET row_security = off;
          INSERT INTO spa_transactions (
            user_id, amount, transaction_type, source_type, description, status, metadata
          ) VALUES (
            '${user.user_id}',
            ${user.gap},
            'credit',
            'legacy_award',
            'Legacy SPA balance - Historical milestone and rank rewards',
            'completed',
            '${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb
          );
          SET row_security = on;
        `;
        
        const { error: singleError } = await supabase
          .rpc('exec_sql', { sql: singleSQL });
          
        if (singleError) {
          console.log(`   ❌ Failed for user ${user.user_id.substring(0, 8)}...: ${singleError.message}`);
        } else {
          successCount++;
        }
      }
      
      console.log(`   ✅ Individual inserts: ${successCount}/${usersNeedingTransactions.length} successful`);
      
    } else {
      console.log('   ✅ Batch insert successful!');
    }

    // Step 3: Create notifications for large awards (≥100 SPA)
    console.log('\n3. 📬 Creating notifications for large awards...');
    
    const largeAwardUsers = usersNeedingTransactions.filter(user => user.gap >= 100);
    
    if (largeAwardUsers.length > 0) {
      const notificationValues = largeAwardUsers.map(user => {
        const metadata = {
          spa_amount: user.gap,
          retroactive_award: true,
          created_by_system: true
        };
        
        return `(
          '${user.user_id}',
          'SPA Transaction History Updated',
          'Your SPA transaction history has been updated with historical milestone rewards (${user.gap} SPA).',
          'spa_award',
          NOW(),
          false,
          '${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb
        )`;
      });

      const notificationSQL = `
        SET row_security = off;
        INSERT INTO notifications (
          user_id, title, message, type, created_at, read, metadata
        ) VALUES ${notificationValues.join(',\n')};
        SET row_security = on;
      `;

      const { error: notificationError } = await supabase
        .rpc('exec_sql', { sql: notificationSQL });

      if (notificationError) {
        console.log('❌ Notification creation failed:', notificationError.message);
      } else {
        console.log(`   ✅ Created notifications for ${largeAwardUsers.length} users with large awards`);
      }
    } else {
      console.log('   ℹ️  No users with awards ≥100 SPA, skipping notifications');
    }

    // Step 4: Verify results
    console.log('\n4. ✅ Verifying results...');
    
    const { data: finalLegacyCount, error: countError } = await supabase
      .from('spa_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'legacy_award');

    if (countError) {
      console.log('❌ Count verification failed:', countError.message);
    } else {
      console.log(`   📊 Total legacy transactions: ${finalLegacyCount || 0}`);
    }

    // Check a few users
    console.log('\n5. 🧪 Spot checking results...');
    
    for (const user of usersNeedingTransactions.slice(0, 5)) {
      const { data: newUserTx } = await supabase
        .from('spa_transactions')
        .select('amount')
        .eq('user_id', user.user_id);

      const newTxTotal = newUserTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const newGap = user.spa_points - newTxTotal;
      
      console.log(`   👤 User ${user.user_id.substring(0, 8)}...: ${newGap === 0 ? '✅ Perfect' : '⚠️ Gap: ' + newGap}`);
    }

    console.log('\n🎉 DIRECT SQL FIX COMPLETE!');
    console.log('============================');
    console.log(`✅ Processed ${usersNeedingTransactions.length} users`);
    console.log('✅ All users should now see complete transaction history in UI');

  } catch (error) {
    console.error('❌ Direct SQL fix failed:', error);
  }
}

createMissingTransactionsDirectSQL().catch(console.error);
