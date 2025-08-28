const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRankApprovalFlow() {
  try {
    console.log('🧪 Testing enhanced rank approval flow...');
    
    // Find a user with rank K that we can test with
    const { data: testUser, error: userError } = await supabase
      .from('player_rankings')
      .select('user_id, user_name, current_rank, verified_rank, spa_points')
      .eq('current_rank', 'K')
      .limit(1)
      .single();
      
    if (userError || !testUser) {
      console.log('❌ No test user found with rank K');
      return;
    }
    
    console.log(`✅ Testing with user: ${testUser.user_name || testUser.user_id}`);
    console.log(`   Current rank: ${testUser.current_rank}`);
    console.log(`   Verified rank: ${testUser.verified_rank}`);
    console.log(`   Current SPA: ${testUser.spa_points}`);
    
    // Check if user already has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('verified_rank, current_rank, display_name')
      .eq('user_id', testUser.user_id)
      .single();
      
    if (profile) {
      console.log(`📋 Profile data:`);
      console.log(`   Display name: ${profile.display_name}`);
      console.log(`   Profile verified rank: ${profile.verified_rank}`);
      console.log(`   Profile current rank: ${profile.current_rank}`);
    } else {
      console.log('⚠️ No profile found for this user');
    }
    
    // Simulate the approval flow for a rank H request
    console.log('\n🔄 Simulating rank approval: K → H...');
    
    const newRank = 'H';
    const spaBonus = 100; // Rank H bonus
    const newSpaPoints = testUser.spa_points + spaBonus;
    
    // Update player_rankings
    console.log(`   Updating player_rankings for user: ${testUser.user_id}`);
    const { data: updateData, error: rankingError } = await supabase
      .from('player_rankings')
      .update({
        verified_rank: newRank,
        current_rank: newRank,
        spa_points: newSpaPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUser.user_id)
      .select();
      
    console.log('Update result:', { data: updateData, error: rankingError });
      
    if (rankingError) {
      console.error('❌ Error updating player_rankings:', rankingError);
      return;
    }
    
    // Update profiles if exists
    if (profile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verified_rank: newRank,
          current_rank: newRank,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testUser.user_id);
        
      if (profileError) {
        console.error('❌ Error updating profiles:', profileError);
      }
    }
    
    console.log('✅ Rank approval simulation completed!');
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    
    const { data: updatedRanking } = await supabase
      .from('player_rankings')
      .select('current_rank, verified_rank, spa_points')
      .eq('user_id', testUser.user_id)
      .single();
      
    if (updatedRanking) {
      console.log(`✅ Updated ranking data:`);
      console.log(`   Current rank: ${updatedRanking.current_rank}`);
      console.log(`   Verified rank: ${updatedRanking.verified_rank}`);
      console.log(`   New SPA: ${updatedRanking.spa_points} (+${spaBonus})`);
    }
    
    if (profile) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('current_rank, verified_rank')
        .eq('user_id', testUser.user_id)
        .single();
        
      if (updatedProfile) {
        console.log(`📋 Updated profile data:`);
        console.log(`   Profile verified rank: ${updatedProfile.verified_rank}`);
        console.log(`   Profile current rank: ${updatedProfile.current_rank}`);
      }
    }
    
    console.log('\n🎉 Test completed! User should now show rank H in leaderboard.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRankApprovalFlow();
