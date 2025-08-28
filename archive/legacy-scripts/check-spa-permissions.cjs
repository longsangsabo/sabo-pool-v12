/**
 * CHECK SPA_TRANSACTIONS POLICIES AND PERMISSIONS
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkPermissions() {
  console.log('🔍 CHECKING SPA_TRANSACTIONS PERMISSIONS');
  console.log('========================================\n');

  try {
    // Test 1: Simple read
    console.log('1. 📖 Testing read access...');
    const { data: readData, error: readError } = await supabase
      .from('spa_transactions')
      .select('*')
      .limit(5);

    if (readError) {
      console.log('❌ Read failed:', readError.message);
    } else {
      console.log(`✅ Read successful: ${readData.length} records`);
    }

    // Test 2: Try insert with minimal data
    console.log('\n2. ✏️  Testing insert access...');
    
    const testUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9'; // BOSA user
    
    const { data: insertData, error: insertError } = await supabase
      .from('spa_transactions')
      .insert({
        user_id: testUserId,
        amount: 1,
        transaction_type: 'credit',
        source_type: 'test',
        description: 'Permission test',
        status: 'completed'
      })
      .select();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('   Details:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test record
      await supabase
        .from('spa_transactions')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Test record cleaned up');
    }

    // Test 3: Check RLS policies
    console.log('\n3. 🔒 Checking RLS policies...');
    
    const { data: policyData, error: policyError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity,
            (SELECT string_agg(policyname || ': ' || qual, ', ' ORDER BY policyname) 
             FROM pg_policies 
             WHERE schemaname = 'public' AND tablename = 'spa_transactions') as policies
          FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = 'spa_transactions'
        `
      });

    if (policyError) {
      console.log('❌ RLS check failed:', policyError.message);
    } else {
      console.log('✅ RLS info:', policyData);
    }

    // Test 4: Check table structure
    console.log('\n4. 🏗️  Checking table structure...');
    
    const { data: structureData, error: structureError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'spa_transactions'
          ORDER BY ordinal_position
        `
      });

    if (structureError) {
      console.log('❌ Structure check failed:', structureError.message);
    } else {
      console.log('✅ Table structure:');
      structureData.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // Test 5: Try direct SQL insert
    console.log('\n5. 🛠️  Testing direct SQL insert...');
    
    const { data: sqlInsertData, error: sqlInsertError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          INSERT INTO spa_transactions (
            user_id, amount, transaction_type, source_type, description, status
          ) VALUES (
            '${testUserId}', 1, 'credit', 'test_direct', 'Direct SQL test', 'completed'
          ) RETURNING id, amount
        `
      });

    if (sqlInsertError) {
      console.log('❌ Direct SQL insert failed:', sqlInsertError.message);
    } else {
      console.log('✅ Direct SQL insert successful:', sqlInsertData);
      
      // Clean up
      await supabase.rpc('exec_sql', { 
        sql: `DELETE FROM spa_transactions WHERE source_type = 'test_direct'` 
      });
      console.log('🧹 Direct SQL test record cleaned up');
    }

  } catch (error) {
    console.error('❌ Permission check failed:', error);
  }
}

checkPermissions().catch(console.error);
