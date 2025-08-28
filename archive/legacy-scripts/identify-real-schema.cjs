const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function identifyRealSchema() {
  console.log('🔍 TÌM HIỂU SCHEMA THỰC TẾ');
  console.log('=========================');

  const userId = 'b58d9334-b9e9-4039-8c13-a6c70b88c688';

  try {
    // 1. Kiểm tra player_rankings - không dùng single()
    console.log('\n1. 📋 player_rankings (all records):');
    const { data: rankings, error: rankError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId);

    if (rankError) {
      console.log('❌ Lỗi:', rankError.message);
    } else {
      console.log(`✅ Có ${rankings.length} records trong player_rankings`);
      rankings.forEach((rank, i) => {
        console.log(`\nRecord ${i+1}:`);
        Object.keys(rank).forEach(col => {
          console.log(`  ${col}: ${JSON.stringify(rank[col])}`);
        });
      });
    }

    // 2. Kiểm tra legacy_spa_points với player_id
    console.log('\n2. 📋 legacy_spa_points (với player_id):');
    const { data: legacy1, error: leg1Error } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .eq('player_id', userId);

    if (leg1Error) {
      console.log('❌ Lỗi với player_id:', leg1Error.message);
      
      // Thử với email thay vì ID
      console.log('\n   📋 Thử tìm theo email "sabo":');
      const { data: legacy2, error: leg2Error } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .ilike('player_id', '%sabo%');

      if (leg2Error) {
        console.log('❌ Lỗi với email:', leg2Error.message);
      } else {
        console.log(`✅ Tìm thấy ${legacy2.length} records theo email`);
        legacy2.forEach((leg, i) => {
          console.log(`  ${i+1}. Player: ${leg.player_id} | +${leg.points} SPA`);
          console.log(`     Source: ${leg.source} | Reason: ${leg.reason}`);
        });
      }
    } else {
      console.log(`✅ Có ${legacy1.length} legacy records`);
      legacy1.forEach((leg, i) => {
        console.log(`  ${i+1}. +${leg.points} SPA - ${leg.source}`);
      });
    }

    // 3. Kiểm tra spa_bonus_activities
    console.log('\n3. 📋 spa_bonus_activities:');
    const { data: bonus, error: bonusError } = await supabase
      .from('spa_bonus_activities')
      .select('*')
      .eq('user_id', userId);

    if (bonusError) {
      console.log('❌ Lỗi:', bonusError.message);
    } else {
      console.log(`✅ Có ${bonus.length} bonus activities`);
      bonus.forEach((b, i) => {
        console.log(`  ${i+1}. +${b.spa_points} SPA - ${b.activity_type}`);
        console.log(`     Description: ${b.description}`);
      });
    }

    // 4. Tìm hiểu cấu trúc spa_transactions để hiểu reference_id
    console.log('\n4. 📋 spa_transactions chi tiết:');
    const { data: transactions, error: txError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId);

    if (txError) {
      console.log('❌ Lỗi:', txError.message);
    } else {
      console.log(`✅ Có ${transactions.length} transactions`);
      transactions.forEach((tx, i) => {
        console.log(`\nTransaction ${i+1}:`);
        Object.keys(tx).forEach(col => {
          console.log(`  ${col}: ${JSON.stringify(tx[col])}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

identifyRealSchema();
