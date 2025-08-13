// Debug specific challenge acceptance
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎯 Debugging Challenge Acceptance...\n');

async function debugChallengeAcceptance() {
  
  // Get all open challenges with details
  console.log('📊 Current open challenges:');
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        id,
        challenger_id,
        opponent_id,
        status,
        is_open_challenge,
        created_at,
        expires_at,
        message,
        bet_points,
        race_to,
        challenge_type
      `)
      .eq('is_open_challenge', true)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`✅ Found ${challenges.length} open challenges:`);
    challenges.forEach((challenge, index) => {
      console.log(`\n   ${index + 1}. Challenge ID: ${challenge.id}`);
      console.log(`      Challenger: ${challenge.challenger_id}`);
      console.log(`      Status: ${challenge.status}`);
      console.log(`      Message: ${challenge.message || 'No message'}`);
      console.log(`      Bet: ${challenge.bet_points} points`);
      console.log(`      Race to: ${challenge.race_to}`);
      console.log(`      Type: ${challenge.challenge_type}`);
      console.log(`      Created: ${new Date(challenge.created_at).toLocaleString()}`);
      console.log(`      Expires: ${challenge.expires_at ? new Date(challenge.expires_at).toLocaleString() : 'No expiry'}`);
    });
    
    if (challenges.length > 0) {
      // Test accepting the first challenge with a test user
      const testChallenge = challenges[0];
      console.log(`\n🎯 Testing acceptance of challenge: ${testChallenge.id}`);
      
      // Create a test user ID (different from challenger)
      const testUserId = '550e8400-e29b-41d4-a716-446655440999';
      
      console.log(`   Using test user ID: ${testUserId}`);
      console.log(`   Challenge challenger: ${testChallenge.challenger_id}`);
      
      if (testUserId === testChallenge.challenger_id) {
        console.log('   ⚠️  Cannot accept own challenge (expected behavior)');
      }
      
      const { data, error } = await supabase.rpc('accept_open_challenge', {
        p_challenge_id: testChallenge.id,
        p_user_id: testUserId
      });
      
      if (error) {
        console.log('   ❌ Function error:', error.message);
      } else {
        console.log('   ✅ Function response:', data);
        
        if (data.success) {
          console.log('   🎉 Challenge accepted successfully!');
        } else {
          console.log('   ⚠️  Challenge not accepted:', data.error);
        }
      }
    }
    
  } catch (err) {
    console.log('❌ Debug failed:', err.message);
  }
  
  console.log('\n🔍 Checking for any recent challenge activity...');
  
  try {
    const { data: recentChallenges, error } = await supabase
      .from('challenges')
      .select('*')
      .not('status', 'eq', 'pending')
      .order('updated_at', { ascending: false })
      .limit(3);
      
    if (error) {
      console.log('❌ Error fetching recent activity:', error.message);
    } else {
      console.log(`✅ Found ${recentChallenges.length} recently updated challenges:`);
      recentChallenges.forEach(challenge => {
        console.log(`   - ${challenge.id}: ${challenge.status} (updated: ${new Date(challenge.updated_at || challenge.created_at).toLocaleString()})`);
      });
    }
  } catch (err) {
    console.log('❌ Recent activity check failed:', err.message);
  }
  
  console.log('\n🏁 Challenge debug completed!');
}

await debugChallengeAcceptance();
