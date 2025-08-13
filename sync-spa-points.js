// Sync SPA points from player_rankings to profiles table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Syncing SPA Points between tables...\n');

async function syncSpaPoints() {
  try {
    // 1. Get all users with SPA in player_rankings
    console.log('1️⃣ Fetching users with SPA from player_rankings...');
    const { data: rankings, error: rankingError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0);
    
    if (rankingError) {
      throw new Error(`Rankings fetch error: ${rankingError.message}`);
    }
    
    console.log(`✅ Found ${rankings.length} users with SPA in rankings`);
    
    // 2. Get current profiles SPA
    console.log('\n2️⃣ Checking current profiles SPA...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, spa_points, display_name')
      .in('user_id', rankings.map(r => r.user_id));
    
    if (profileError) {
      throw new Error(`Profiles fetch error: ${profileError.message}`);
    }
    
    console.log(`✅ Found ${profiles.length} matching profiles`);
    
    // 3. Compare and update
    console.log('\n3️⃣ Syncing SPA points...');
    let updateCount = 0;
    
    for (const ranking of rankings) {
      const profile = profiles.find(p => p.user_id === ranking.user_id);
      
      if (profile) {
        if (profile.spa_points !== ranking.spa_points) {
          console.log(`🔄 Updating ${profile.display_name || 'User'}: ${profile.spa_points} → ${ranking.spa_points}`);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              spa_points: ranking.spa_points,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', ranking.user_id);
          
          if (updateError) {
            console.log(`❌ Update failed for ${profile.user_id}: ${updateError.message}`);
          } else {
            updateCount++;
          }
        } else {
          console.log(`✅ ${profile.display_name || 'User'}: Already synced (${ranking.spa_points})`);
        }
      } else {
        console.log(`⚠️  No profile found for user_id: ${ranking.user_id}`);
      }
    }
    
    console.log(`\n🎉 Sync completed! Updated ${updateCount} profiles`);
    
    // 4. Verify sync
    console.log('\n4️⃣ Verifying sync...');
    const { data: verifyProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('user_id, spa_points, display_name')
      .gt('spa_points', 0);
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Verification: ${verifyProfiles.length} profiles now have SPA > 0`);
      verifyProfiles.forEach(p => {
        console.log(`   - ${p.display_name || 'User'}: ${p.spa_points} SPA`);
      });
    }
    
  } catch (err) {
    console.log('💥 Sync failed:', err.message);
  }
}

await syncSpaPoints();
