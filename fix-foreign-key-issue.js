// =====================================================
// 🔧 FIX CHALLENGE NOTIFICATION FOREIGN KEY ISSUE
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function fixForeignKeyIssue() {
  console.log('🔧 Analyzing Foreign Key Issue...\n');

  try {
    // 1. Check profiles table structure
    console.log('1. Checking profiles table structure...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);

    if (profileError) {
      console.error('❌ profiles table error:', profileError.message);
      return;
    }

    console.log('✅ profiles table accessible');
    if (profiles && profiles.length > 0) {
      console.log('📋 Profile structure:', Object.keys(profiles[0]));
      console.log('📋 Sample profiles:');
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.user_id || profile.id}, Name: ${profile.full_name}`);
      });
    }

    // 2. Check challenge_notifications foreign key constraint
    console.log('\n2. Checking notification table constraints...');
    
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'challenge_notifications' });

    if (constraintError) {
      console.log('⚠️ Cannot check constraints:', constraintError.message);
    } else {
      console.log('📋 Constraints:', constraints);
    }

    // 3. Find the correct foreign key reference
    console.log('\n3. Checking foreign key reference...');
    
    // Check if profiles table uses 'id' or 'user_id' as primary key
    const { data: profileSchema } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (profileSchema) {
      console.log('📋 Profiles table columns:');
      profileSchema.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 4. Check notification table reference
    const { data: notificationSchema } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'challenge_notifications')
      .eq('table_schema', 'public');

    if (notificationSchema) {
      console.log('\n📋 challenge_notifications table columns:');
      notificationSchema.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 5. Propose fix
    console.log('\n🔧 ANALYSIS COMPLETE');
    console.log('📊 ISSUE: Foreign key constraint challenge_notifications.user_id -> profiles.id mismatch');
    console.log('💡 SOLUTIONS:');
    console.log('   A. Update notification schema to reference correct profiles column');
    console.log('   B. Temporarily disable notification triggers');
    console.log('   C. Fix the foreign key constraint in database');

  } catch (error) {
    console.error('💥 Analysis error:', error);
  }
}

// Run the analysis
fixForeignKeyIssue().then(() => {
  console.log('\n🎯 Analysis Complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Analysis failed:', error);
  process.exit(1);
});
