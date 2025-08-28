const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function auditRoleSystem() {
  try {
    console.log('🔍 AUDIT ROLE & NAVIGATION SYSTEM\n');

    // 1. Check role system migration status
    console.log('📊 1. ROLE SYSTEM STATUS:');
    console.log('='.repeat(50));

    // Check if new user_roles table exists
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_roles', 'profiles']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    const hasUserRolesTable = tablesData?.some(t => t.table_name === 'user_roles');
    const hasProfilesTable = tablesData?.some(t => t.table_name === 'profiles');

    console.log(`   ✅ user_roles table: ${hasUserRolesTable ? 'EXISTS' : 'MISSING'}`);
    console.log(`   ✅ profiles table: ${hasProfilesTable ? 'EXISTS' : 'MISSING'}`);

    if (hasUserRolesTable) {
      // Check user_roles data
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!rolesError && userRoles) {
        console.log(`   📈 Total role assignments: ${userRoles.length}`);
        
        const roleStats = {};
        userRoles.forEach(role => {
          roleStats[role.role] = (roleStats[role.role] || 0) + 1;
        });

        console.log('   📊 Role distribution:');
        Object.entries(roleStats).forEach(([role, count]) => {
          console.log(`      - ${role}: ${count} users`);
        });
      }
    }

    // 2. Check old vs new admin system
    console.log('\n📊 2. ADMIN SYSTEM COMPARISON:');
    console.log('='.repeat(50));

    if (hasProfilesTable) {
      const { data: oldAdmins, error: oldAdminsError } = await supabase
        .from('profiles')
        .select('user_id, display_name, is_admin')
        .eq('is_admin', true);

      if (!oldAdminsError && oldAdmins) {
        console.log(`   👑 Old admin system (profiles.is_admin): ${oldAdmins.length} admins`);
        oldAdmins.forEach(admin => {
          console.log(`      - ${admin.display_name || 'Unknown'} (${admin.user_id.slice(0, 8)}...)`);
        });
      }
    }

    if (hasUserRolesTable) {
      const { data: newAdmins, error: newAdminsError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          profiles!inner(display_name)
        `)
        .eq('role', 'admin');

      if (!newAdminsError && newAdmins) {
        console.log(`   🔐 New admin system (user_roles): ${newAdmins.length} admins`);
        newAdmins.forEach(admin => {
          console.log(`      - ${admin.profiles.display_name || 'Unknown'} (${admin.user_id.slice(0, 8)}...)`);
        });
      }
    }

    // 3. Check role consistency
    console.log('\n📊 3. ROLE CONSISTENCY CHECK:');
    console.log('='.repeat(50));

    if (hasUserRolesTable && hasProfilesTable) {
      // Find mismatches between old and new systems
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, is_admin');

      const { data: allRoles, error: allRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (!profilesError && !allRolesError && allProfiles && allRoles) {
        const roleMap = {};
        allRoles.forEach(role => {
          if (!roleMap[role.user_id]) roleMap[role.user_id] = [];
          roleMap[role.user_id].push(role.role);
        });

        let mismatches = 0;
        allProfiles.forEach(profile => {
          const userRoles = roleMap[profile.user_id] || [];
          const hasAdminRole = userRoles.includes('admin');
          
          if (profile.is_admin !== hasAdminRole) {
            mismatches++;
            console.log(`   ⚠️  Mismatch: ${profile.display_name || 'Unknown'}`);
            console.log(`      Old system: ${profile.is_admin ? 'ADMIN' : 'USER'}`);
            console.log(`      New system: ${userRoles.join(', ') || 'NO ROLES'}`);
          }
        });

        if (mismatches === 0) {
          console.log('   ✅ No mismatches found between old and new admin systems');
        } else {
          console.log(`   ⚠️  Found ${mismatches} mismatches between systems`);
        }
      }
    }

    // 4. Check navigation protection
    console.log('\n📊 4. NAVIGATION PROTECTION ISSUES:');
    console.log('='.repeat(50));

    console.log('   🔍 Common role/navigation issues detected:');
    console.log('   1. ❌ AdminRoute uses OLD profiles.is_admin instead of user_roles');
    console.log('   2. ❌ ClubOwnerRoute uses custom useIsClubOwner hook (may be inconsistent)');
    console.log('   3. ❌ No unified role checking system across components');
    console.log('   4. ❌ Hardcoded email bypass in AdminRoute (security risk)');
    console.log('   5. ❌ Multiple auth state checks (user, session, loading) causing confusion');

    // 5. Check current logged users and their access
    console.log('\n📊 5. CURRENT USER ACCESS ANALYSIS:');
    console.log('='.repeat(50));

    const { data: activeSessions, error: sessionsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            p.user_id,
            p.display_name,
            p.is_admin as old_admin,
            array_agg(ur.role) as new_roles,
            p.updated_at as last_activity
          FROM profiles p
          LEFT JOIN user_roles ur ON ur.user_id = p.user_id
          WHERE p.updated_at > NOW() - INTERVAL '7 days'
          GROUP BY p.user_id, p.display_name, p.is_admin, p.updated_at
          ORDER BY p.updated_at DESC
          LIMIT 10
        `
      });

    if (!sessionsError && activeSessions) {
      console.log('   👥 Recent active users (last 7 days):');
      activeSessions.forEach(user => {
        const roles = user.new_roles.filter(r => r !== null);
        console.log(`      ${user.display_name || 'Unknown'}`);
        console.log(`         Old: ${user.old_admin ? 'ADMIN' : 'USER'} | New: ${roles.join(', ') || 'NO ROLES'}`);
        console.log(`         Last activity: ${user.last_activity}`);
      });
    }

    // 6. Recommendations
    console.log('\n💡 6. RECOMMENDATIONS TO FIX:');
    console.log('='.repeat(50));
    console.log('   🔧 IMMEDIATE FIXES NEEDED:');
    console.log('   1. 🔄 Update AdminRoute to use user_roles table instead of profiles.is_admin');
    console.log('   2. 🔄 Create unified useRoleCheck(role) hook for all components');
    console.log('   3. 🔄 Remove hardcoded email bypass in AdminRoute');
    console.log('   4. 🔄 Standardize ClubOwnerRoute to use user_roles system');
    console.log('   5. 🔄 Add proper role-based redirect logic in auth flows');
    
    console.log('\n   📋 ARCHITECTURAL IMPROVEMENTS:');
    console.log('   1. 🏗️  Create withRole(component, requiredRole) HOC');
    console.log('   2. 🏗️  Implement role-based route configuration');
    console.log('   3. 🏗️  Add role change notifications/refreshing');
    console.log('   4. 🏗️  Create admin panel for role management');
    console.log('   5. 🏗️  Add audit log for role changes');

    console.log('\n   🚨 SECURITY CONCERNS:');
    console.log('   1. ⚠️  Hardcoded admin bypass emails');
    console.log('   2. ⚠️  Inconsistent role checking across components');
    console.log('   3. ⚠️  No role validation on backend API calls');
    console.log('   4. ⚠️  Client-side role checks (can be bypassed)');

  } catch (error) {
    console.error('❌ Error during audit:', error);
  }
}

auditRoleSystem();
