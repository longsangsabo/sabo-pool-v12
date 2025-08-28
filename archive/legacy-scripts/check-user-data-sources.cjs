const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkTableStructures() {
  console.log('🔍 KIỂM TRA CẤU TRÚC BẢNG DỮ LIỆU');
  console.log('=================================');

  const userId = 'b58d9334-b9e9-4039-8c13-a6c70b88c688';

  try {
    // 1. Kiểm tra player_rankings structure
    console.log('\n1. 📋 player_rankings structure:');
    const { data: rankingData, error: rankError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (rankError) {
      console.log('❌ Lỗi:', rankError.message);
    } else {
      console.log('✅ player_rankings columns:');
      Object.keys(rankingData).forEach(col => {
        console.log(`  - ${col}: ${typeof rankingData[col]} = ${JSON.stringify(rankingData[col])}`);
      });
    }

    // 2. Kiểm tra user_activities
    console.log('\n2. 📋 user_activities cho user này:');
    const { data: activities, error: actError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (actError) {
      console.log('❌ Lỗi:', actError.message);
    } else {
      console.log(`✅ Có ${activities.length} activities`);
      activities.forEach((act, i) => {
        console.log(`  ${i+1}. [${act.created_at.substring(0, 10)}] ${act.activity_type}`);
        console.log(`     Points: ${act.spa_points_earned} | Description: ${act.description}`);
      });
    }

    // 3. Kiểm tra achievements
    console.log('\n3. 📋 user_achievements:');
    const { data: achievements, error: achError } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (achError) {
      console.log('❌ Lỗi:', achError.message);
    } else {
      console.log(`✅ Có ${achievements.length} achievements`);
      let totalFromAchievements = 0;
      achievements.forEach((ach, i) => {
        const spaReward = ach.achievements?.spa_reward || 0;
        totalFromAchievements += spaReward;
        console.log(`  ${i+1}. [${ach.unlocked_at?.substring(0, 10)}] ${ach.achievements?.name}`);
        console.log(`     +${spaReward} SPA | ${ach.achievements?.description}`);
      });
      console.log(`📈 TOTAL từ achievements: ${totalFromAchievements} SPA`);
    }

    // 4. Kiểm tra legacy_spa_points
    console.log('\n4. 📋 legacy_spa_points:');
    const { data: legacy, error: legError } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .eq('user_id', userId);

    if (legError) {
      console.log('❌ Lỗi:', legError.message);
    } else {
      console.log(`✅ Có ${legacy.length} legacy records`);
      let totalLegacy = 0;
      legacy.forEach((leg, i) => {
        totalLegacy += leg.points;
        console.log(`  ${i+1}. +${leg.points} SPA - ${leg.source}`);
        console.log(`     Reason: ${leg.reason} | Created: ${leg.created_at.substring(0, 10)}`);
      });
      console.log(`📈 TOTAL từ legacy: ${totalLegacy} SPA`);
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

checkTableStructures();
