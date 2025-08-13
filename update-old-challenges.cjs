const { createClient } = require('@supabase/supabase-js');

// Supabase connection với service role key để có quyền update
const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.w33_aVnTL8EI0YKpJGVF_LHI_f41eDo7mJwMjm1gxdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateOldChallenges() {
  console.log('🔄 Updating old challenges with missing data...\n');

  try {
    // Get challenges with missing data
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .or('location.is.null,required_rank.is.null,challenger_name.is.null');

    if (error) {
      console.error('❌ Error fetching challenges:', error);
      return;
    }

    if (!challenges || challenges.length === 0) {
      console.log('✅ No challenges need updating - all have complete data!');
      return;
    }

    console.log(`📝 Found ${challenges.length} challenges that need updating`);

    let updateCount = 0;

    for (const challenge of challenges) {
      const updates = {};
      let needsUpdate = false;

      // Set default location if missing
      if (!challenge.location) {
        if (challenge.club_id) {
          // Try to get club name
          const { data: club } = await supabase
            .from('club_profiles')
            .select('club_name')
            .eq('id', challenge.club_id)
            .single();
          
          updates.location = club?.club_name || 'CLB chưa xác định';
        } else {
          updates.location = 'Địa điểm chưa xác định';
        }
        needsUpdate = true;
      }

      // Set default required_rank if missing and it's an open challenge
      if (!challenge.required_rank && (!challenge.opponent_id || challenge.opponent_id === 'open')) {
        updates.required_rank = 'all';
        needsUpdate = true;
      }

      // Set challenger name if missing
      if (!challenge.challenger_name) {
        // Try to get challenger profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', challenge.challenger_id)
          .single();
        
        updates.challenger_name = profile?.full_name || 'Người chơi';
        needsUpdate = true;
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('challenges')
          .update(updates)
          .eq('id', challenge.id);

        if (updateError) {
          console.error(`❌ Error updating challenge ${challenge.id}:`, updateError);
        } else {
          updateCount++;
          console.log(`✅ Updated challenge ${challenge.id}:`, updates);
        }
      }
    }

    console.log(`\n🎉 Successfully updated ${updateCount} challenges!`);
    
    if (updateCount > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Run: node check-challenges-data.cjs');
      console.log('   2. Refresh the app to see updated challenge cards');
      console.log('   3. Test creating new challenges');
    }

  } catch (error) {
    console.error('❌ Error updating challenges:', error);
  }
}

// Run the update
updateOldChallenges();
