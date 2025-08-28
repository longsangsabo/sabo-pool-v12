const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkValidRoles() {
  try {
    console.log('🔍 Checking valid role values...');
    
    // Get unique role values from existing users
    const { data: roles, error } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null);
      
    if (error) {
      console.error('❌ Error getting roles:', error);
      return;
    }
    
    const uniqueRoles = [...new Set(roles.map(r => r.role))];
    console.log('📋 Existing role values in database:', uniqueRoles);
    
    // Try different potential admin role values
    const potentialAdminRoles = ['admin', 'administrator', 'super_admin', 'owner', 'system_admin'];
    
    console.log('\n🧪 Testing potential admin role values...');
    
    for (const roleValue of potentialAdminRoles) {
      console.log(`\n🎯 Testing role: "${roleValue}"`);
      
      try {
        // Try to update a test user (sabomedia28@gmail.com)
        const { data, error } = await supabase
          .from('profiles')
          .update({ role: roleValue })
          .eq('email', 'sabomedia28@gmail.com')
          .select();
          
        if (error) {
          console.log(`❌ "${roleValue}" - Error:`, error.message);
        } else {
          console.log(`✅ "${roleValue}" - SUCCESS! This role value is valid.`);
          
          // Revert the change
          await supabase
            .from('profiles')
            .update({ role: 'player' })
            .eq('email', 'sabomedia28@gmail.com');
            
          console.log('🔄 Reverted role back to "player"');
          break; // Found valid admin role
        }
      } catch (err) {
        console.log(`❌ "${roleValue}" - Exception:`, err.message);
      }
    }
    
    // Check if there's a specific enum type for roles
    console.log('\n🔍 Checking for role enum types...');
    const { data: enumData, error: enumError } = await supabase.rpc(
      'get_enum_values', 
      { enum_name: 'user_role' }
    );
    
    if (enumError) {
      console.log('📝 No user_role enum found or error:', enumError.message);
    } else {
      console.log('📋 Enum values for user_role:', enumData);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkValidRoles();
