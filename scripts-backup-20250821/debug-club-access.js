import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function debugClubAccess() {
  console.log('🔍 DEBUG: Club Management Access Issues');
  console.log('=====================================\n');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    // 1. Check current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
      return;
    }
    
    if (!session?.session?.user) {
      console.log('❌ No authenticated user found');
      console.log('💡 Solution: Please login at http://localhost:8000/auth/login');
      return;
    }
    
    const user = session.session.user;
    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email
    });
    
    // 2. Check user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      return;
    }
    
    console.log('👤 User profile:', {
      display_name: profile.display_name,
      role: profile.role,
      created_at: profile.created_at
    });
    
    // 3. Check club ownership
    const { data: clubProfiles, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('user_id', user.id);
      
    if (clubError) {
      console.log('❌ Club profiles error:', clubError.message);
      return;
    }
    
    console.log(`\n🏢 Club profiles found: ${clubProfiles.length}`);
    
    if (clubProfiles.length === 0) {
      console.log('❌ No club profiles found for this user');
      console.log('💡 Solutions:');
      console.log('   1. Register a new club at: http://localhost:8000/club-registration');
      console.log('   2. Or contact admin to assign club ownership');
      return;
    }
    
    // 4. Check each club profile
    clubProfiles.forEach((club, index) => {
      console.log(`\n🏆 Club ${index + 1}:`, {
        id: club.id,
        name: club.club_name,
        verification_status: club.verification_status,
        user_id: club.user_id
      });
    });
    
    // 5. Check if user has club_owner role
    const hasClubOwnerRole = profile.role && profile.role.includes('club_owner');
    const hasApprovedClub = clubProfiles.some(club => club.verification_status === 'approved');
    
    console.log('\n📋 Access Analysis:');
    console.log(`   Has club_owner role: ${hasClubOwnerRole ? '✅' : '❌'}`);
    console.log(`   Has approved club: ${hasApprovedClub ? '✅' : '❌'}`);
    console.log(`   Can access /club-management: ${hasClubOwnerRole && hasApprovedClub ? '✅' : '❌'}`);
    
    if (!hasClubOwnerRole) {
      console.log('\n💡 To fix missing club_owner role:');
      console.log('   1. Admin needs to assign role in admin panel');
      console.log('   2. Or complete club registration process');
    }
    
    if (!hasApprovedClub) {
      console.log('\n💡 To fix club approval status:');
      console.log('   1. Admin needs to approve your club registration');
      console.log('   2. Check admin panel at /admin/clubs');
    }
    
    // 6. Check club registrations if no approved clubs
    if (!hasApprovedClub) {
      const { data: registrations, error: regError } = await supabase
        .from('club_registrations')
        .select('*')
        .eq('user_id', user.id);
        
      if (!regError && registrations.length > 0) {
        console.log('\n📝 Found club registrations:');
        registrations.forEach((reg, index) => {
          console.log(`   ${index + 1}. ${reg.club_name} - Status: ${reg.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
}

debugClubAccess();
