/**
 * CHECK USERS TABLE AND FK CONSTRAINTS
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersAndConstraints() {
  console.log('🔍 CHECKING USERS TABLE AND CONSTRAINTS');
  console.log('======================================\n');

  try {
    // Test 1: Check if user exists
    console.log('1. 👤 Checking if BOSA user exists in users table...');
    
    const bosaUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9';
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', bosaUserId);

    if (userError) {
      console.log('❌ Users table check failed:', userError.message);
    } else {
      console.log(`✅ User exists: ${userData.length > 0 ? 'YES' : 'NO'}`);
      if (userData.length > 0) {
        console.log(`   Email: ${userData[0].email}`);
      }
    }

    // Test 2: Check foreign key constraints
    console.log('\n2. 🔗 Checking foreign key constraints...');
    
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('exec_sql', { 
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
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'spa_transactions'
        `
      });

    if (constraintError) {
      console.log('❌ Constraint check failed:', constraintError.message);
    } else {
      if (Array.isArray(constraintData)) {
        console.log('✅ Foreign key constraints:');
        constraintData.forEach(constraint => {
          console.log(`   ${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        });
      } else {
        console.log('✅ No foreign key constraints found (or different response format)');
      }
    }

    // Test 3: Check triggers
    console.log('\n3. ⚡ Checking triggers on spa_transactions...');
    
    const { data: triggerData, error: triggerError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            action_timing,
            action_statement
          FROM information_schema.triggers 
          WHERE event_object_table = 'spa_transactions'
        `
      });

    if (triggerError) {
      console.log('❌ Trigger check failed:', triggerError.message);
    } else {
      if (Array.isArray(triggerData) && triggerData.length > 0) {
        console.log('✅ Triggers found:');
        triggerData.forEach(trigger => {
          console.log(`   ${trigger.trigger_name}: ${trigger.event_manipulation} ${trigger.action_timing}`);
          console.log(`      Action: ${trigger.action_statement}`);
        });
      } else {
        console.log('✅ No triggers found');
      }
    }

    // Test 4: Try insert with auth context
    console.log('\n4. 🔐 Testing insert with auth context...');
    
    // First, try to set auth context
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',  // dummy - this will fail but may set some context
      password: 'dummy'
    });

    // Now try insert again
    const { data: insertData2, error: insertError2 } = await supabase
      .from('spa_transactions')
      .insert({
        user_id: bosaUserId,
        amount: 1,
        transaction_type: 'credit',
        source_type: 'test_auth',
        description: 'Auth context test',
        status: 'completed'
      })
      .select();

    if (insertError2) {
      console.log('❌ Insert with auth context failed:', insertError2.message);
    } else {
      console.log('✅ Insert with auth context successful');
      // Clean up
      await supabase
        .from('spa_transactions')
        .delete()
        .eq('id', insertData2[0].id);
    }

    // Test 5: Try bypassing RLS completely
    console.log('\n5. 🚫 Trying to disable RLS temporarily...');
    
    const { data: disableRLS, error: disableError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SET row_security = off;
          INSERT INTO spa_transactions (
            user_id, amount, transaction_type, source_type, description, status
          ) VALUES (
            '${bosaUserId}', 1, 'credit', 'test_no_rls', 'No RLS test', 'completed'
          ) RETURNING id;
          SET row_security = on;
        `
      });

    if (disableError) {
      console.log('❌ Disable RLS insert failed:', disableError.message);
    } else {
      console.log('✅ No RLS insert successful:', disableRLS);
      
      // Clean up
      await supabase.rpc('exec_sql', { 
        sql: `DELETE FROM spa_transactions WHERE source_type = 'test_no_rls'` 
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUsersAndConstraints().catch(console.error);
