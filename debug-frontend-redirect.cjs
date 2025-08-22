// Debug frontend admin redirect issue
// This simulates what happens in the frontend

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

const getRoleBasedRedirect = (primaryRole, intendedPath) => {
  // If user had an intended destination, respect it
  if (intendedPath && intendedPath !== '/auth/login' && intendedPath !== '/auth/register') {
    return intendedPath;
  }

  // Role-based default redirects
  switch (primaryRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'moderator':
      return '/admin/dashboard'; // Moderators also go to admin area
    case 'club_owner':
      return '/club-management';
    case 'user':
    default:
      return '/dashboard';
  }
};

async function debugFrontendFlow() {
  console.log('🔍 Frontend Admin Redirect Debug');
  console.log('====================================\n');

  // Simulate login flow for Anh Long
  const userId = 'd7d6ce12-490f-4fff-b913-80044de5e169';
  
  console.log('👤 Testing user: Anh Long');
  console.log('🆔 User ID:', userId);
  console.log('');

  try {
    // Step 1: Get user roles (what useRoles hook does)
    console.log('📋 Step 1: Fetching user roles...');
    const { data: roles, error: rolesError } = await supabase
      .rpc('get_user_roles', { _user_id: userId });

    const { data: primaryRole, error: primaryError } = await supabase
      .rpc('get_user_primary_role', { _user_id: userId });

    if (rolesError || primaryError) {
      console.log('❌ Error:', rolesError || primaryError);
      console.log('🔄 Falling back to profile check...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.log('❌ Profile fallback failed:', profileError.message);
        return;
      } else {
        console.log('✅ Profile fallback result:', profile);
        const fallbackPrimaryRole = profile.is_admin ? 'admin' : 'user';
        console.log('🎯 Fallback primary role:', fallbackPrimaryRole);
        console.log('📍 Fallback redirect:', getRoleBasedRedirect(fallbackPrimaryRole));
      }
    } else {
      console.log('✅ Roles:', roles);
      console.log('✅ Primary role:', primaryRole);
      
      // Step 2: Calculate role flags (like useRoles hook)
      console.log('');
      console.log('📊 Step 2: Role calculations...');
      const userRoles = roles || [];
      const roleData = {
        roles: userRoles,
        primaryRole: primaryRole || 'user',
        isAdmin: userRoles.includes('admin'),
        isClubOwner: userRoles.includes('club_owner'),
        isModerator: userRoles.includes('moderator'),
      };
      
      console.log('🏷️  Role data:', roleData);
      
      // Step 3: Test redirect logic
      console.log('');
      console.log('📍 Step 3: Redirect logic...');
      const redirectPath = getRoleBasedRedirect(roleData.primaryRole);
      console.log('🎯 Primary role:', roleData.primaryRole);
      console.log('📍 Redirect path:', redirectPath);
      
      // Step 4: Test specific scenarios
      console.log('');
      console.log('🧪 Step 4: Testing specific scenarios...');
      console.log('   - Admin role redirect:', getRoleBasedRedirect('admin'));
      console.log('   - Club owner role redirect:', getRoleBasedRedirect('club_owner'));
      console.log('   - Multiple roles (admin + club_owner), primary=admin:', getRoleBasedRedirect('admin'));
      console.log('   - Multiple roles (admin + club_owner), primary=club_owner:', getRoleBasedRedirect('club_owner'));
      
      // Step 5: Check what admin route protection uses
      console.log('');
      console.log('🛡️  Step 5: Admin route protection check...');
      console.log('   - isAdmin flag:', roleData.isAdmin);
      console.log('   - Should allow /admin/dashboard:', roleData.isAdmin ? 'YES' : 'NO');
      console.log('   - Should allow /club-management:', roleData.isClubOwner ? 'YES' : 'NO');
    }

  } catch (error) {
    console.log('❌ Debug error:', error.message);
  }
}

debugFrontendFlow().catch(console.error);
