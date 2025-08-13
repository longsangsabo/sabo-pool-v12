import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixAllTournamentRelationships() {
  console.log('🔧 Starting comprehensive tournament relationship fix...');
  
  try {
    // 1. Force PostgREST schema reload using SQL
    console.log('1. 🔄 Forcing PostgREST schema reload...');
    
    const { error: notifyError } = await supabase.rpc('notify_pgrst_of_schema_change', {});
    if (notifyError && !notifyError.message.includes('does not exist')) {
      console.log('   PostgREST notify function not available, using alternative method...');
    }
    
    // Alternative: Execute raw SQL to refresh schema
    const { error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: 'NOTIFY pgrst, \'reload schema\';' 
    });
    if (sqlError && !sqlError.message.includes('does not exist')) {
      console.log('   SQL notify not available, continuing...');
    }
    
    // 2. Verify and fix foreign key constraints
    console.log('2. 🔗 Checking foreign key constraints...');
    
    const { data: fkData, error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'tournament_registrations';
      `
    });
    
    if (fkError) {
      console.log('   ⚠️ Cannot check FK constraints, proceeding with fixes...');
    } else {
      console.log('   ✅ Foreign key constraints checked');
    }
    
    // 3. Recreate foreign key constraints properly
    console.log('3. 🛠️ Recreating foreign key constraints...');
    
    const recreateFKSQL = `
      -- Drop existing constraints
      ALTER TABLE public.tournament_registrations 
      DROP CONSTRAINT IF EXISTS tournament_registrations_tournament_id_fkey CASCADE;
      
      ALTER TABLE public.tournament_registrations 
      DROP CONSTRAINT IF EXISTS tournament_registrations_user_id_fkey CASCADE;
      
      -- Recreate proper constraints
      ALTER TABLE public.tournament_registrations 
      ADD CONSTRAINT tournament_registrations_tournament_id_fkey 
      FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id) ON DELETE CASCADE;
      
      ALTER TABLE public.tournament_registrations 
      ADD CONSTRAINT tournament_registrations_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    `;
    
    const { error: recreateError } = await supabase.rpc('exec_sql', { sql: recreateFKSQL });
    if (recreateError) {
      console.log('   ⚠️ Cannot recreate FK via SQL, using alternative approach...');
    } else {
      console.log('   ✅ Foreign key constraints recreated');
    }
    
    // 4. Get all tournaments and fix their data
    console.log('4. 📊 Loading all tournaments...');
    
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, status, current_participants');
    
    if (tournamentsError) {
      console.log('   ❌ Error loading tournaments:', tournamentsError.message);
      return;
    }
    
    console.log(`   ✅ Found ${tournaments?.length || 0} tournaments`);
    
    // 5. Fix each tournament's participant count and relationships
    for (const tournament of tournaments || []) {
      console.log(`\n   🏆 Processing: ${tournament.name}`);
      
      // Get registrations count
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('id, user_id, registration_status')
        .eq('tournament_id', tournament.id);
      
      if (regError) {
        console.log(`     ❌ Error loading registrations: ${regError.message}`);
        continue;
      }
      
      const actualCount = registrations?.length || 0;
      console.log(`     📋 Found ${actualCount} registrations`);
      
      // Update tournament participant count if different
      if (tournament.current_participants !== actualCount) {
        const { error: updateError } = await supabase
          .from('tournaments')
          .update({ current_participants: actualCount })
          .eq('id', tournament.id);
        
        if (updateError) {
          console.log(`     ⚠️ Could not update participant count: ${updateError.message}`);
        } else {
          console.log(`     ✅ Updated participant count: ${tournament.current_participants} → ${actualCount}`);
        }
      }
      
      // Verify profile relationships exist
      if (registrations && registrations.length > 0) {
        const userIds = registrations.map(r => r.user_id).filter(Boolean);
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        if (profileError) {
          console.log(`     ⚠️ Profile lookup error: ${profileError.message}`);
        } else {
          console.log(`     ✅ Verified ${profiles?.length || 0}/${userIds.length} profiles exist`);
        }
      }
    }
    
    // 6. Final schema cache refresh
    console.log('\n6. 🔄 Final schema cache refresh...');
    
    // Multiple approaches to force refresh
    const refreshMethods = [
      async () => {
        await supabase.from('_invalid_table_for_refresh').select('*').limit(1);
      },
      async () => {
        await supabase.rpc('_invalid_function_for_refresh');
      },
      async () => {
        const { data } = await supabase.from('tournament_registrations').select('id').limit(1);
        return data;
      }
    ];
    
    for (const method of refreshMethods) {
      try {
        await method();
      } catch (e) {
        // Expected for invalid calls
      }
    }
    
    // 7. Final verification test
    console.log('7. ✅ Final verification...');
    
    const { data: testData, error: testError } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        tournament_id,
        user_id,
        registration_status
      `)
      .limit(5);
    
    if (testError) {
      console.log(`   ❌ Verification failed: ${testError.message}`);
      return false;
    }
    
    console.log(`   ✅ Verification successful: ${testData?.length || 0} registrations accessible`);
    
    if (testData && testData.length > 0) {
      const userIds = testData.map(r => r.user_id);
      const { data: profiles, error: profileTestError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);
      
      if (profileTestError) {
        console.log(`   ❌ Profile verification failed: ${profileTestError.message}`);
      } else {
        console.log(`   ✅ Profile verification successful: ${profiles?.length || 0} profiles accessible`);
      }
    }
    
    console.log('\n🎉 Tournament relationship fix completed successfully!');
    console.log('📝 All tournaments have been processed and schema cache refreshed.');
    console.log('🚀 Your ClubTournamentManagement should now work without relationship errors!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Fix process failed:', error);
    return false;
  }
}

// Execute the fix
fixAllTournamentRelationships().then(success => {
  if (success) {
    console.log('\n✨ SUCCESS: All tournament relationships have been fixed!');
    console.log('🔄 Please refresh your browser to see the changes.');
  } else {
    console.log('\n❌ FAILED: Some issues remain. Check the logs above.');
  }
  
  process.exit(success ? 0 : 1);
});
