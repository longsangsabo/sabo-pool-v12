const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserClubAccess() {
  try {
    const email = 'sabobida2025@gmail.com';
    console.log('🔍 Checking club access for:', email);
    
    // 1. Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    console.log('✅ Found user:', user.id, '-', user.email);
    
    // 2. Check profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log('\n👤 User Profile:');
    if (profile) {
      console.log('  Role:', profile.role);
      console.log('  Active Role:', profile.active_role);
      console.log('  Display Name:', profile.display_name);
    } else {
      console.log('  ❌ No profile found');
    }
    
    // 3. Check user_roles table
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('\n🔑 User Roles:');
    if (userRoles && userRoles.length > 0) {
      userRoles.forEach(role => {
        console.log(`  - ${role.role} (created: ${role.created_at})`);
      });
    } else {
      console.log('  ❌ No roles found in user_roles table');
    }
    
    // 4. Check club_profiles (owned clubs)
    const { data: clubProfiles } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('\n🏢 Club Profiles (owned):');
    if (clubProfiles && clubProfiles.length > 0) {
      clubProfiles.forEach(club => {
        console.log(`  - ${club.club_name} (${club.verification_status})`);
        console.log(`    ID: ${club.id}`);
        console.log(`    Created: ${club.created_at}`);
      });
    } else {
      console.log('  ❌ No club profiles found');
    }
    
    // 5. Check club_registrations
    const { data: clubRegs } = await supabase
      .from('club_registrations')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('\n📋 Club Registrations:');
    if (clubRegs && clubRegs.length > 0) {
      clubRegs.forEach(reg => {
        console.log(`  - ${reg.club_name} (${reg.status})`);
        console.log(`    ID: ${reg.id}`);
        console.log(`    Created: ${reg.created_at}`);
      });
    } else {
      console.log('  ❌ No club registrations found');
    }
    
    // 6. Navigation logic analysis
    console.log('\n🧭 Navigation Logic Analysis:');
    
    const hasClubOwnerRole = profile?.role === 'club_owner' || 
                            profile?.role === 'both' ||
                            userRoles?.some(r => r.role === 'club_owner');
                            
    const hasApprovedClub = clubProfiles?.some(c => c.verification_status === 'approved');
    
    console.log('  Has club_owner role:', hasClubOwnerRole ? '✅' : '❌');
    console.log('  Has approved club:', hasApprovedClub ? '✅' : '❌');
    console.log('  Should redirect to club dashboard:', hasClubOwnerRole && hasApprovedClub ? '✅' : '❌');
    
    // 7. Recommendations
    console.log('\n💡 Recommendations:');
    
    if (!hasClubOwnerRole) {
      console.log('  🔧 Fix: Grant club_owner role to user');
      console.log('    - Update profiles.role to "club_owner" or "both"');
      console.log('    - OR add "club_owner" to user_roles table');
    }
    
    if (!hasApprovedClub) {
      console.log('  🔧 Fix: Create or approve club profile');
      console.log('    - Create club_profile with verification_status = "approved"');
      console.log('    - OR approve existing club registration');
    }
    
    if (hasClubOwnerRole && hasApprovedClub) {
      console.log('  ✅ User should be able to access club dashboard');
      console.log('  🔗 URL: http://localhost:8000/club-management');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserClubAccess();
