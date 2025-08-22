const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function grantAdminRole() {
  try {
    console.log('🔧 Granting admin role to longsangsabo@gmail.com...');
    
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .eq('email', 'longsangsabo@gmail.com')
      .single();
      
    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return;
    }
    
    console.log('👤 Found user:', {
      user_id: user.user_id,
      email: user.email,
      display_name: user.display_name,
      current_role: user.role
    });
    
    // Update role to admin
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user_id)
      .select();
      
    if (updateError) {
      console.error('❌ Error updating role:', updateError);
      return;
    }
    
    console.log('✅ Successfully granted admin role!');
    console.log('📊 Updated user:', {
      user_id: updatedUser[0].user_id,
      email: updatedUser[0].email,
      display_name: updatedUser[0].display_name,
      new_role: updatedUser[0].role,
      updated_at: updatedUser[0].updated_at
    });
    
    // Verify the change
    const { data: verifiedUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.user_id)
      .single();
      
    if (verifiedUser && verifiedUser.role === 'admin') {
      console.log('✅ Role change verified successfully!');
      console.log('🔐 longsangsabo@gmail.com now has admin privileges');
    } else {
      console.log('⚠️ Role change verification failed');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

grantAdminRole();
