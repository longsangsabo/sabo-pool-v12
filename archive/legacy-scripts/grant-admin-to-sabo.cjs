const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function grantAdminToSaboAccounts() {
  try {
    console.log('🔧 Granting admin role to SABO accounts...');
    
    // Target emails for admin role
    const targetEmails = [
      'sabomedia23@gmail.com', // SABO ARENA
      'sabomedia28@gmail.com'  // Sabo
    ];
    
    for (const email of targetEmails) {
      console.log(`\n🎯 Processing ${email}...`);
      
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name, role')
        .eq('email', email)
        .single();
        
      if (userError || !user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      
      console.log('👤 Found user:', {
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
        continue;
      }
      
      console.log('✅ Successfully granted admin role!');
      console.log('📊 Updated user:', {
        email: updatedUser[0].email,
        display_name: updatedUser[0].display_name,
        new_role: updatedUser[0].role
      });
    }
    
    // Verify admin users
    console.log('\n🔐 Verifying admin users...');
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, display_name, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
      
    if (adminError) {
      console.error('❌ Error verifying admins:', adminError);
    } else {
      console.log(`📋 Total admin users: ${admins.length}`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email} (${admin.display_name}) - ${admin.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

grantAdminToSaboAccounts();
