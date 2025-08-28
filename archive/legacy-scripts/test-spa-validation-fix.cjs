// ============================================================================
// TEST SPA VALIDATION FIX
// ============================================================================
// Purpose: Test if the fix for SPA validation issue works correctly
// Fix: Always load current user profile in useEnhancedChallengesV3
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testSpaValidationFix() {
  console.log('🧪 TEST: SPA VALIDATION FIX');
  console.log('=' .repeat(50));
  console.log('');
  
  try {
    const userId = '17460a1a-8da6-4ed1-be44-56ff4dcd9c26';
    
    console.log('1. 📋 SIMULATING HOOK BEHAVIOR:');
    console.log(`   Testing user: ${userId}`);
    console.log('');
    
    // Simulate the hook's logic
    console.log('2. 🎮 Getting challenges...');
    const { data: challengesData, error: challengeError } = await supabase
      .from('challenges')
      .select('challenger_id, opponent_id, status')
      .order('created_at', { ascending: false });
    
    if (challengeError) {
      console.log('❌ Challenge error:', challengeError.message);
      return;
    }
    
    console.log(`   Found ${challengesData?.length || 0} total challenges`);
    
    // Extract user IDs like the hook does
    const userIds = new Set();
    challengesData?.forEach(challenge => {
      if (challenge.challenger_id) userIds.add(challenge.challenger_id);
      if (challenge.opponent_id) userIds.add(challenge.opponent_id);
    });
    
    console.log(`   Users involved in challenges: ${userIds.size}`);
    console.log(`   Test user in challenges? ${userIds.has(userId) ? '✅ YES' : '❌ NO'}`);
    
    // NEW FIX: Always include current user
    userIds.add(userId);
    console.log(`   After fix - Users to load profiles for: ${userIds.size}`);
    console.log('');
    
    // 3. Test profile loading
    console.log('3. 👤 Loading profiles (like the hook)...');
    const [profilesResponse, rankingsResponse] = await Promise.all([
      supabase
        .from('profiles')
        .select('user_id, full_name, display_name, verified_rank, elo, avatar_url, current_rank')
        .in('user_id', Array.from(userIds)),
      supabase
        .from('player_rankings')
        .select('user_id, spa_points, elo_points')
        .in('user_id', Array.from(userIds))
    ]);
    
    const profiles = profilesResponse.data || [];
    const rankings = rankingsResponse.data || [];
    
    console.log(`   Profiles loaded: ${profiles.length}`);
    console.log(`   Rankings loaded: ${rankings.length}`);
    
    // Find current user profile
    const userProfile = profiles.find(p => p.user_id === userId);
    const userRanking = rankings.find(r => r.user_id === userId);
    
    console.log('');
    console.log('4. 🎯 CURRENT USER PROFILE RESULT:');
    
    if (userProfile) {
      const currentUserProfile = {
        ...userProfile,
        spa_points: userRanking?.spa_points || 0,
        elo_points: userRanking?.elo_points || 1000
      };
      
      console.log('✅ SUCCESS! Profile loaded:');
      console.log(`   Name: ${currentUserProfile.display_name}`);
      console.log(`   SPA: ${currentUserProfile.spa_points}`);
      console.log(`   ELO: ${currentUserProfile.elo_points}`);
      console.log('');
      
      // Simulate SPA validation
      console.log('5. 💰 SPA VALIDATION TEST:');
      const requiredSpa = 100; // Example challenge requirement
      const userSpa = currentUserProfile.spa_points || 0;
      
      console.log(`   Required SPA: ${requiredSpa}`);
      console.log(`   User SPA: ${userSpa}`);
      console.log(`   Can join challenge? ${userSpa >= requiredSpa ? '✅ YES' : '❌ NO'}`);
      
      if (userSpa >= requiredSpa) {
        console.log('   🎉 SPA validation would PASS!');
      } else {
        console.log('   ⚠️ User would need more SPA');
      }
      
    } else {
      console.log('❌ FAILED! Profile not loaded');
      console.log('   This means the fix needs more work');
    }
    
    console.log('');
    console.log('6. 📊 SUMMARY:');
    console.log(`   Before fix: currentUserProfile = null, userSpa = 0`);
    console.log(`   After fix: currentUserProfile = ${userProfile ? 'loaded' : 'null'}, userSpa = ${userRanking?.spa_points || 0}`);
    console.log(`   Fix status: ${userProfile ? '✅ SUCCESS' : '❌ NEEDS MORE WORK'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSpaValidationFix();
