// ============================================================================
// DEBUG SPA VALIDATION ISSUE
// ============================================================================
// Purpose: Find why currentUserProfile is null when validating SPA for challenges
// Issue: User has SPA but when joining challenge: "currentUserProfile: null, userSpa: 0"
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugSpaValidationIssue() {
  console.log('🔍 DEBUG: SPA VALIDATION ISSUE');
  console.log('=' .repeat(60));
  console.log('');
  
  try {
    // 1. Get the user mentioned in the log: '17460a1a-8da6-4ed1-be44-56ff4dcd9c26'
    const userId = '17460a1a-8da6-4ed1-be44-56ff4dcd9c26';
    
    console.log('1. 👤 CHECKING SPECIFIC USER:');
    console.log(`   User ID: ${userId}`);
    console.log('');
    
    // 2. Check if user exists in profiles table
    console.log('2. 📋 CHECKING PROFILES TABLE:');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile Error:', profileError.message);
      console.log('   🔍 Trying alternative lookup...');
      
      // Try with id field instead
      const { data: profileById, error: profileByIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileByIdError) {
        console.log('❌ Profile by ID Error:', profileByIdError.message);
      } else {
        console.log('✅ Found profile by ID field:');
        console.log('   Display name:', profileById.display_name);
        console.log('   Email:', profileById.email);
        console.log('   SPA points:', profileById.spa_points || 0);
      }
    } else {
      console.log('✅ Found profile by user_id field:');
      console.log('   Display name:', profile.display_name);
      console.log('   Email:', profile.email);
      console.log('   SPA points:', profile.spa_points || 0);
    }
    console.log('');
    
    // 3. Check player_rankings table (this is where SPA is read from)
    console.log('3. 💰 CHECKING PLAYER_RANKINGS TABLE:');
    const { data: ranking, error: rankingError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (rankingError) {
      console.log('❌ Ranking Error:', rankingError.message);
    } else {
      console.log('✅ Found ranking record:');
      console.log('   SPA points:', ranking.spa_points || 0);
      console.log('   ELO points:', ranking.elo_points || 0);
      console.log('   Created:', new Date(ranking.created_at).toLocaleString());
      console.log('   Updated:', new Date(ranking.updated_at).toLocaleString());
    }
    console.log('');
    
    // 4. Check current challenges to see if user is involved
    console.log('4. ⚔️ CHECKING CURRENT CHALLENGES:');
    const { data: challenges, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (challengeError) {
      console.log('❌ Challenge Error:', challengeError.message);
    } else {
      console.log(`✅ Found ${challenges?.length || 0} challenges involving this user`);
      if (challenges && challenges.length > 0) {
        challenges.slice(0, 3).forEach((challenge, index) => {
          console.log(`   ${index + 1}. ${challenge.status} - Created: ${new Date(challenge.created_at).toLocaleString()}`);
        });
      }
    }
    console.log('');
    
    // 5. THE ROOT CAUSE: Check if useEnhancedChallengesV3 logic works
    console.log('5. 🧩 SIMULATING useEnhancedChallengesV3 LOGIC:');
    
    // Simulate getting all challenges
    const { data: allChallenges, error: allChallengesError } = await supabase
      .from('challenges')
      .select('challenger_id, opponent_id')
      .limit(50);
    
    if (allChallengesError) {
      console.log('❌ All Challenges Error:', allChallengesError.message);
    } else {
      // Extract all user IDs from challenges (this is what the hook does)
      const userIds = new Set();
      allChallenges.forEach(challenge => {
        if (challenge.challenger_id) userIds.add(challenge.challenger_id);
        if (challenge.opponent_id) userIds.add(challenge.opponent_id);
      });
      
      console.log(`   📊 Total unique users in challenges: ${userIds.size}`);
      console.log(`   🔍 Is our user in this set? ${userIds.has(userId) ? '✅ YES' : '❌ NO'}`);
      
      if (!userIds.has(userId)) {
        console.log('');
        console.log('🚨 ROOT CAUSE FOUND!');
        console.log('   The user is NOT involved in any current challenges');
        console.log('   So useEnhancedChallengesV3 does NOT load their profile');
        console.log('   Result: currentUserProfile = null, userSpa = 0');
        console.log('');
      }
    }
    
    // 6. SOLUTION VERIFICATION
    console.log('6. 🔧 SOLUTION VERIFICATION:');
    console.log('   Problem: Hook only loads profiles of users involved in challenges');
    console.log('   Solution: Always load current user profile regardless of challenge involvement');
    console.log('');
    
    // Test direct profile lookup
    console.log('7. 🧪 TESTING DIRECT PROFILE LOOKUP:');
    
    // This is what the fix should do
    const { data: directProfile, error: directProfileError } = await supabase
      .from('profiles')
      .select('user_id, display_name, email, avatar_url')
      .eq('user_id', userId)
      .single();
    
    const { data: directRanking, error: directRankingError } = await supabase
      .from('player_rankings')
      .select('spa_points, elo_points')
      .eq('user_id', userId)
      .single();
    
    if (!directProfileError && !directRankingError) {
      const completeProfile = {
        ...directProfile,
        spa_points: directRanking?.spa_points || 0,
        elo_points: directRanking?.elo_points || 0
      };
      
      console.log('✅ DIRECT LOOKUP SUCCESS:');
      console.log('   Profile loaded:', completeProfile.display_name);
      console.log('   SPA points:', completeProfile.spa_points);
      console.log('   This would solve the issue!');
    } else {
      console.log('❌ Direct lookup failed');
      if (directProfileError) console.log('   Profile error:', directProfileError.message);
      if (directRankingError) console.log('   Ranking error:', directRankingError.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugSpaValidationIssue();
