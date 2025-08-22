const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function debugAdminRedirect() {
  try {
    console.log('🔍 DEBUG: Admin Redirect Issue\n');

    // 1. Check specific admin user that's having issues
    console.log('📊 1. CHECKING ADMIN USER DETAILS:');
    console.log('='.repeat(50));

    // Check both admin users
    const adminUsers = [
      { id: 'd7d6ce12-490f-4fff-b913-80044de5e169', name: 'Anh Long' },
      { id: '94527a17-1dd9-42f9-bcb7-6969329464e2', name: 'Anh Long Magic' }
    ];

    for (const user of adminUsers) {
      console.log(`\n👤 ${user.name} (${user.id})`);
      
      // Check profiles.is_admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, is_admin')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.log(`   ❌ Profile error: ${profileError.message}`);
      } else {
        console.log(`   👤 Display name: ${profile.display_name}`);
        console.log(`   👑 Old is_admin: ${profile.is_admin}`);
      }

      // Check user_roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (rolesError) {
        console.log(`   ❌ Roles error: ${rolesError.message}`);
      } else {
        console.log(`   🏷️  New roles: [${roles.map(r => r.role).join(', ')}]`);
        roles.forEach((role, index) => {
          console.log(`      ${index + 1}. ${role.role} (created: ${role.created_at})`);
        });
      }

      // Test role functions
      const { data: userRoles, error: funcError } = await supabase
        .rpc('get_user_roles', { _user_id: user.id });

      if (funcError) {
        console.log(`   ❌ Function error: ${funcError.message}`);
      } else {
        console.log(`   🔧 Function result: [${userRoles?.join(', ') || 'none'}]`);
      }

      // Test primary role function
      const { data: primaryRole, error: primaryError } = await supabase
        .rpc('get_user_primary_role', { _user_id: user.id });

      if (primaryError) {
        console.log(`   ❌ Primary role error: ${primaryError.message}`);
      } else {
        console.log(`   🎯 Primary role: ${primaryRole}`);
        
        // Check redirect logic
        const expectedRedirect = getExpectedRedirect(primaryRole);
        console.log(`   📍 Expected redirect: ${expectedRedirect}`);
        
        if (primaryRole === 'club_owner' && userRoles?.includes('admin')) {
          console.log(`   ⚠️  ISSUE FOUND: Primary role is club_owner but user has admin role!`);
        }
      }
    }

    // 2. Check role priority logic
    console.log('\n📊 2. ROLE PRIORITY ANALYSIS:');
    console.log('='.repeat(50));
    
    console.log('   🔍 Current priority in get_user_primary_role function:');
    console.log('   1. admin (priority 1) → /admin/dashboard');
    console.log('   2. moderator (priority 2) → /admin/dashboard');
    console.log('   3. club_owner (priority 3) → /club-management');
    console.log('   4. user (priority 4) → /dashboard');

    console.log('\n   ❓ Problem analysis:');
    console.log('   - If user has BOTH admin AND club_owner roles');
    console.log('   - The function should return admin (priority 1)');
    console.log('   - But something might be wrong with the ORDER BY clause');

    // 3. Test the priority logic directly
    console.log('\n📊 3. TESTING PRIORITY LOGIC:');
    console.log('='.repeat(50));

    const testUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169'; // Anh Long

    // Direct SQL test to see what's happening
    const { data: priorityTest, error: priorityError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            role::TEXT,
            CASE role::TEXT
              WHEN 'admin' THEN 1
              WHEN 'moderator' THEN 2
              WHEN 'club_owner' THEN 3
              WHEN 'user' THEN 4
              ELSE 5
            END as priority_score
          FROM public.user_roles
          WHERE user_id = '${testUserId}'
          ORDER BY 
            CASE role::TEXT
              WHEN 'admin' THEN 1
              WHEN 'moderator' THEN 2
              WHEN 'club_owner' THEN 3
              WHEN 'user' THEN 4
              ELSE 5
            END
        `
      });

    if (priorityError) {
      console.log('   ❌ Priority test error:', priorityError.message);
    } else {
      console.log('   🧪 Priority test results:');
      const testResults = Array.isArray(priorityTest) ? priorityTest : [priorityTest];
      
      testResults?.forEach((result, index) => {
        console.log(`      ${index + 1}. ${result.role} (priority: ${result.priority_score})`);
      });
      
      if (testResults?.length > 0) {
        const topRole = testResults[0].role;
        console.log(`   🎯 Top priority role: ${topRole}`);
        
        if (topRole !== 'admin') {
          console.log(`   🚨 BUG FOUND: Top role should be 'admin' but is '${topRole}'`);
        }
      }
    }

    // 4. Check if there's an issue with the redirect logic in frontend
    console.log('\n📊 4. FRONTEND REDIRECT LOGIC CHECK:');
    console.log('='.repeat(50));
    
    console.log('   🔍 Expected frontend flow:');
    console.log('   1. useRoles() hook calls get_user_primary_role()');
    console.log('   2. getRoleBasedRedirect(primaryRole) determines path');
    console.log('   3. Should redirect to /admin/dashboard for admin role');
    
    console.log('\n   ⚠️  Potential issues:');
    console.log('   1. Role function returns wrong primary role');
    console.log('   2. Frontend redirect logic has bug');
    console.log('   3. User has multiple roles, wrong priority');
    console.log('   4. Cache/timing issue in useRoles hook');

    // 5. Check if there are duplicate or conflicting role assignments
    console.log('\n📊 5. ROLE CONFLICTS CHECK:');
    console.log('='.repeat(50));

    const { data: roleConflicts, error: conflictError } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at, created_by')
      .in('user_id', adminUsers.map(u => u.id))
      .order('user_id, created_at');

    if (conflictError) {
      console.log('   ❌ Conflict check error:', conflictError.message);
    } else {
      console.log('   📋 All role assignments:');
      
      let currentUserId = null;
      roleConflicts?.forEach(role => {
        if (currentUserId !== role.user_id) {
          currentUserId = role.user_id;
          const user = adminUsers.find(u => u.id === role.user_id);
          console.log(`\n   👤 ${user?.name || 'Unknown'}:`);
        }
        console.log(`      - ${role.role} (${role.created_at})`);
      });
    }

    // 6. Recommendations
    console.log('\n💡 6. RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    console.log('   🔧 IMMEDIATE FIXES TO CHECK:');
    console.log('   1. Verify get_user_primary_role function ORDER BY works correctly');
    console.log('   2. Check if frontend useRoles hook has caching issues');
    console.log('   3. Test getRoleBasedRedirect function with admin role');
    console.log('   4. Clear browser cache/localStorage for admin user');
    console.log('   5. Check if there are timing issues in auth flow');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

function getExpectedRedirect(primaryRole) {
  switch (primaryRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'moderator':
      return '/admin/dashboard';
    case 'club_owner':
      return '/club-management';
    case 'user':
    default:
      return '/dashboard';
  }
}

debugAdminRedirect();
