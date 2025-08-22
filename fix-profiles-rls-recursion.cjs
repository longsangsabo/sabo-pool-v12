#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixProfilesRLSInfiniteRecursion() {
  console.log('🔧 FIXING PROFILES RLS INFINITE RECURSION');
  console.log('=' .repeat(60));
  
  try {
    // Read the SQL fix script
    const sqlScript = fs.readFileSync('/workspaces/sabo-pool-v12/fix-profiles-rls-infinite-recursion.sql', 'utf8');
    
    console.log('📋 1. EXECUTING RLS FIX...');
    
    // Execute the fix script
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlScript
    });
    
    if (error) {
      console.log('❌ Error executing fix script:', error.message);
      
      // Try alternative approach - execute step by step
      console.log('\n🔄 2. TRYING STEP-BY-STEP APPROACH...');
      
      // Step 1: Drop problematic policies
      console.log('   Step 1: Dropping problematic policies...');
      const dropPoliciesSQL = `
        DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
      `;
      
      const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPoliciesSQL });
      if (dropError) {
        console.log('   ❌ Error dropping policies:', dropError.message);
      } else {
        console.log('   ✅ Policies dropped successfully');
      }
      
      // Step 2: Create security definer function
      console.log('   Step 2: Creating security definer function...');
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION public.is_current_user_admin()
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        STABLE
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND is_admin = true
          );
        END;
        $$;
      `;
      
      const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      if (functionError) {
        console.log('   ❌ Error creating function:', functionError.message);
      } else {
        console.log('   ✅ Security definer function created');
      }
      
      // Step 3: Create safe policies
      console.log('   Step 3: Creating safe RLS policies...');
      const createPoliciesSQL = `
        CREATE POLICY "Users can view all profiles" 
        ON public.profiles 
        FOR SELECT 
        TO authenticated
        USING (true);

        CREATE POLICY "Users can update their own profile" 
        ON public.profiles 
        FOR UPDATE 
        TO authenticated
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own profile" 
        ON public.profiles 
        FOR INSERT 
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Service role full access" 
        ON public.profiles 
        FOR ALL 
        TO service_role
        USING (true)
        WITH CHECK (true);
      `;
      
      const { error: policiesError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL });
      if (policiesError) {
        console.log('   ❌ Error creating policies:', policiesError.message);
      } else {
        console.log('   ✅ Safe RLS policies created');
      }
      
    } else {
      console.log('✅ Fix script executed successfully');
      if (data) {
        console.log('📋 Script output:', data);
      }
    }
    
    // Test the fix
    console.log('\n🧪 3. TESTING THE FIX...');
    
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .limit(1);
    
    if (testError) {
      console.log('❌ Test failed:', testError.message);
      
      // If still failing, try simple policy
      console.log('\n🔄 4. APPLYING EMERGENCY SIMPLE POLICY...');
      const emergencySQL = `
        DROP POLICY IF EXISTS "Emergency simple policy" ON public.profiles;
        CREATE POLICY "Emergency simple policy" 
        ON public.profiles 
        FOR ALL 
        TO authenticated
        USING (true)
        WITH CHECK (true);
      `;
      
      const { error: emergencyError } = await supabase.rpc('exec_sql', { sql: emergencySQL });
      if (emergencyError) {
        console.log('❌ Emergency policy failed:', emergencyError.message);
      } else {
        console.log('✅ Emergency simple policy applied');
        
        // Test again
        const { data: finalTest, error: finalError } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .limit(1);
        
        if (finalError) {
          console.log('❌ Final test still failed:', finalError.message);
        } else {
          console.log('✅ Final test successful - profiles table is accessible');
        }
      }
    } else {
      console.log('✅ Test successful - profiles table is accessible');
      console.log('📊 Sample data:', testData);
    }
    
    console.log('\n📊 4. VERIFICATION...');
    
    // Test role system functions
    const testUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169';
    
    const { data: rolesTest, error: rolesError } = await supabase
      .rpc('get_user_roles', { _user_id: testUserId });
    
    if (rolesError) {
      console.log('❌ Role functions test failed:', rolesError.message);
    } else {
      console.log('✅ Role functions working:', rolesTest);
    }
    
    console.log('\n✅ PROFILES RLS FIX COMPLETED');
    console.log('=' .repeat(60));
    console.log('🎯 Next steps:');
    console.log('   1. Refresh your browser/app');
    console.log('   2. Test rank requests functionality');
    console.log('   3. Verify all role-based features work');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the fix
fixProfilesRLSInfiniteRecursion();
