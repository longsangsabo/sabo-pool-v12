const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMissingProfiles() {
  try {
    console.log('🔄 Syncing missing profile data...');
    
    // Get all player_rankings that don't have corresponding profiles
    const { data: rankings, error: rankingsError } = await supabase
      .from('player_rankings')
      .select('user_id, user_name, verified_rank, current_rank, elo_points, spa_points')
      .not('user_name', 'is', null);
      
    if (rankingsError) {
      console.error('❌ Error fetching rankings:', rankingsError);
      return;
    }
    
    console.log(`📊 Found ${rankings.length} ranking records with user_name`);
    
    let synced = 0;
    let errors = 0;
    
    for (const ranking of rankings) {
      try {
        // Check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', ranking.user_id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          console.log(`⚠️ Error checking profile for ${ranking.user_id}:`, checkError.message);
          continue;
        }
        
        if (!existingProfile) {
          // Create missing profile
          const profileData = {
            user_id: ranking.user_id,
            display_name: ranking.user_name,
            full_name: ranking.user_name,
            verified_rank: ranking.verified_rank,
            current_rank: ranking.current_rank,
            spa_points: ranking.spa_points || 0,
            elo: ranking.elo_points || 1000,
            skill_level: 'beginner',
            ban_status: 'active',
            is_admin: false
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([profileData]);
            
          if (insertError) {
            console.log(`❌ Error creating profile for ${ranking.user_name}:`, insertError.message);
            errors++;
          } else {
            console.log(`✅ Created profile for ${ranking.user_name} (${ranking.verified_rank})`);
            synced++;
          }
        } else {
          // Update existing profile with missing rank data
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              verified_rank: ranking.verified_rank,
              current_rank: ranking.current_rank,
              display_name: ranking.user_name
            })
            .eq('user_id', ranking.user_id);
            
          if (updateError) {
            console.log(`❌ Error updating profile for ${ranking.user_name}:`, updateError.message);
            errors++;
          } else {
            console.log(`🔄 Updated profile for ${ranking.user_name} (${ranking.verified_rank})`);
            synced++;
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Unexpected error for ${ranking.user_name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Sync Summary:');
    console.log(`✅ Successful syncs: ${synced}`);
    console.log(`❌ Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

syncMissingProfiles();
