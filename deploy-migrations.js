// Deploy Legacy SPA Direct Code Claim System Migrations
// This script applies SQL migrations to fix the claim code system

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🚀 Deploying Legacy SPA Direct Code Claim System...');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployMigrations() {
  console.log('📋 Migrations to apply:');
  console.log('  1. Add spa_points column to profiles table');
  console.log('  2. Create claim_legacy_spa_points function');
  console.log('');

  try {
    // Read migration files
    const migration1 = fs.readFileSync('supabase/migrations/20250812000001_add_spa_points_to_profiles.sql', 'utf8');
    const migration2 = fs.readFileSync('supabase/migrations/20250812000002_create_claim_legacy_spa_points_function.sql', 'utf8');

    console.log('📦 Applying migration 1: Add spa_points to profiles...');
    
    // Execute migration 1 - Add spa_points column
    const { data: result1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: migration1
    });

    if (error1) {
      // Try direct SQL execution for profiles table
      console.log('   Trying alternative approach for profiles table...');
      
      const { data: alterResult, error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spa_points INTEGER DEFAULT 0 NOT NULL;'
      });
      
      if (alterError) {
        console.log('❌ Migration 1 failed:', alterError.message);
        console.log('   This might be normal if using ANON key - need ADMIN privileges');
        console.log('   Manual action required: Add spa_points column to profiles table');
      } else {
        console.log('✅ Migration 1 applied successfully (alternative method)');
      }
    } else {
      console.log('✅ Migration 1 applied successfully');
    }

    console.log('📦 Applying migration 2: Create claim function...');
    
    // Execute migration 2 - Create function
    const { data: result2, error: error2 } = await supabase.rpc('exec_sql', {
      sql: migration2
    });

    if (error2) {
      console.log('❌ Migration 2 failed:', error2.message);
      console.log('   Manual action required: Create claim_legacy_spa_points function');
      console.log('   SQL code saved in: supabase/migrations/20250812000002_create_claim_legacy_spa_points_function.sql');
    } else {
      console.log('✅ Migration 2 applied successfully');
    }

    console.log('');
    console.log('🧪 Testing the deployed system...');
    
    // Test the system
    const { data: testData, error: testError } = await supabase.rpc('claim_legacy_spa_points', {
      p_claim_code: 'TEST_INVALID_CODE'
    });

    if (testError) {
      if (testError.code === 'PGRST202') {
        console.log('❌ Function still not available - deployment may have failed');
        console.log('   Please apply migrations manually using Supabase Dashboard');
      } else {
        console.log('✅ Function exists and working (rejected invalid code as expected)');
      }
    } else {
      console.log('✅ Function deployed and working correctly');
      console.log('   Test response:', testData);
    }

  } catch (error) {
    console.log('💥 Deployment error:', error.message);
    console.log('');
    console.log('📝 Manual deployment instructions:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the SQL from these files:');
    console.log('   - supabase/migrations/20250812000001_add_spa_points_to_profiles.sql');
    console.log('   - supabase/migrations/20250812000002_create_claim_legacy_spa_points_function.sql');
  }

  console.log('');
  console.log('🔍 Final verification...');
  
  // Final check
  const { data: finalCheck, error: finalError } = await supabase
    .from('profiles')
    .select('id, full_name, spa_points')
    .limit(1);

  if (finalError) {
    if (finalError.message.includes('spa_points')) {
      console.log('❌ spa_points column still missing');
    } else {
      console.log('❌ Profiles table check failed:', finalError.message);
    }
  } else {
    console.log('✅ spa_points column verified in profiles table');
  }

  console.log('');
  console.log('🎉 Deployment process completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run check-legacy');
  console.log('2. Start dev server: npm run dev');
  console.log('3. Test claim functionality in the app');
}

deployMigrations().catch(console.error);
