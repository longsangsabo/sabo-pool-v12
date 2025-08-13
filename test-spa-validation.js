// Test SPA validation functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing SPA Validation System...\n');

async function testSpaValidation() {
  
  // 1. Test function exists and returns proper errors
  console.log('1️⃣ Testing function with invalid challenge...');
  try {
    const { data: result, error } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: '550e8400-e29b-41d4-a716-446655440000',
      p_user_id: '550e8400-e29b-41d4-a716-446655440001'
    });
    
    if (error) {
      console.log('❌ RPC Error:', error.message);
    } else {
      console.log('✅ Function response:', result);
      
      if (result.error && result.error.includes('Thách đấu')) {
        console.log('🎉 Function updated with Vietnamese messages!');
      } else {
        console.log('⚠️  Function might not be updated yet');
      }
    }
  } catch (err) {
    console.log('💥 Test error:', err.message);
  }
  
  console.log('\n2️⃣ Checking current challenges with bet_points...');
  
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, bet_points, challenger_id, status, is_open_challenge')
      .eq('status', 'pending')
      .gt('bet_points', 0)
      .limit(5);
    
    if (error) {
      console.log('❌ Error fetching challenges:', error.message);
    } else {
      console.log(`✅ Found ${challenges.length} challenges with SPA requirements:`);
      challenges.forEach((challenge, index) => {
        console.log(`   ${index + 1}. ID: ${challenge.id.substring(0, 8)}...`);
        console.log(`      Required SPA: ${challenge.bet_points}`);
        console.log(`      Challenger: ${challenge.challenger_id.substring(0, 8)}...`);
        console.log(`      Open: ${challenge.is_open_challenge}`);
      });
    }
  } catch (err) {
    console.log('❌ Challenge check error:', err.message);
  }
  
  console.log('\n3️⃣ Checking user profiles with SPA points...');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, spa_points, display_name, email')
      .gt('spa_points', 0)
      .limit(5);
    
    if (error) {
      console.log('❌ Error fetching profiles:', error.message);
    } else {
      console.log(`✅ Found ${profiles.length} users with SPA points:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.display_name || profile.email || 'No name'}`);
        console.log(`      SPA: ${profile.spa_points}`);
        console.log(`      ID: ${profile.id.substring(0, 8)}...`);
      });
    }
  } catch (err) {
    console.log('❌ Profiles check error:', err.message);
  }
  
  console.log('\n🏁 SPA validation test completed!');
  console.log('\n💡 To manually test:');
  console.log('   1. Login as a user with low SPA points');
  console.log('   2. Try to join a challenge requiring high SPA');
  console.log('   3. Should see detailed error message with SPA requirements');
}

await testSpaValidation();
