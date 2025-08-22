const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function analyzeRaceCondition() {
  try {
    console.log('🔍 Analyzing race condition details...\n');

    // Get the two problematic users
    const problemUsers = [
      '318fbe86-66c3-4d2c-b17a-64dfeb5faa40', // Long Sang
      '7903702f-2bb8-4bb9-85ac-53c999cddaea'  // sabo
    ];

    for (const userId of problemUsers) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', userId)
        .single();

      console.log(`\n👤 ${profile?.display_name || 'Unknown'} (${userId})`);
      console.log('='.repeat(50));

      // Get milestone awards
      const { data: awards } = await supabase
        .from('milestone_awards')
        .select('*')
        .eq('player_id', userId)
        .eq('event_type', 'rank_registration')
        .order('awarded_at', { ascending: true });

      console.log('🏆 Milestone Awards:');
      awards?.forEach((award, index) => {
        console.log(`   ${index + 1}. ${award.awarded_at}`);
        console.log(`      ID: ${award.id}`);
        console.log(`      SPA: +${award.spa_points_awarded}`);
        console.log(`      Status: ${award.status}`);
      });

      // Get rank requests
      const { data: rankRequests } = await supabase
        .from('rank_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      console.log('\n📋 Rank Requests:');
      rankRequests?.forEach((req, index) => {
        console.log(`   ${index + 1}. Created: ${req.created_at}`);
        console.log(`      Updated: ${req.updated_at}`);
        console.log(`      Status: ${req.status}`);
        console.log(`      ID: ${req.id}`);
      });

      // Get current SPA balance
      const { data: ranking } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      console.log(`\n💰 Current SPA Balance: ${ranking?.spa_points || 0}`);
      
      // Expected vs actual
      const expectedSPA = awards?.length * 150 || 0;
      const actualSPA = ranking?.spa_points || 0;
      
      console.log(`📊 Expected SPA (${awards?.length} × 150): ${expectedSPA}`);
      console.log(`📊 Actual SPA: ${actualSPA}`);
      
      if (expectedSPA !== actualSPA) {
        console.log(`⚠️  MISMATCH: User has ${actualSPA - expectedSPA > 0 ? 'EXTRA' : 'MISSING'} ${Math.abs(actualSPA - expectedSPA)} SPA`);
      }
    }

    // Check trigger logic
    console.log('\n🔧 RACE CONDITION ANALYSIS:');
    console.log('='.repeat(60));
    console.log('❌ PROBLEM: Current trigger logic check:');
    console.log('   1. SELECT existing awards');
    console.log('   2. IF NOT FOUND THEN INSERT new award');
    console.log('   3. ⚠️  TWO triggers can both pass step 1 simultaneously!');

    console.log('\n✅ SOLUTION: Add unique constraint + handle conflicts');
    console.log('   1. UNIQUE INDEX on (player_id, milestone_id, event_type)');
    console.log('   2. INSERT ... ON CONFLICT DO NOTHING');
    console.log('   3. OR use advisory locks in function');

    // Check if constraint exists
    const { data: constraints, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            conname,
            pg_get_constraintdef(oid) as definition
          FROM pg_constraint 
          WHERE conrelid = 'milestone_awards'::regclass
          AND contype = 'u'
        `
      });

    if (!error && constraints) {
      console.log('\n🔒 Current UNIQUE constraints on milestone_awards:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.conname}: ${constraint.definition}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeRaceCondition();
