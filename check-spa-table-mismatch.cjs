const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSpaTableMismatch() {
  try {
    console.log('🔍 Checking SPA table mismatch issue...\n');

    // 1. Check recent milestone users in both tables
    const { data: recentAwards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('player_id, spa_points_awarded')
      .eq('event_type', 'rank_registration')
      .gte('awarded_at', '2025-08-22T00:00:00Z')
      .order('awarded_at', { ascending: false });

    if (awardsError) {
      console.error('Error fetching awards:', awardsError);
      return;
    }

    console.log('🎯 PROBLEM IDENTIFIED:');
    console.log('Frontend reads SPA from: player_rankings.spa_points');
    console.log('Milestone system updates: profiles.spa_points');
    console.log('=> DATA MISMATCH!\n');

    for (const award of recentAwards.slice(0, 3)) {
      console.log(`👤 User: ${award.player_id}`);
      
      // Check profiles SPA
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spa_points, display_name')
        .eq('user_id', award.player_id)
        .single();

      // Check player_rankings SPA  
      const { data: ranking, error: rankingError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', award.player_id)
        .single();

      console.log(`  profiles.spa_points: ${profile?.spa_points || 0}`);
      console.log(`  player_rankings.spa_points: ${ranking?.spa_points || 0} ← Frontend reads this`);
      console.log(`  Milestone awarded: ${award.spa_points_awarded}`);
      console.log('---');
    }

    console.log('\n🔧 SOLUTION NEEDED:');
    console.log('Option 1: Update milestone function to use player_rankings table');
    console.log('Option 2: Update frontend to read from profiles table');
    console.log('Option 3: Sync both tables');
    console.log('\nRecommended: Update milestone function to use player_rankings');

  } catch (error) {
    console.error('❌ Error checking SPA mismatch:', error);
  }
}

// Run the check
checkSpaTableMismatch();
