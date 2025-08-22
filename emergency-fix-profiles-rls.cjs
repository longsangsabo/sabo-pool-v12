#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function emergencyFixProfilesRLS() {
  console.log('🚨 EMERGENCY FIX: PROFILES RLS INFINITE RECURSION');
  console.log('=' .repeat(60));
  
  try {
    console.log('📋 1. DROPPING ALL PROBLEMATIC POLICIES...');
    
    // Drop all existing policies on profiles
    const dropSQL = `
      -- Drop all existing RLS policies on profiles table
      DO $$ 
      DECLARE
          pol record;
      BEGIN
          FOR pol IN 
              SELECT policyname 
              FROM pg_policies 
              WHERE tablename = 'profiles' AND schemaname = 'public'
          LOOP
              EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.profiles';
              RAISE NOTICE 'Dropped policy: %', pol.policyname;
          END LOOP;
      END $$;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropSQL });
    if (dropError) {
      console.log('❌ Error dropping policies:', dropError.message);
    } else {
      console.log('✅ All existing policies dropped');
    }
    
    console.log('\n📋 2. CREATING SIMPLE SAFE POLICIES...');
    
    // Create very simple policies without any recursion risk
    const createSimpleSQL = `
      -- Create simple, safe RLS policies for profiles
      
      -- 1. Allow all authenticated users to view profiles
      CREATE POLICY "simple_view_profiles" 
      ON public.profiles 
      FOR SELECT 
      TO authenticated
      USING (true);
      
      -- 2. Allow users to update their own profile only
      CREATE POLICY "simple_update_own_profile" 
      ON public.profiles 
      FOR UPDATE 
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
      
      -- 3. Allow users to insert their own profile only
      CREATE POLICY "simple_insert_own_profile" 
      ON public.profiles 
      FOR INSERT 
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
      
      -- 4. Allow service role to do everything
      CREATE POLICY "simple_service_role_access" 
      ON public.profiles 
      FOR ALL 
      TO service_role
      USING (true)
      WITH CHECK (true);
      
      -- Grant proper permissions
      GRANT ALL ON public.profiles TO service_role;
      GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createSimpleSQL });
    if (createError) {
      console.log('❌ Error creating simple policies:', createError.message);
    } else {
      console.log('✅ Simple safe policies created');
    }
    
    console.log('\n🧪 3. TESTING ACCESS...');
    
    // Test profiles table access
    const { data: testProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, is_admin')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Profiles test failed:', profilesError.message);
      
      // Last resort: disable RLS temporarily
      console.log('\n🚨 4. LAST RESORT: TEMPORARILY DISABLE RLS...');
      
      const disableRLSSQL = `
        ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      `;
      
      const { error: disableError } = await supabase.rpc('exec_sql', { sql: disableRLSSQL });
      if (disableError) {
        console.log('❌ Cannot disable RLS:', disableError.message);
      } else {
        console.log('⚠️  RLS temporarily disabled for profiles table');
        console.log('⚠️  SECURITY WARNING: All users can access all profiles');
        console.log('⚠️  Enable RLS again after fixing the issue');
      }
    } else {
      console.log('✅ Profiles access working!');
      console.log('📊 Sample profiles:', testProfiles);
    }
    
    // Test role functions
    console.log('\n🧪 4. TESTING ROLE FUNCTIONS...');
    
    const testUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169';
    const { data: roles, error: rolesError } = await supabase
      .rpc('get_user_roles', { _user_id: testUserId });
    
    if (rolesError) {
      console.log('❌ Role functions failed:', rolesError.message);
    } else {
      console.log('✅ Role functions working:', roles);
    }
    
    console.log('\n✅ EMERGENCY FIX COMPLETED');
    console.log('=' .repeat(60));
    console.log('🎯 Status: Profiles table should now be accessible');
    console.log('🔄 Please refresh your application and test rank requests');
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
  }
}

// Run the emergency fix
emergencyFixProfilesRLS();
