// Check user profiles and authentication setup
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('👤 Checking User Profiles and Auth...\n');

async function checkUserSystem() {
  
  // Check profiles table structure
  console.log('📋 Checking profiles table...');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Profiles error:', error.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      if (profiles.length > 0) {
        console.log('   Sample profile columns:', Object.keys(profiles[0]).join(', '));
        console.log('   Sample IDs:', profiles.map(p => p.id || p.user_id).slice(0, 3));
      }
    }
  } catch (err) {
    console.log('❌ Profiles check failed:', err.message);
  }
  
  console.log('\n🔍 Checking challenger IDs in challenges vs profiles...');
  
  try {
    // Get challenger IDs from challenges
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('challenger_id')
      .eq('is_open_challenge', true)
      .eq('status', 'pending');
    
    if (challengesError) {
      console.log('❌ Challenge fetch error:', challengesError.message);
      return;
    }
    
    const challengerIds = challenges.map(c => c.challenger_id);
    console.log('Challenge challenger IDs:', challengerIds);
    
    // Check if these IDs exist in profiles
    for (const challengerId of challengerIds) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('id', challengerId)
        .single();
      
      if (profileError) {
        console.log(`❌ Challenger ${challengerId}: Not found in profiles - ${profileError.message}`);
      } else {
        console.log(`✅ Challenger ${challengerId}: Found - ${profile.display_name || profile.email || 'No name'}`);
      }
    }
    
  } catch (err) {
    console.log('❌ Challenger check failed:', err.message);
  }
  
  console.log('\n📊 Checking foreign key constraints...');
  
  try {
    // Check what the foreign key expects
    const { data, error } = await supabase
      .from('challenges')
      .select('challenger_id, opponent_id')
      .not('opponent_id', 'is', null)
      .limit(3);
      
    if (error) {
      console.log('❌ FK check error:', error.message);
    } else {
      console.log(`✅ Found ${data.length} challenges with opponents`);
      for (const challenge of data) {
        console.log(`   Challenger: ${challenge.challenger_id}`);
        console.log(`   Opponent: ${challenge.opponent_id}`);
      }
    }
  } catch (err) {
    console.log('❌ FK check failed:', err.message);
  }
  
  console.log('\n🎯 Testing with real user ID...');
  
  try {
    // Get a real user ID from profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error || !profiles || profiles.length === 0) {
      console.log('❌ No profiles found for testing');
      return;
    }
    
    const realUserId = profiles[0].id;
    console.log(`Using real user ID: ${realUserId}`);
    
    // Test accepting challenge with real user ID
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, challenger_id')
      .eq('is_open_challenge', true)
      .eq('status', 'pending')
      .limit(1);
    
    if (challenges && challenges.length > 0) {
      const challenge = challenges[0];
      
      if (realUserId === challenge.challenger_id) {
        console.log('⚠️  User is the challenger, cannot accept own challenge');
      } else {
        console.log(`Testing acceptance with real user...`);
        
        const { data: result, error: acceptError } = await supabase.rpc('accept_open_challenge', {
          p_challenge_id: challenge.id,
          p_user_id: realUserId
        });
        
        if (acceptError) {
          console.log('❌ Accept error:', acceptError.message);
        } else {
          console.log('✅ Accept result:', result);
        }
      }
    }
    
  } catch (err) {
    console.log('❌ Real user test failed:', err.message);
  }
  
  console.log('\n🏁 User system check completed!');
}

await checkUserSystem();
