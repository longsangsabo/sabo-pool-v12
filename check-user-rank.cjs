const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Checking environment variables...');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserRank() {
  try {
    console.log('🔍 Checking user rank data...');
    
    // Look for user with display name "ANH LONG MAGIC" or similar
    console.log('\n1. Searching for user in profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or('display_name.ilike.%anh%, display_name.ilike.%long%, display_name.ilike.%magic%, full_name.ilike.%anh%, full_name.ilike.%long%');
      
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} matching profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`\n--- Profile ${index + 1} ---`);
        console.log('User ID:', profile.user_id);
        console.log('Display Name:', profile.display_name);
        console.log('Full Name:', profile.full_name);
        console.log('Current Rank:', profile.current_rank);
        console.log('Verified Rank:', profile.verified_rank);
        console.log('Created:', profile.created_at);
        console.log('Updated:', profile.updated_at);
      });
      
      // Check player_rankings for this user
      const userId = profiles[0].user_id;
      console.log(`\n2. Checking player_rankings for user: ${userId}...`);
      
      const { data: rankings, error: rankError } = await supabase
        .from('player_rankings')
        .select('*')
        .eq('user_id', userId);
        
      if (rankError) {
        console.error('❌ Error fetching rankings:', rankError);
      } else if (rankings && rankings.length > 0) {
        console.log('✅ Rankings data:');
        rankings.forEach((rank, index) => {
          console.log(`\n--- Ranking ${index + 1} ---`);
          console.log('ID:', rank.id);
          console.log('User ID:', rank.user_id);
          console.log('ELO Points:', rank.elo_points);
          console.log('SPA Points:', rank.spa_points);
          console.log('Total Matches:', rank.total_matches);
          console.log('Wins:', rank.wins);
          console.log('Win Rate:', rank.win_rate);
          console.log('Current Rank:', rank.current_rank);
          console.log('Created:', rank.created_at);
          console.log('Updated:', rank.updated_at);
        });
      } else {
        console.log('⚠️ No rankings data found for this user');
      }
      
      // Check for recent rank updates
      console.log('\n3. Checking recent rank updates...');
      const { data: recentUpdates, error: updateError } = await supabase
        .from('profiles')
        .select('user_id, display_name, current_rank, verified_rank, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (recentUpdates && recentUpdates.length > 0) {
        console.log('📅 Recent profile updates:');
        recentUpdates.forEach(update => {
          console.log(`Updated: ${update.updated_at}`);
          console.log(`Current Rank: ${update.current_rank}`);
          console.log(`Verified Rank: ${update.verified_rank}`);
        });
      }
      
    } else {
      console.log('⚠️ No profiles found with that name. Checking all profiles with rank updates...');
      
      // Check recent rank updates across all users
      const { data: allUpdates, error: allError } = await supabase
        .from('profiles')
        .select('user_id, display_name, full_name, current_rank, verified_rank, updated_at')
        .not('current_rank', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(10);
        
      if (allUpdates) {
        console.log('📊 Recent rank updates (last 10):');
        allUpdates.forEach((update, index) => {
          console.log(`\n${index + 1}. ${update.display_name || update.full_name || 'Unknown'}`);
          console.log(`   User ID: ${update.user_id}`);
          console.log(`   Current: ${update.current_rank}`);
          console.log(`   Verified: ${update.verified_rank}`);
          console.log(`   Updated: ${update.updated_at}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUserRank();
