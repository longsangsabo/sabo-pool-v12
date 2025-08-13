// Quick test to check current user SPA points
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking User SPA Points...\n');

async function checkUserSpa() {
  try {
    // Check profiles table - does it have spa_points column?
    console.log('1️⃣ Checking profiles table structure...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, spa_points, display_name')
      .limit(3);
    
    if (profileError) {
      console.log('❌ Profiles error:', profileError.message);
    } else {
      console.log('✅ Profiles sample:', profiles);
    }
    
    // Check player_rankings table for SPA
    console.log('\n2️⃣ Checking player_rankings table...');
    const { data: rankings, error: rankingError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, elo_points')
      .limit(3);
    
    if (rankingError) {
      console.log('❌ Rankings error:', rankingError.message);
    } else {
      console.log('✅ Rankings sample:', rankings);
    }
    
    // Find users with SPA > 0
    console.log('\n3️⃣ Finding users with SPA points...');
    const { data: usersWithSpa, error: spaError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0);
    
    if (spaError) {
      console.log('❌ SPA query error:', spaError.message);
    } else {
      console.log(`✅ Found ${usersWithSpa.length} users with SPA:`, usersWithSpa);
    }
    
  } catch (err) {
    console.log('💥 Check failed:', err.message);
  }
}

await checkUserSpa();
