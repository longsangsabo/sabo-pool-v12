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

async function grantClubOwnerRole() {
  try {
    const email = 'sabobida2025@gmail.com';
    const userId = '18f49e79-f402-46d1-90be-889006e9761c';
    
    console.log('🔧 Granting club_owner role to:', email);
    
    // 1. Update profiles table
    console.log('📝 Updating profiles.role...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'club_owner',
        active_role: 'club_owner',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (profileError) {
      console.log('⚠️ Profile update error (might be constraint):', profileError.message);
    } else {
      console.log('✅ Profile role updated to club_owner');
    }
    
    // 2. Add to user_roles table
    console.log('📝 Adding to user_roles table...');
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: 'club_owner',
        created_at: new Date().toISOString()
      });
    
    if (roleError) {
      console.log('⚠️ User roles error:', roleError.message);
    } else {
      console.log('✅ Added club_owner to user_roles table');
    }
    
    // 3. Verify the changes
    console.log('\n🔍 Verifying changes...');
    
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('user_id, role, active_role')
      .eq('user_id', userId)
      .single();
    
    const { data: updatedRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    console.log('Updated Profile:', updatedProfile);
    console.log('Updated Roles:', updatedRoles?.map(r => r.role));
    
    console.log('\n🎉 User should now be able to access club dashboard!');
    console.log('🔗 Test URL: http://localhost:8000/club-management');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

grantClubOwnerRole();
