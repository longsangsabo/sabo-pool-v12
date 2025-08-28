const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function simpleRoleAudit() {
  try {
    console.log('🔍 SIMPLE ROLE & NAVIGATION AUDIT\n');

    // 1. Check user_roles table
    console.log('📊 1. USER_ROLES TABLE:');
    console.log('='.repeat(40));
    
    try {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.log('   ❌ user_roles table does NOT exist or has no access');
        console.log('   📝 This means new role system is NOT implemented yet');
      } else {
        console.log(`   ✅ user_roles table EXISTS with ${userRoles.length} records`);
        
        const roleStats = {};
        userRoles.forEach(role => {
          roleStats[role.role] = (roleStats[role.role] || 0) + 1;
        });

        console.log('   📊 Role distribution:');
        Object.entries(roleStats).forEach(([role, count]) => {
          console.log(`      - ${role}: ${count} users`);
        });

        console.log('\n   👑 Admin users:');
        const admins = userRoles.filter(r => r.role === 'admin');
        for (const admin of admins) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', admin.user_id)
            .single();
          
          console.log(`      - ${profile?.display_name || 'Unknown'} (${admin.user_id.slice(0, 8)}...)`);
        }
      }
    } catch (err) {
      console.log('   ❌ user_roles table access failed:', err.message);
    }

    // 2. Check old profiles admin system
    console.log('\n📊 2. OLD PROFILES ADMIN SYSTEM:');
    console.log('='.repeat(40));

    try {
      const { data: oldAdmins, error: oldAdminsError } = await supabase
        .from('profiles')
        .select('user_id, display_name, is_admin')
        .eq('is_admin', true);

      if (oldAdminsError) {
        console.log('   ❌ Cannot check profiles.is_admin:', oldAdminsError.message);
      } else {
        console.log(`   ✅ Old admin system: ${oldAdmins.length} admins`);
        oldAdmins.forEach(admin => {
          console.log(`      - ${admin.display_name || 'Unknown'} (${admin.user_id.slice(0, 8)}...)`);
        });
      }
    } catch (err) {
      console.log('   ❌ profiles table access failed:', err.message);
    }

    // 3. Check current auth issues
    console.log('\n🚨 3. IDENTIFIED ISSUES:');
    console.log('='.repeat(40));
    
    console.log('   ❌ CRITICAL ISSUES FOUND:');
    console.log('   1. AdminRoute.tsx uses OLD profiles.is_admin field');
    console.log('   2. Hardcoded email bypass in AdminRoute (security risk)');
    console.log('   3. useAdminCheck hook queries profiles.is_admin (outdated)');
    console.log('   4. No unified role system across the platform');
    console.log('   5. ClubOwnerRoute uses separate useIsClubOwner logic');

    console.log('\n   📱 NAVIGATION PROBLEMS:');
    console.log('   1. Role-based routing is inconsistent');
    console.log('   2. No smart redirect after login based on user role');
    console.log('   3. Admin routes accessible with hardcoded emails');
    console.log('   4. Club owner detection may be unreliable');

    // 4. Check some real users for testing
    console.log('\n📊 4. SAMPLE USER CHECK:');
    console.log('='.repeat(40));

    const testEmails = [
      'longsangsabo@gmail.com',
      'longsang063@gmail.com'
    ];

    for (const email of testEmails) {
      console.log(`\n   👤 Testing: ${email}`);
      
      // Get user from auth.users (if accessible)
      try {
        const { data: authUser } = await supabase.auth.admin.listUsers();
        const user = authUser.users.find(u => u.email === email);
        
        if (user) {
          console.log(`      🔐 Auth user ID: ${user.id.slice(0, 8)}...`);
          
          // Check profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, display_name')
            .eq('user_id', user.id)
            .single();
            
          console.log(`      👤 Profile: ${profile?.display_name || 'No profile'}`);
          console.log(`      👑 Old admin: ${profile?.is_admin || false}`);
          
          // Check new roles (if table exists)
          try {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id);
              
            console.log(`      🏷️  New roles: ${roles?.map(r => r.role).join(', ') || 'None'}`);
          } catch {
            console.log(`      🏷️  New roles: Table not accessible`);
          }
        } else {
          console.log(`      ❌ User not found in auth.users`);
        }
      } catch (err) {
        console.log(`      ❌ Cannot access auth.users: ${err.message}`);
      }
    }

    // 5. Action items
    console.log('\n💡 5. IMMEDIATE ACTION REQUIRED:');
    console.log('='.repeat(40));
    
    console.log('   🔧 URGENT FIXES:');
    console.log('   1. Update useAdminCheck to use user_roles table');
    console.log('   2. Remove hardcoded email bypass in AdminRoute');
    console.log('   3. Create unified useRole(role) hook');
    console.log('   4. Migrate all admin checks to new system');
    
    console.log('\n   📋 RECOMMENDED ARCHITECTURE:');
    console.log('   1. Create useRoles() hook returning user roles array');
    console.log('   2. Create hasRole(user, role) utility function');
    console.log('   3. Update all route guards to use new system');
    console.log('   4. Add role-based default redirects after login');
    console.log('   5. Create admin panel for role management');

    console.log('\n   ⚠️  SECURITY NOTES:');
    console.log('   1. Remove email-based admin access immediately');
    console.log('   2. Ensure all admin API calls validate roles server-side');
    console.log('   3. Add audit logging for admin actions');
    console.log('   4. Implement role refresh on permission changes');

  } catch (error) {
    console.error('❌ Audit failed:', error);
  }
}

simpleRoleAudit();
