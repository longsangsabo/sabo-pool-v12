const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function updateChallengerNames() {
  try {
    console.log('🔄 Updating challenges with challenger names...\n');

    // Step 1: Get all challenges
    const { data: challenges, error: fetchError } = await supabase
      .from('challenges')
      .select('id, challenger_id, challenger_name');

    if (fetchError) {
      console.error('❌ Error fetching challenges:', fetchError);
      return;
    }

    console.log(`📊 Found ${challenges.length} challenges\n`);

    // Step 2: Get all unique challenger IDs
    const challengerIds = [...new Set(challenges.map(c => c.challenger_id))];
    console.log(`👥 Found ${challengerIds.length} unique challengers\n`);

    // Step 3: Get profiles for all challengers
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', challengerIds);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📋 Found ${profiles.length} profiles\n`);

    // Step 4: Create profile lookup map
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.id] = profile.full_name || profile.username || 'Unknown Player';
    });

    // Step 5: Update challenges that need challenger_name
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const challenge of challenges) {
      const challengerName = profileMap[challenge.challenger_id];
      
      if (challengerName && (!challenge.challenger_name || challenge.challenger_name !== challengerName)) {
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ challenger_name: challengerName })
          .eq('id', challenge.id);

        if (updateError) {
          console.error(`❌ Error updating challenge ${challenge.id}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ Updated challenge ${challenge.id}: "${challengerName}"`);
          updatedCount++;
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} challenges`);
    console.log(`❌ Errors: ${errorCount} challenges`);

    // Step 6: Verify results
    console.log('\n🔍 Verification - Sample updated challenges:');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('challenges')
      .select('id, challenger_name, challenger_id')
      .not('challenger_name', 'is', null)
      .limit(5);

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      verifyData.forEach(challenge => {
        console.log(`  - Challenge ${challenge.id}: "${challenge.challenger_name}"`);
      });
    }

    // Check how many still need updating
    const { data: remainingData, error: remainingError } = await supabase
      .from('challenges')
      .select('id')
      .is('challenger_name', null);

    if (!remainingError && remainingData) {
      console.log(`\n📊 Challenges still needing challenger_name: ${remainingData.length}`);
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Run the update
console.log('🚀 Starting challenger_name update...\n');
updateChallengerNames();
