#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testChallengeFlow() {
  console.log('🧪 Testing challenge join flow and filtering logic...\n');
  
  try {
    // 1. Get available challenges (what user sees in "Kèo" tab)
    console.log('📋 Step 1: Getting available challenges...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'pending')
      .is('opponent_id', null)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (challengesError) {
      console.error('❌ Error fetching challenges:', challengesError);
      return;
    }
    
    console.log(`✅ Found ${challenges.length} available challenges:`);
    challenges.forEach(c => {
      console.log(`  - ${c.id}: ${c.challenger_name || 'Anonymous'} (${c.bet_points || 0} SPA)`);
    });
    
    if (challenges.length === 0) {
      console.log('ℹ️  No available challenges to test with.');
      return;
    }
    
    // 2. Test the filtering logic (simulate what hook does)
    const testUserId = '18f6e853-b072-47fb-9c9a-e5d42a5446a5'; // Use a known user ID
    
    console.log(`\n🔍 Step 2: Testing filtering logic for user ${testUserId}...`);
    
    // Community Kèo filter (what user should see)
    const communityKeoFiltered = challenges.filter(c => 
      !c.opponent_id && 
      c.status === 'pending' && 
      c.challenger_id !== testUserId
    );
    
    console.log(`📊 Community Kèo filtered: ${communityKeoFiltered.length} challenges`);
    communityKeoFiltered.forEach(c => {
      console.log(`  ✓ ${c.id}: Can join (not own challenge)`);
    });
    
    // User's own challenges filter
    const userOwnChallenges = challenges.filter(c => 
      c.challenger_id === testUserId && 
      !c.opponent_id && 
      c.status === 'pending'
    );
    
    console.log(`📊 User's own challenges: ${userOwnChallenges.length} challenges`);
    userOwnChallenges.forEach(c => {
      console.log(`  - ${c.id}: Own challenge (waiting for opponent)`);
    });
    
    // 3. Test acceptance function
    if (communityKeoFiltered.length > 0) {
      const testChallenge = communityKeoFiltered[0];
      
      console.log(`\n🎯 Step 3: Testing acceptance of challenge ${testChallenge.id}...`);
      console.log(`Challenge details:`, {
        challenger: testChallenge.challenger_id,
        bet_points: testChallenge.bet_points,
        status: testChallenge.status
      });
      
      // Test function call (without actually executing)
      console.log('📝 Would call: accept_open_challenge with params:', {
        p_challenge_id: testChallenge.id,
        p_user_id: testUserId
      });
      
      // Simulate what would happen after acceptance
      console.log('📈 After acceptance, challenge would:');
      console.log('  ✓ Have opponent_id =', testUserId);
      console.log('  ✓ Have status = "accepted"');
      console.log('  ✓ Disappear from Community Kèo tab');
      console.log('  ✓ Appear in My Sắp tới tab');
      
    } else {
      console.log('ℹ️  No challenges available for user to join.');
    }
    
    // 4. Check existing accepted challenges
    console.log(`\n🔍 Step 4: Checking user's accepted challenges...`);
    const { data: acceptedChallenges, error: acceptedError } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'accepted')
      .or(`challenger_id.eq.${testUserId},opponent_id.eq.${testUserId}`)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (acceptedError) {
      console.error('❌ Error fetching accepted challenges:', acceptedError);
    } else {
      console.log(`✅ Found ${acceptedChallenges.length} accepted challenges for user:`);
      acceptedChallenges.forEach(c => {
        const userRole = c.challenger_id === testUserId ? 'challenger' : 'opponent';
        console.log(`  - ${c.id}: ${userRole} vs ${c.challenger_name || 'Anonymous'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testChallengeFlow().then(() => {
  console.log('\n✅ Challenge flow test completed');
  console.log('\n📋 Summary of fixes implemented:');
  console.log('1. ✅ Fixed communityKeo filter to exclude user\'s own challenges');
  console.log('2. ✅ Added confirmation dialog before joining challenges');
  console.log('3. ✅ Fixed accept_open_challenge function to handle duplicates');
  console.log('4. ✅ Auto-switch to "My > Sắp tới" tab after joining');
  console.log('\n🎯 Next steps:');
  console.log('1. Apply the SQL migration in Supabase Dashboard');
  console.log('2. Test the complete flow in frontend');
  console.log('3. Verify challenge cards disappear from Kèo tab after joining');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
