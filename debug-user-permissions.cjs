const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function debugUserPermissions() {
  console.log('🚨 CRITICAL: User Role Permissions Debug');
  console.log('==========================================\n');
  
  // 1. Check profiles table structure and RLS policies
  console.log('📋 1. CHECKING PROFILES TABLE POLICIES...');
  
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'profiles');
    
  if (policiesError) {
    console.log('❌ Cannot check policies:', policiesError.message);
  } else {
    console.log('🔒 RLS Policies for profiles table:');
    policies?.forEach(policy => {
      console.log(`   - ${policy.policyname}: ${policy.cmd} - ${policy.qual || 'No conditions'}`);
    });
  }
  
  // 2. Check a regular user's profile access
  console.log('\n📋 2. TESTING REGULAR USER PROFILE ACCESS...');
  
  // Find a regular user (not admin)
  const { data: regularUsers, error: usersError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .eq('role', 'user')
    .limit(3);
    
  if (usersError) {
    console.log('❌ Cannot find regular users:', usersError.message);
  } else {
    console.log(`👥 Found ${regularUsers?.length} regular users`);
    
    for (const userRole of regularUsers || []) {
      console.log(`\n👤 Testing user: ${userRole.user_id}`);
      
      // Check profile access as service role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userRole.user_id)
        .single();
        
      if (profileError) {
        console.log(`   ❌ Profile access error: ${profileError.message}`);
        console.log(`   🔍 Error code: ${profileError.code}`);
        console.log(`   📝 Details: ${profileError.details}`);
      } else {
        console.log(`   ✅ Profile accessible`);
        console.log(`   📝 Display name: ${profile.display_name}`);
        console.log(`   🖼️  Avatar: ${profile.avatar_url ? 'Has avatar' : 'No avatar'}`);
      }
      
      // Test if user can update their own profile (simulate authenticated user)
      console.log(`   🧪 Testing profile update simulation...`);
      
      // This won't work with service role, but we can check the structure
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: profile.display_name }) // No actual change
        .eq('user_id', userRole.user_id);
        
      if (updateError) {
        console.log(`   ❌ Update error: ${updateError.message}`);
        if (updateError.message.includes('RLS') || updateError.message.includes('policy')) {
          console.log(`   🚨 RLS POLICY BLOCKING USER UPDATES!`);
        }
      } else {
        console.log(`   ✅ Update would work`);
      }
      
      break; // Test just first user
    }
  }
  
  // 3. Check if there are any breaking RLS policies
  console.log('\n📋 3. CHECKING FOR PROBLEMATIC RLS POLICIES...');
  
  try {
    const { data: rlsStatus } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            (SELECT count(*) FROM pg_policies WHERE tablename = c.relname) as policy_count
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname IN ('profiles', 'user_roles')
          AND n.nspname = 'public';
        `
      });
    
    console.log('🔒 RLS Status:', rlsStatus);
  } catch (e) {
    // Try alternative approach
    console.log('📊 Checking table permissions...');
    
    const { data: tableInfo, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'user_roles']);
      
    console.log('📋 Tables found:', tableInfo);
  }
  
  // 4. Check if role system migration broke something
  console.log('\n📋 4. CHECKING ROLE SYSTEM CONSISTENCY...');
  
  const { data: roleConsistency, error: consistencyError } = await supabase
    .from('profiles')
    .select(`
      user_id,
      display_name,
      is_admin,
      user_roles!inner(role)
    `)
    .limit(5);
    
  if (consistencyError) {
    console.log('❌ Role consistency check failed:', consistencyError.message);
    
    // Check if foreign key is broken
    if (consistencyError.message.includes('user_roles')) {
      console.log('🚨 USER_ROLES TABLE RELATIONSHIP BROKEN!');
      
      // Check if user_roles table exists
      const { data: userRolesExists } = await supabase
        .from('user_roles')
        .select('count(*)')
        .limit(1);
        
      console.log('📋 user_roles table accessible:', !!userRolesExists);
    }
  } else {
    console.log('✅ Role system consistency OK');
    console.log('📊 Sample data:', roleConsistency?.slice(0, 2));
  }
  
  // 5. Recommendations
  console.log('\n💡 5. IMMEDIATE FIXES NEEDED:');
  console.log('==============================');
  console.log('🔧 1. Check RLS policies on profiles table');
  console.log('🔧 2. Ensure authenticated users can update their own profiles');
  console.log('🔧 3. Verify user_roles table relationship is not blocking access');
  console.log('🔧 4. Check if role migration scripts broke basic permissions');
}

debugUserPermissions().catch(console.error);
