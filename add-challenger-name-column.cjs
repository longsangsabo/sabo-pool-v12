const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function addChallengerNameColumn() {
  try {
    console.log('🔧 Adding challenger_name column to challenges table...\n');

    // Step 1: Add column using SQL
    const { data: addColumnResult, error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE challenges 
        ADD COLUMN IF NOT EXISTS challenger_name TEXT;
      `
    });

    if (addColumnError) {
      console.error('❌ Error adding column:', addColumnError);
      return;
    }

    console.log('✅ Column challenger_name added successfully\n');

    // Step 2: Update existing records with challenger names
    console.log('🔄 Updating existing challenges with challenger names...\n');

    // Get all challenges with their challenger profiles
    const { data: challenges, error: fetchError } = await supabase
      .from('challenges')
      .select(`
        id,
        challenger_id,
        challenger_name,
        profiles!challenges_challenger_id_fkey(
          id,
          full_name,
          username
        )
      `);

    if (fetchError) {
      console.error('❌ Error fetching challenges:', fetchError);
      return;
    }

    console.log(`📊 Found ${challenges.length} challenges to update\n`);

    // Update challenges that don't have challenger_name
    let updatedCount = 0;
    
    for (const challenge of challenges) {
      if (!challenge.challenger_name && challenge.profiles) {
        const challengerName = challenge.profiles.full_name || challenge.profiles.username || 'Unknown Player';
        
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ challenger_name: challengerName })
          .eq('id', challenge.id);

        if (updateError) {
          console.error(`❌ Error updating challenge ${challenge.id}:`, updateError);
        } else {
          console.log(`✅ Updated challenge ${challenge.id}: ${challengerName}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n🎉 Migration completed! Updated ${updatedCount} challenges`);

    // Step 3: Verify the results
    console.log('\n🔍 Verifying results...\n');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('challenges')
      .select('id, challenger_name, challenger_id')
      .limit(5);

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('📋 Sample results:');
      verifyData.forEach(challenge => {
        console.log(`  - Challenge ${challenge.id}: "${challenge.challenger_name}" (${challenge.challenger_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Alternative method using direct SQL if RPC doesn't work
async function addChallengerNameColumnDirectSQL() {
  try {
    console.log('🔧 Adding challenger_name column using direct SQL approach...\n');

    // First check if column exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'challenges')
      .eq('column_name', 'challenger_name');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('ℹ️ Column challenger_name already exists');
    } else {
      console.log('⚠️ Column challenger_name does not exist. Please add it manually in Supabase dashboard:');
      console.log('SQL: ALTER TABLE challenges ADD COLUMN challenger_name TEXT;');
    }

    // Update existing records
    const { data: challenges, error: fetchError } = await supabase
      .from('challenges')
      .select(`
        id,
        challenger_id,
        challenger_name
      `);

    if (fetchError) {
      console.error('❌ Error fetching challenges:', fetchError);
      return;
    }

    console.log(`📊 Found ${challenges.length} challenges\n`);

    // Get profiles for updating
    const challengerIds = [...new Set(challenges.map(c => c.challenger_id))];
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', challengerIds);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    // Create a map of profiles
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.id] = profile.full_name || profile.username || 'Unknown Player';
    });

    // Update challenges
    let updatedCount = 0;
    
    for (const challenge of challenges) {
      if (!challenge.challenger_name && profileMap[challenge.challenger_id]) {
        const challengerName = profileMap[challenge.challenger_id];
        
        const { error: updateError } = await supabase
          .from('challenges')
          .update({ challenger_name: challengerName })
          .eq('id', challenge.id);

        if (updateError) {
          console.error(`❌ Error updating challenge ${challenge.id}:`, updateError);
        } else {
          console.log(`✅ Updated challenge ${challenge.id}: ${challengerName}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} challenges with challenger names`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the migration
console.log('🚀 Starting challenger_name column migration...\n');
addChallengerNameColumnDirectSQL();
