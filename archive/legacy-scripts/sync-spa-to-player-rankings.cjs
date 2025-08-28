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

async function syncSpaToPlayerRankings() {
  try {
    console.log('🔧 Syncing SPA to player_rankings table...\n');

    // Get users who received milestone awards today
    const { data: milestoneUsers, error: milestoneError } = await supabase
      .from('milestone_awards')
      .select('player_id, spa_points_awarded')
      .eq('event_type', 'rank_registration')
      .gte('awarded_at', '2025-08-22T00:00:00Z');

    if (milestoneError) {
      console.error('Error fetching milestone users:', milestoneError);
      return;
    }

    // Group by user and sum SPA
    const userSpaMap = {};
    milestoneUsers.forEach(award => {
      if (!userSpaMap[award.player_id]) {
        userSpaMap[award.player_id] = 0;
      }
      userSpaMap[award.player_id] += award.spa_points_awarded;
    });

    console.log(`Processing ${Object.keys(userSpaMap).length} users...\n`);

    for (const [userId, spaToAdd] of Object.entries(userSpaMap)) {
      console.log(`🎯 Processing user: ${userId}`);

      // Get current SPA from player_rankings
      const { data: currentRanking, error: rankingError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      if (rankingError) {
        console.log(`  ❌ No ranking record found: ${rankingError.message}`);
        continue;
      }

      const currentSpa = currentRanking.spa_points || 0;
      const newSpa = currentSpa + spaToAdd;

      // Update player_rankings SPA
      const { error: updateError } = await supabase
        .from('player_rankings')
        .update({ spa_points: newSpa })
        .eq('user_id', userId);

      if (updateError) {
        console.log(`  ❌ Update failed: ${updateError.message}`);
      } else {
        console.log(`  ✅ Updated SPA: ${currentSpa} → ${newSpa} (+${spaToAdd})`);
      }
    }

    // Verify updates
    console.log('\n🔍 Verification...');
    for (const [userId] of Object.entries(userSpaMap)) {
      const { data: updatedRanking, error: verifyError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      if (!verifyError) {
        console.log(`User ${userId}: ${updatedRanking.spa_points} SPA (Frontend will show this)`);
      }
    }

    console.log('\n🎉 SPA SYNC COMPLETED!');
    console.log('Users should now see correct SPA in their profiles!');

  } catch (error) {
    console.error('❌ Error syncing SPA:', error);
  }
}

// Run the sync
syncSpaToPlayerRankings();
