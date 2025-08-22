const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listProfiles() {
  try {
    console.log('📋 Listing all profiles...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, full_name, current_rank, verified_rank, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20);
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ${profile.display_name || profile.full_name || 'Unknown'}`);
        console.log(`   User ID: ${profile.user_id}`);
        console.log(`   Current Rank: ${profile.current_rank}`);
        console.log(`   Verified Rank: ${profile.verified_rank}`);
        console.log(`   Updated: ${profile.updated_at}`);
      });
    } else {
      console.log('⚠️ No profiles found');
    }
    
    // Also check player_rankings table
    console.log('\n🏆 Checking player_rankings table...');
    const { data: rankings, error: rankError } = await supabase
      .from('player_rankings')
      .select('user_id, elo_points, spa_points, current_rank, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);
      
    if (rankings && rankings.length > 0) {
      console.log(`✅ Found ${rankings.length} rankings:`);
      rankings.forEach((rank, index) => {
        console.log(`\n${index + 1}. User: ${rank.user_id}`);
        console.log(`   ELO: ${rank.elo_points}`);
        console.log(`   SPA: ${rank.spa_points}`);
        console.log(`   Rank: ${rank.current_rank}`);
        console.log(`   Updated: ${rank.updated_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listProfiles();
