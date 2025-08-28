const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function immediateAdminGrant() {
  try {
    console.log('👑 Immediate admin grant for target admin emails...');
    
    // Find user by email in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Cannot access auth.users:', authError);
      return;
    }
    
    const targetEmails = [
      'longsangsabo@gmail.com',
      'sabomedia30@gmail.com', 
      'sabomedia23@gmail.com'
    ];
    
    let targetUser = null;
    let targetEmail = null;
    
    for (const email of targetEmails) {
      targetUser = authUsers.users.find(u => u.email === email);
      if (targetUser) {
        targetEmail = email;
        break;
      }
    }
    
    if (!targetUser) {
      console.log('❌ None of the target emails found');
      console.log('📋 Available users:');
      authUsers.users.forEach(u => {
        console.log(`   - ${u.email || 'No email'}`);
      });
      return;
    }
    
    console.log('✅ Found user:', {
      id: targetUser.id,
      email: targetEmail,
      created_at: targetUser.created_at
    });
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, role, display_name')
      .eq('user_id', targetUser.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
      return;
    }
    
    if (!profile) {
      console.log('📝 Creating profile with admin role...');
      
      // Create profile with admin role
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: targetUser.id,
          email: targetEmail,
          role: 'admin',
          display_name: 'Admin User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (createError) {
        console.error('❌ Error creating profile:', createError);
      } else {
        console.log('✅ Profile created with admin role:', newProfile[0]);
      }
    } else {
      console.log('📝 Updating existing profile to admin...');
      
      // Update existing profile to admin
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUser.id)
        .select();
        
      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
      } else {
        console.log('✅ Profile updated to admin role:', updatedProfile[0]);
      }
    }
    
    // Try to add to user_roles table (if it exists)
    console.log('📝 Adding to user_roles table...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: targetUser.id,
        role: 'admin',
        created_at: new Date().toISOString()
      })
      .select();
      
    if (roleError) {
      console.log('⚠️ user_roles table operation:', roleError.message);
    } else {
      console.log('✅ Admin role added to user_roles table:', roleData);
    }
    
    // Verify final result
    console.log('\n🔍 Verification:');
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('user_id', targetUser.id)
      .single();
      
    if (finalProfile) {
      console.log(`✅ Profile role: ${finalProfile.role}`);
      console.log(`👤 Display name: ${finalProfile.display_name}`);
    }
    
    const { data: finalRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUser.id);
      
    if (finalRoles) {
      console.log(`🏷️ User roles: ${finalRoles.map(r => r.role).join(', ')}`);
    }
    
    console.log('\n🎉 Admin grant completed! User can now access admin features.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

immediateAdminGrant();
