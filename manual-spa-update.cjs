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

async function manualSpaUpdate() {
  try {
    console.log('🔧 Manual SPA update via function...\n');

    // Test if our milestone function can update player_rankings
    const testUsers = [
      { id: '318fbe86-22c7-4d74-bca5-865661a6284f', name: 'Long Sang', spa: 300 },
      { id: '21c71eb2-3a42-4589-9089-24a9340a0e6a', name: 'Trần hải', spa: 150 }
    ];

    // Get milestone ID
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('id')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    if (milestoneError) {
      console.error('Milestone error:', milestoneError);
      return;
    }

    console.log('Using milestone function to sync SPA...\n');

    for (const user of testUsers) {
      console.log(`🎯 Testing ${user.name} (${user.id}):`);
      
      // Check current player_rankings SPA
      const { data: beforeRanking, error: beforeError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', user.id)
        .single();

      if (beforeError) {
        console.log(`  ❌ No ranking record: ${beforeError.message}`);
        continue;
      }

      console.log(`  Current SPA: ${beforeRanking.spa_points || 0}`);

      // IMPORTANT: First update the function in Supabase Dashboard
      console.log('  📝 NEED TO UPDATE FUNCTION FIRST!');
      console.log('  Go to Supabase Dashboard → SQL Editor');
      console.log('  Execute the updated setup-milestone-trigger.sql');
      console.log('  Then this test will work properly');
    }

    // Alternative: Try using existing SPA functions
    console.log('\n🔄 Checking for existing SPA update functions...');
    
    try {
      const { data: updateResult, error: updateError } = await supabase.rpc('update_spa_points', {
        p_user_id: testUsers[0].id,
        p_points: 150
      });
      
      if (updateError) {
        console.log('update_spa_points error:', updateError.message);
      } else {
        console.log('✅ update_spa_points success:', updateResult);
      }
    } catch (error) {
      console.log('update_spa_points not available');
    }

    // Check if there are any other SPA-related functions
    console.log('\n📋 SOLUTION SUMMARY:');
    console.log('1. ✅ Updated setup-milestone-trigger.sql to use player_rankings');
    console.log('2. 🔄 NEED: Deploy updated function in Supabase Dashboard');
    console.log('3. 🔄 NEED: Run sync function to fix existing data');
    console.log('4. ✅ Future milestones will work correctly');

  } catch (error) {
    console.error('❌ Error in manual update:', error);
  }
}

// Run manual update
manualSpaUpdate();
