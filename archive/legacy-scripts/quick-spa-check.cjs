// ============================================================================
// QUICK SPA CHECK - ĐƠN GIẢN HÓA
// ============================================================================
// Purpose: Kiểm tra nhanh user có bao nhiêu SPA thực tế
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function quickSpaCheck() {
  console.log('🔍 QUICK SPA CHECK');
  console.log('==================');
  
  try {
    const userId = '17460a1a-8da6-4ed1-be44-56ff4dcd9c26';
    
    // Check ALL places where SPA might be stored
    console.log('1. 📊 PROFILES TABLE:');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, spa_points')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
    } else {
      console.log(`   ${profile.display_name}: ${profile.spa_points || 0} SPA`);
    }
    
    console.log('\n2. 💰 PLAYER_RANKINGS TABLE:');
    const { data: ranking, error: rankingError } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();
    
    if (rankingError) {
      console.log('❌ Ranking error:', rankingError.message);
    } else {
      console.log(`   Player Rankings: ${ranking.spa_points || 0} SPA`);
    }
    
    console.log('\n3. 💳 SPA_TRANSACTIONS:');
    const { data: transactions, error: txError } = await supabase
      .from('spa_transactions')
      .select('amount, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (txError) {
      console.log('❌ Transaction error:', txError.message);
    } else {
      console.log(`   Found ${transactions?.length || 0} transactions:`);
      transactions?.forEach(tx => {
        console.log(`   ${tx.amount > 0 ? '+' : ''}${tx.amount} - ${tx.description} (${new Date(tx.created_at).toLocaleString()})`);
      });
    }
    
    console.log('\n4. 🎯 MILESTONE_AWARDS:');
    const { data: awards, error: awardError } = await supabase
      .from('milestone_awards')
      .select('spa_points_awarded, event_type, awarded_at')
      .eq('player_id', userId)
      .order('awarded_at', { ascending: false })
      .limit(5);
    
    if (awardError) {
      console.log('❌ Award error:', awardError.message);
    } else {
      console.log(`   Found ${awards?.length || 0} milestone awards:`);
      awards?.forEach(award => {
        console.log(`   +${award.spa_points_awarded} SPA - ${award.event_type} (${new Date(award.awarded_at).toLocaleString()})`);
      });
    }
    
    console.log('\n5. 📋 SUMMARY:');
    const totalAwarded = awards?.reduce((sum, a) => sum + a.spa_points_awarded, 0) || 0;
    const totalTransactions = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    
    console.log(`   Total awarded from milestones: ${totalAwarded} SPA`);
    console.log(`   Total from transactions: ${totalTransactions} SPA`);
    console.log(`   Current in profiles: ${profile?.spa_points || 0} SPA`);
    console.log(`   Current in player_rankings: ${ranking?.spa_points || 0} SPA`);
    
    console.log('\n6. 🎮 TEST CHALLENGE SCENARIO:');
    console.log('   Required SPA for typical challenge: 100 SPA');
    console.log(`   User has: ${ranking?.spa_points || 0} SPA`);
    console.log(`   Can join? ${(ranking?.spa_points || 0) >= 100 ? '✅ YES' : '❌ NO'}`);
    
    if ((ranking?.spa_points || 0) >= 100) {
      console.log('\n🎉 USER HAS ENOUGH SPA - THE ISSUE IS IN THE FRONTEND!');
    } else {
      console.log('\n⚠️ User actually doesn\'t have enough SPA');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

quickSpaCheck();
