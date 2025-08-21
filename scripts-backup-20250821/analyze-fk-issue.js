// =====================================================
// 🔧 FIX FOREIGN KEY CONSTRAINT IN NOTIFICATION SYSTEM
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function fixForeignKeyConstraint() {
  console.log('🔧 Analyzing and Fixing Foreign Key Constraint...\n');

  try {
    // 1. First verify the current constraint issue
    console.log('1. Analyzing the foreign key constraint issue...');
    
    // Check if the user_id in profiles matches the one failing
    const problematicUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
    
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, full_name')
      .eq('user_id', problematicUserId)
      .single();

    if (profileError || !profileCheck) {
      console.log('❌ User not found in profiles with user_id:', problematicUserId);
      
      // Check if user exists with different column
      const { data: alternativeCheck, error: altError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name')
        .eq('id', problematicUserId)
        .single();

      if (altError || !alternativeCheck) {
        console.log('❌ User not found with id either');
        console.log('🔍 Let\'s see what users are actually in the table...');
        
        const { data: allUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name')
          .limit(5);

        if (usersError) {
          console.error('Error fetching users:', usersError.message);
        } else {
          console.log('📋 Available users in profiles table:');
          allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ID: ${user.id}, User_ID: ${user.user_id}, Name: ${user.full_name}`);
          });
        }
      } else {
        console.log('✅ Found user with id column:', alternativeCheck);
        console.log('💡 ISSUE: Foreign key references wrong column!');
        console.log('   Current: challenge_notifications.user_id -> profiles.id');  
        console.log('   Should be: challenge_notifications.user_id -> profiles.user_id');
      }
    } else {
      console.log('✅ User found in profiles:', profileCheck);
      console.log('😟 This means something else is wrong...');
    }

    // 2. Check the foreign key constraint definition
    console.log('\n2. Checking foreign key constraint definition...');
    
    // We need to check what column the FK actually references
    const { data: constraintInfo, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'challenge_notifications')
      .eq('constraint_type', 'FOREIGN KEY');

    if (constraintError) {
      console.log('⚠️ Cannot check constraints directly');
    } else if (constraintInfo && constraintInfo.length > 0) {
      console.log('📋 Found foreign key constraints:', constraintInfo);
    }

    // 3. Alternative approach - check if notification table references profiles.id instead of profiles.user_id
    console.log('\n3. Testing different user references...');
    
    // Try to find a working user_id from challenges table
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('challenger_id')
      .limit(3);

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError.message);
    } else if (challenges && challenges.length > 0) {
      console.log('📋 Sample challenger_ids from challenges:');
      challenges.forEach((challenge, index) => {
        console.log(`   ${index + 1}. ${challenge.challenger_id}`);
      });

      // Test if these challenger_ids exist in profiles
      for (const challenge of challenges) {
        const { data: profileTest, error: testError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name')
          .or(`id.eq.${challenge.challenger_id},user_id.eq.${challenge.challenger_id}`)
          .single();

        if (!testError && profileTest) {
          console.log(`✅ Found matching profile for ${challenge.challenger_id}:`);
          console.log(`   Profile ID: ${profileTest.id}`);
          console.log(`   Profile User_ID: ${profileTest.user_id}`);
          console.log(`   Name: ${profileTest.full_name}`);
          
          if (profileTest.id === challenge.challenger_id) {
            console.log('💡 ISSUE IDENTIFIED: Challenges use profiles.id but notifications expect profiles.user_id');
          } else {
            console.log('💡 ISSUE IDENTIFIED: Different ID reference pattern');
          }
          break;
        }
      }
    }

    console.log('\n🎯 SOLUTION RECOMMENDATIONS:');
    console.log('1. 🔧 Fix the foreign key constraint to reference the correct column');
    console.log('2. 🔀 Update triggers to use the correct user ID mapping');
    console.log('3. 🛡️ Add validation in triggers to check user existence');
    console.log('4. 🚫 Temporarily disable notification triggers');

  } catch (error) {
    console.error('💥 Analysis failed:', error);
  }
}

// Run the analysis
fixForeignKeyConstraint().then(() => {
  console.log('\n🎯 Analysis Complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Analysis failed:', error);
  process.exit(1);
});
