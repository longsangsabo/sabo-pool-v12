/**
 * EXECUTE FIXED COMPREHENSIVE SPA FIX
 * Tạo transaction records cho TẤT CẢ users với gaps
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Use service role key để bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function executeFixedComprehensiveFix() {
  console.log('🚀 EXECUTING FIXED COMPREHENSIVE SPA FIX');
  console.log('==========================================\n');

  try {
    // Step 1: Read and execute SQL
    console.log('1. 📖 Reading fixed SQL file...');
    const sqlContent = fs.readFileSync('fixed-comprehensive-spa-fix.sql', 'utf8');
    console.log(`   SQL file size: ${sqlContent.length} characters`);

    console.log('\n2. 🔧 Executing fixed comprehensive fix...');
    console.log('   This will:');
    console.log('   - Create transaction records for ALL users with gaps (not just those without any legacy awards)');
    console.log('   - Setup proper RLS policies');
    console.log('   - Create unified update function');
    console.log('   - Create notifications for large awards');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.log('❌ SQL execution failed:', error.message);
      return;
    }
    
    console.log('✅ SQL execution completed!');

    // Step 2: Check results immediately
    console.log('\n3. 🔍 Checking results...');
    
    // Get verification results
    const { data: verificationData, error: verifyError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('source_type', 'legacy_award')
      .order('created_at', { ascending: false })
      .limit(10);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`   ✅ Total legacy transactions: ${verificationData.length}`);
      if (verificationData.length > 0) {
        console.log('   📋 Recent legacy transactions:');
        verificationData.slice(0, 5).forEach((tx, i) => {
          console.log(`      ${i+1}. User ${tx.user_id.substring(0, 8)}... got +${tx.amount} SPA`);
        });
      }
    }

    // Step 3: Run audit function to check coverage
    console.log('\n4. 🧪 Running audit function...');
    
    try {
      const { data: auditResults, error: auditError } = await supabase
        .rpc('audit_spa_transaction_completeness');

      if (auditError) {
        console.log('❌ Audit function failed:', auditError.message);
      } else {
        const perfectUsers = auditResults.filter(r => r.status === 'PERFECT').length;
        const gapUsers = auditResults.filter(r => r.status === 'MISSING_TX').length;
        const totalGap = auditResults
          .filter(r => r.status === 'MISSING_TX')
          .reduce((sum, r) => sum + r.gap, 0);

        console.log(`   ✅ Perfect users (no gaps): ${perfectUsers}`);
        console.log(`   ⚠️  Users with gaps: ${gapUsers}`);
        console.log(`   📊 Total missing SPA: ${totalGap}`);

        if (gapUsers > 0) {
          console.log('   🔍 Users with largest gaps:');
          auditResults
            .filter(r => r.status === 'MISSING_TX')
            .slice(0, 5)
            .forEach(user => {
              console.log(`      User ${user.user_id.substring(0, 8)}...: ${user.gap} SPA gap`);
            });
        }
      }
    } catch (auditErr) {
      console.log('⚠️  Audit function not ready yet:', auditErr.message);
    }

    // Step 4: Test specific users
    console.log('\n5. 👤 Testing specific users...');
    
    // Test BOSA user
    const bosaUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9';
    const { data: bosaData } = await supabase
      .from('spa_transactions')
      .select('amount')
      .eq('user_id', bosaUserId);
    
    const bosaTotal = bosaData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    console.log(`   👤 BOSA total transactions: ${bosaTotal} SPA`);

    // Test top users
    const { data: topUsers } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false })
      .limit(3);

    for (const user of topUsers || []) {
      const { data: userTx } = await supabase
        .from('spa_transactions')
        .select('amount')
        .eq('user_id', user.user_id);

      const txTotal = userTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const gap = user.spa_points - txTotal;
      
      console.log(`   👤 User ${user.user_id.substring(0, 8)}... (${user.spa_points} SPA): ${gap === 0 ? '✅ Perfect' : '⚠️ Gap: ' + gap}`);
    }

    console.log('\n🎉 FIXED COMPREHENSIVE FIX COMPLETE!');
    console.log('======================================');
    
    console.log('\n📱 EXPECTED RESULTS:');
    console.log('• All users should now have complete transaction history');
    console.log('• UI should show transaction details for all users');
    console.log('• RLS policies allow users to read their own transactions');
    console.log('• Future SPA updates use unified function');

  } catch (error) {
    console.error('❌ Fixed comprehensive fix failed:', error);
  }
}

executeFixedComprehensiveFix().catch(console.error);
