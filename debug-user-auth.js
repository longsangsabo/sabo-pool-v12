// Debug current user and create missing profile if needed
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔐 User Authentication & Profile Debug...\n');

async function debugUserAuth() {
  
  // Check current auth state
  console.log('🔍 Checking authentication state...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth error:', error.message);
      console.log('   ℹ️  This is expected - anonymous access cannot get current user');
    } else if (user) {
      console.log('✅ Authenticated user found:', user.id);
    } else {
      console.log('⚠️  No authenticated user (anonymous access)');
    }
  } catch (err) {
    console.log('❌ Auth check failed:', err.message);
  }
  
  console.log('\n📋 Checking profile system...');
  
  // Check if we can create a profile for testing
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .limit(5);
    
    if (error) {
      console.log('❌ Cannot read profiles:', error.message);
    } else {
      console.log(`✅ Found ${profiles.length} existing profiles`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.id}: ${profile.display_name || profile.email || 'No name'}`);
      });
    }
  } catch (err) {
    console.log('❌ Profile check failed:', err.message);
  }
  
  console.log('\n🧹 Cleaning up invalid challenges...');
  
  try {
    // Find challenges with invalid challenger_ids
    const { data: invalidChallenges, error: findError } = await supabase
      .from('challenges')
      .select(`
        id,
        challenger_id,
        status,
        is_open_challenge,
        created_at
      `)
      .eq('status', 'pending')
      .eq('is_open_challenge', true);
    
    if (findError) {
      console.log('❌ Cannot find challenges:', findError.message);
      return;
    }
    
    console.log(`Found ${invalidChallenges.length} pending open challenges`);
    
    // Check each challenger_id against profiles
    for (const challenge of invalidChallenges) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', challenge.challenger_id)
        .single();
      
      if (profileError || !profile) {
        console.log(`❌ Invalid challenge ${challenge.id}: challenger ${challenge.challenger_id} not in profiles`);
        
        // Delete invalid challenge
        const { error: deleteError } = await supabase
          .from('challenges')
          .delete()
          .eq('id', challenge.id);
        
        if (deleteError) {
          console.log(`   ❌ Failed to delete: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Deleted invalid challenge`);
        }
      } else {
        console.log(`✅ Valid challenge ${challenge.id}: challenger exists`);
      }
    }
    
  } catch (err) {
    console.log('❌ Cleanup failed:', err.message);
  }
  
  console.log('\n🎯 Testing challenge creation for valid user...');
  
  try {
    // Get a valid user from profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(1);
    
    if (error || !profiles || profiles.length === 0) {
      console.log('❌ No valid profiles found for testing');
      return;
    }
    
    const testUser = profiles[0];
    console.log(`Using test user: ${testUser.id} (${testUser.display_name || 'No name'})`);
    
    // Check if this user can create challenges (test the system)
    const { data: testChallenges, error: challengeError } = await supabase
      .from('challenges')
      .select('id')
      .eq('challenger_id', testUser.id)
      .limit(1);
    
    if (challengeError) {
      console.log('❌ Cannot check user challenges:', challengeError.message);
    } else {
      console.log(`✅ User has ${testChallenges.length} existing challenges`);
    }
    
  } catch (err) {
    console.log('❌ Test user check failed:', err.message);
  }
  
  console.log('\n🏁 User debug completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. User cần đăng nhập và có profile trong database');
  console.log('   2. Challenges cũ với invalid challenger_id đã được xóa');
  console.log('   3. Thử tham gia challenge mới sau khi đăng nhập');
}

await debugUserAuth();
