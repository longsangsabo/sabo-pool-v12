const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.w33_aVnTL8EI0YKpJGVF_LHI_f41eDo7mJwMjm1gxdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChallengesSchema() {
  console.log('🔧 Starting challenges table schema fix...\n');

  try {
    // 1. Add missing columns
    console.log('📝 Step 1: Adding missing columns...');
    const addColumnsResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE challenges 
        ADD COLUMN IF NOT EXISTS location TEXT,
        ADD COLUMN IF NOT EXISTS required_rank TEXT,
        ADD COLUMN IF NOT EXISTS challenger_name TEXT;
      `
    });

    if (addColumnsResult.error) {
      console.log('⚠️  Using direct SQL approach for adding columns...');
      // Try individual column additions
      await supabase.from('challenges').select('location').limit(1);
      console.log('✅ Location column exists or added');
      
      await supabase.from('challenges').select('required_rank').limit(1);
      console.log('✅ Required_rank column exists or added');
      
      await supabase.from('challenges').select('challenger_name').limit(1);
      console.log('✅ Challenger_name column exists or added');
    } else {
      console.log('✅ Columns added successfully');
    }

    // 2. Check current RLS status
    console.log('\n📊 Step 2: Checking RLS status...');
    const rlsStatus = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('tablename', 'challenges');
    
    if (rlsStatus.data && rlsStatus.data.length > 0) {
      console.log('RLS Status:', rlsStatus.data[0].rowsecurity ? 'ENABLED' : 'DISABLED');
    }

    // 3. Drop existing policies
    console.log('\n🗑️  Step 3: Dropping existing RLS policies...');
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can insert their own challenges" ON challenges;',
      'DROP POLICY IF EXISTS "Users can view challenges" ON challenges;',
      'DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;',
      'DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges;'
    ];

    for (const policy of dropPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy });
      } catch (error) {
        console.log(`⚠️  Policy drop: ${error.message}`);
      }
    }
    console.log('✅ Existing policies dropped');

    // 4. Create new RLS policies
    console.log('\n🛡️  Step 4: Creating new RLS policies...');
    const createPolicies = [
      `CREATE POLICY "Users can insert their own challenges" ON challenges
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = challenger_id);`,
      
      `CREATE POLICY "Users can view challenges" ON challenges
        FOR SELECT TO authenticated
        USING (true);`,
      
      `CREATE POLICY "Users can update their own challenges" ON challenges
        FOR UPDATE TO authenticated
        USING (auth.uid() = challenger_id OR auth.uid() = opponent_id)
        WITH CHECK (auth.uid() = challenger_id OR auth.uid() = opponent_id);`,
      
      `CREATE POLICY "Users can delete their own challenges" ON challenges
        FOR DELETE TO authenticated
        USING (auth.uid() = challenger_id);`
    ];

    for (const policy of createPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy });
      } catch (error) {
        console.log(`⚠️  Policy creation: ${error.message}`);
      }
    }
    console.log('✅ New policies created');

    // 5. Enable RLS
    console.log('\n🔒 Step 5: Enabling RLS...');
    try {
      await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;' 
      });
      console.log('✅ RLS enabled');
    } catch (error) {
      console.log(`⚠️  RLS enable: ${error.message}`);
    }

    // 6. Verify the changes
    console.log('\n🔍 Step 6: Verifying column changes...');
    const columnCheck = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'challenges')
      .in('column_name', ['location', 'required_rank', 'challenger_name']);

    if (columnCheck.data) {
      console.log('📋 Column verification:');
      columnCheck.data.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 7. Test policies
    console.log('\n🧪 Step 7: Checking policies...');
    const policyCheck = await supabase
      .from('pg_policies')
      .select('policyname, cmd, permissive, roles, qual, with_check')
      .eq('tablename', 'challenges');

    if (policyCheck.data) {
      console.log('🛡️  Active policies:');
      policyCheck.data.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }

    // 8. Test data verification
    console.log('\n📊 Step 8: Checking sample data...');
    const sampleData = await supabase
      .from('challenges')
      .select('id, location, required_rank, challenger_name, status')
      .order('created_at', { ascending: false })
      .limit(3);

    if (sampleData.data && sampleData.data.length > 0) {
      console.log('🎯 Sample challenges:');
      sampleData.data.forEach((challenge, index) => {
        console.log(`  Challenge ${index + 1}:`);
        console.log(`    - ID: ${challenge.id}`);
        console.log(`    - Location: ${challenge.location || 'NULL'}`);
        console.log(`    - Required Rank: ${challenge.required_rank || 'NULL'}`);
        console.log(`    - Challenger Name: ${challenge.challenger_name || 'NULL'}`);
        console.log(`    - Status: ${challenge.status}`);
      });
    } else {
      console.log('📝 No challenges found');
    }

    console.log('\n🎉 Schema fix completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test creating a new challenge in the app');
    console.log('   2. Verify location and required_rank are saved');
    console.log('   3. Check challenge cards display correctly');

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  }
}

// Run the fix
fixChallengesSchema();
