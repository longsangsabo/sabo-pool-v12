const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificUser() {
  const userId = '18f6e853-b072-47fb-9c9a-e5d42a5446a5'; // User with ELO 1600, SPA 4800
  
  try {
    console.log(`🔍 Checking user: ${userId}`);
    
    // Check profiles table
    console.log('\n1. Profile data:');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
    } else if (profile) {
      console.log('✅ Profile found:');
      console.log('   Display Name:', profile.display_name);
      console.log('   Full Name:', profile.full_name);
      console.log('   Current Rank:', profile.current_rank);
      console.log('   Verified Rank:', profile.verified_rank);
      console.log('   Email:', profile.email);
      console.log('   Created:', profile.created_at);
      console.log('   Updated:', profile.updated_at);
    } else {
      console.log('⚠️ No profile found');
    }
    
    // Check player_rankings
    console.log('\n2. Rankings data:');
    const { data: ranking, error: rankError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (ranking) {
      console.log('✅ Ranking found:');
      console.log('   ELO Points:', ranking.elo_points);
      console.log('   SPA Points:', ranking.spa_points);
      console.log('   Current Rank:', ranking.current_rank);
      console.log('   Total Matches:', ranking.total_matches);
      console.log('   Wins:', ranking.wins);
      console.log('   Updated:', ranking.updated_at);
    }
    
    // Check auth.users table
    console.log('\n3. Auth user data:');
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (authUser) {
        console.log('✅ Auth user found:');
        console.log('   Email:', authUser.user?.email);
        console.log('   Phone:', authUser.user?.phone);
        console.log('   Created:', authUser.user?.created_at);
        console.log('   Metadata:', JSON.stringify(authUser.user?.user_metadata, null, 2));
      }
    } catch (authError) {
      console.log('❌ Cannot access auth data with anon key');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSpecificUser();
