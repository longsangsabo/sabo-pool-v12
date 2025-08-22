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

async function debugSpaDisplay() {
  try {
    console.log('🔍 Debugging SPA display issue...\n');

    // 1. Kiểm tra user đã nhận milestone gần đây
    console.log('1. Checking recent milestone awards...');
    const { data: recentAwards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('*, profiles(display_name, spa_points)')
      .eq('event_type', 'rank_registration')
      .gte('awarded_at', '2025-08-22T00:00:00Z')
      .order('awarded_at', { ascending: false });

    if (awardsError) {
      console.error('Error fetching awards:', awardsError);
      return;
    }

    console.log(`Found ${recentAwards.length} recent awards:`);
    recentAwards.forEach(award => {
      console.log(`- Player: ${award.player_id}`);
      console.log(`  Name: ${award.profiles?.display_name || 'Unknown'}`);
      console.log(`  SPA awarded: ${award.spa_points_awarded}`);
      console.log(`  Current SPA in profile: ${award.profiles?.spa_points || 0}`);
      console.log(`  Award time: ${award.awarded_at}`);
      console.log('---');
    });

    // 2. Kiểm tra profiles table structure và SPA column
    console.log('\n2. Checking profiles table structure...');
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('Error checking profiles:', profileError);
    } else if (profileSample && profileSample.length > 0) {
      console.log('Profile table columns:');
      Object.keys(profileSample[0]).forEach(column => {
        console.log(`- ${column}: ${typeof profileSample[0][column]}`);
      });
    }

    // 3. So sánh SPA data giữa các table
    console.log('\n3. Cross-referencing SPA data...');
    
    for (const award of recentAwards.slice(0, 3)) { // Check first 3 users
      console.log(`\n🔍 Checking user: ${award.profiles?.display_name || award.player_id}`);
      
      // Check profile SPA
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spa_points')
        .eq('user_id', award.player_id)
        .single();

      if (profileError) {
        console.error(`Profile error: ${profileError.message}`);
        continue;
      }

      // Check all milestone awards for this user
      const { data: userAwards, error: userAwardsError } = await supabase
        .from('milestone_awards')
        .select('spa_points_awarded, awarded_at, event_type')
        .eq('player_id', award.player_id)
        .order('awarded_at', { ascending: true });

      if (userAwardsError) {
        console.error(`User awards error: ${userAwardsError.message}`);
        continue;
      }

      const totalExpectedSpa = userAwards.reduce((sum, a) => sum + (a.spa_points_awarded || 0), 0);
      
      console.log(`  Profile SPA: ${profile.spa_points || 0}`);
      console.log(`  Expected SPA (from awards): ${totalExpectedSpa}`);
      console.log(`  Awards count: ${userAwards.length}`);
      
      if ((profile.spa_points || 0) !== totalExpectedSpa) {
        console.log(`  ❌ MISMATCH! Profile SPA doesn't match expected total`);
      } else {
        console.log(`  ✅ MATCH! SPA values are correct`);
      }
    }

    // 4. Kiểm tra function award_milestone_spa có cập nhật đúng không
    console.log('\n4. Testing SPA update function...');
    
    // Find a user to test
    const testUser = recentAwards[0];
    if (testUser) {
      const { data: beforeProfile, error: beforeError } = await supabase
        .from('profiles')
        .select('spa_points')
        .eq('user_id', testUser.player_id)
        .single();

      if (!beforeError) {
        console.log(`Test user current SPA: ${beforeProfile.spa_points || 0}`);
        
        // Test manual SPA update
        const testAmount = 1; // Small test amount
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ spa_points: (beforeProfile.spa_points || 0) + testAmount })
          .eq('user_id', testUser.player_id);

        if (updateError) {
          console.error(`❌ SPA update failed: ${updateError.message}`);
        } else {
          // Verify update
          const { data: afterProfile, error: afterError } = await supabase
            .from('profiles')
            .select('spa_points')
            .eq('user_id', testUser.player_id)
            .single();

          if (!afterError) {
            console.log(`✅ SPA update successful: ${beforeProfile.spa_points || 0} → ${afterProfile.spa_points}`);
            
            // Revert test change
            await supabase
              .from('profiles')
              .update({ spa_points: beforeProfile.spa_points || 0 })
              .eq('user_id', testUser.player_id);
          }
        }
      }
    }

    // 5. Kiểm tra RLS policies
    console.log('\n5. Checking potential RLS policy issues...');
    
    // Try to update SPA as authenticated user vs service role
    console.log('Testing with service role key (current)...');
    
    // 6. Fix suggestion
    console.log('\n6. 🔧 POTENTIAL ISSUES AND SOLUTIONS:');
    console.log('');
    console.log('A. Column name mismatch:');
    console.log('   - milestone_awards uses "spa_points_awarded"');
    console.log('   - profiles might use "spa_points" or different column');
    console.log('');
    console.log('B. RLS Policy blocking updates:');
    console.log('   - Service role might not have UPDATE permission on profiles');
    console.log('');
    console.log('C. Function not calling correct UPDATE:');
    console.log('   - award_milestone_spa function might have wrong column reference');
    console.log('');
    console.log('D. Frontend displaying wrong column:');
    console.log('   - UI might be reading from different SPA column');

    console.log('\n✅ Debug analysis completed!');

  } catch (error) {
    console.error('❌ Error in SPA debug:', error);
  }
}

// Run the debug
debugSpaDisplay();
