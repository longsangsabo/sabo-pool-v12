const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use SERVICE ROLE key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkClubRegistrationIssues() {
  try {
    console.log('🔍 Checking club registration issues...\n');
    
    // 1. Check all club registrations
    console.log('📋 All club registrations:');
    const { data: allRegs, error: allError } = await supabase
      .from('club_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching registrations:', allError);
    } else {
      console.log(`Found ${allRegs?.length || 0} registrations:`);
      allRegs?.forEach((reg, index) => {
        console.log(`  ${index + 1}. ${reg.club_name} - Status: ${reg.status} (${reg.user_id})`);
        if (reg.status === 'rejected' && reg.rejection_reason) {
          console.log(`     ❌ Rejection reason: ${reg.rejection_reason}`);
        }
        console.log(`     📅 Created: ${new Date(reg.created_at).toLocaleString()}`);
      });
    }
    
    // 2. Check club profiles
    console.log('\n🏢 Club profiles:');
    const { data: profiles, error: profileError } = await supabase
      .from('club_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('❌ Error fetching club profiles:', profileError);
    } else {
      console.log(`Found ${profiles?.length || 0} club profiles:`);
      profiles?.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.club_name} - Status: ${profile.verification_status} (${profile.user_id})`);
        if (profile.verification_notes) {
          console.log(`     📝 Notes: ${profile.verification_notes}`);
        }
      });
    }
    
    // 3. Check for common validation issues
    console.log('\n🔍 Checking for common validation issues...');
    
    // Check required fields
    const invalidRegs = allRegs?.filter(reg => 
      !reg.club_name || !reg.address || !reg.phone
    );
    
    if (invalidRegs && invalidRegs.length > 0) {
      console.log('❌ Found registrations with missing required fields:');
      invalidRegs.forEach(reg => {
        console.log(`  - ${reg.club_name || 'NO NAME'} (${reg.id})`);
        if (!reg.club_name) console.log('    Missing: club_name');
        if (!reg.address) console.log('    Missing: address');
        if (!reg.phone) console.log('    Missing: phone');
      });
    } else {
      console.log('✅ All registrations have required fields');
    }
    
    // 4. Check user profiles for registrants
    console.log('\n👤 Checking user profiles for registrants...');
    if (allRegs && allRegs.length > 0) {
      const userIds = allRegs.map(r => r.user_id);
      
      const { data: userProfiles, error: userError } = await supabase
        .from('profiles')
        .select('user_id, display_name, full_name, phone, email')
        .in('user_id', userIds);
      
      if (userError) {
        console.error('❌ Error fetching user profiles:', userError);
      } else {
        console.log('User profiles found:');
        userProfiles?.forEach(profile => {
          const registration = allRegs.find(r => r.user_id === profile.user_id);
          console.log(`  - ${profile.display_name || profile.full_name || 'No name'} (${profile.user_id})`);
          console.log(`    Club: ${registration?.club_name || 'No club'} - Status: ${registration?.status || 'No status'}`);
        });
      }
    }
    
    // 5. Check for recent rejections
    console.log('\n❌ Recent rejections:');
    const recentRejections = allRegs?.filter(reg => 
      reg.status === 'rejected' && 
      new Date(reg.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    if (recentRejections && recentRejections.length > 0) {
      recentRejections.forEach(reg => {
        console.log(`  - ${reg.club_name} rejected at ${new Date(reg.updated_at).toLocaleString()}`);
        console.log(`    Reason: ${reg.rejection_reason || 'No reason provided'}`);
        console.log(`    Reviewed by: ${reg.reviewed_by || 'Unknown'}`);
      });
    } else {
      console.log('  No recent rejections found');
    }
    
    // 6. Recommendations
    console.log('\n💡 Recommendations:');
    
    const pendingRegs = allRegs?.filter(r => r.status === 'pending');
    if (pendingRegs && pendingRegs.length > 0) {
      console.log(`  📋 ${pendingRegs.length} registration(s) pending admin approval`);
      console.log('  👨‍💼 Admin should log in to approve/reject pending registrations');
      console.log('  🔗 Admin URL: http://localhost:8080/admin/clubs');
    }
    
    const rejectedRegs = allRegs?.filter(r => r.status === 'rejected');
    if (rejectedRegs && rejectedRegs.length > 0) {
      console.log(`  ❌ ${rejectedRegs.length} registration(s) rejected`);
      console.log('  📝 Users should check rejection reasons and re-register with corrections');
    }
    
    const approvedRegs = allRegs?.filter(r => r.status === 'approved');
    if (approvedRegs && approvedRegs.length > 0) {
      console.log(`  ✅ ${approvedRegs.length} registration(s) approved and active`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkClubRegistrationIssues();
