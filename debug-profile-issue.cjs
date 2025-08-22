const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfileIssue() {
  const userId = '18f6e853-b072-47fb-9c9a-e5d42a5446a5';
  
  try {
    console.log(`🔍 Debugging profile issue for user: ${userId}`);
    
    // Check all profiles for this user (might be duplicates)
    console.log('\n1. All profiles for this user:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
      
    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`\n--- Profile ${index + 1} ---`);
        console.log('ID:', profile.id);
        console.log('User ID:', profile.user_id);
        console.log('Display Name:', profile.display_name);
        console.log('Full Name:', profile.full_name);
        console.log('Current Rank:', profile.current_rank);
        console.log('Verified Rank:', profile.verified_rank);
        console.log('Created:', profile.created_at);
        console.log('Updated:', profile.updated_at);
      });
    }
    
    // Check if there are any profiles with display name like "ANH LONG MAGIC"
    console.log('\n2. Searching for profiles with similar names:');
    const { data: similarProfiles, error: similarError } = await supabase
      .from('profiles')
      .select('*')
      .or('display_name.ilike.%magic%, full_name.ilike.%magic%, display_name.ilike.%long%, full_name.ilike.%long%');
      
    if (similarProfiles && similarProfiles.length > 0) {
      console.log(`✅ Found ${similarProfiles.length} similar profiles:`);
      similarProfiles.forEach((profile, index) => {
        console.log(`\n--- Similar Profile ${index + 1} ---`);
        console.log('User ID:', profile.user_id);
        console.log('Display Name:', profile.display_name);
        console.log('Full Name:', profile.full_name);
        console.log('Current Rank:', profile.current_rank);
        console.log('Verified Rank:', profile.verified_rank);
      });
    } else {
      console.log('⚠️ No similar profiles found');
    }
    
    // Check what the leaderboard hook would return
    console.log('\n3. Testing leaderboard data transformation:');
    const { data: rankings, error: rankingsError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId);
      
    if (rankings && rankings.length > 0) {
      const ranking = rankings[0];
      console.log('Raw ranking data:', ranking);
      
      // Simulate the transformation in useLeaderboard
      const transformedEntry = {
        id: ranking.id,
        username: 'Unknown', // No profile data
        full_name: '',
        current_rank: 'Nghiệp dư', // Default from profiles?.verified_rank
        ranking_points: ranking.spa_points || 0,
        total_matches: ranking.total_matches || 0,
        avatar_url: '',
        elo: ranking.elo_points || 1000,
        wins: ranking.wins || 0,
        losses: (ranking.total_matches || 0) - (ranking.wins || 0),
        matches_played: ranking.total_matches || 0,
        win_rate: ranking.total_matches > 0 ? (ranking.wins / ranking.total_matches) * 100 : 0,
        user_id: ranking.user_id
      };
      
      console.log('\n🔄 Transformed leaderboard entry:');
      console.log(JSON.stringify(transformedEntry, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugProfileIssue();
