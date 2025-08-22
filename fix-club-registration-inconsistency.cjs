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

async function fixClubRegistrationInconsistency() {
  try {
    console.log('🔧 Fixing club registration inconsistency...\n');
    
    const userId = '18f49e79-f402-46d1-90be-889006e9761c';
    
    // Check current state
    console.log('📋 Current club_registrations:');
    const { data: regs } = await supabase
      .from('club_registrations')
      .select('*')
      .eq('user_id', userId);
    
    console.log('🏢 Current club_profiles:');
    const { data: profiles } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('user_id', userId);
    
    regs?.forEach(reg => {
      console.log(`  Registration: ${reg.club_name} - ${reg.status} (${reg.id})`);
    });
    
    profiles?.forEach(profile => {
      console.log(`  Profile: ${profile.club_name} - ${profile.verification_status} (${profile.id})`);
    });
    
    // Option 1: Update club_profiles to match approved registration
    if (regs && regs.length > 0 && profiles && profiles.length > 0) {
      const approvedReg = regs.find(r => r.status === 'approved');
      const pendingProfile = profiles.find(p => p.verification_status === 'pending');
      
      if (approvedReg && pendingProfile) {
        console.log('\n🔄 Updating club_profiles to match approved registration...');
        
        const { error: updateError } = await supabase
          .from('club_profiles')
          .update({
            club_name: approvedReg.club_name,
            verification_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', pendingProfile.id);
        
        if (updateError) {
          console.error('❌ Error updating club_profiles:', updateError);
        } else {
          console.log('✅ Successfully updated club_profiles to approved status');
        }
      }
    }
    
    // Option 2: Create new club_profile from approved registration if none exists
    if (regs && regs.length > 0 && (!profiles || profiles.length === 0)) {
      const approvedReg = regs.find(r => r.status === 'approved');
      
      if (approvedReg) {
        console.log('\n➕ Creating club_profile from approved registration...');
        
        const { error: createError } = await supabase
          .from('club_profiles')
          .insert({
            user_id: approvedReg.user_id,
            club_name: approvedReg.club_name,
            address: approvedReg.address,
            phone: approvedReg.phone,
            verification_status: 'approved',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (createError) {
          console.error('❌ Error creating club_profile:', createError);
        } else {
          console.log('✅ Successfully created approved club_profile');
        }
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: finalProfiles } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('user_id', userId);
    
    finalProfiles?.forEach(profile => {
      console.log(`  ✅ Final Profile: ${profile.club_name} - ${profile.verification_status}`);
    });
    
    console.log('\n💡 User should now see approved club status in the app!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixClubRegistrationInconsistency();
