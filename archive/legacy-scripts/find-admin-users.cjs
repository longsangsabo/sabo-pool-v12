const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findAdminUsers() {
  try {
    console.log('🔍 Searching for users with admin-like names or emails...');
    
    // Search for users with "sabo" or "admin" in their info
    const { data: users, error } = await supabase
      .from('profiles')
      .select('user_id, email, display_name, role, created_at')
      .or('email.ilike.%sabo%,display_name.ilike.%sabo%,email.ilike.%admin%,role.eq.admin')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error searching users:', error);
      return;
    }
    
    console.log(`📋 Found ${users.length} matching users:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Info:`);
      console.log(`   - User ID: ${user.user_id}`);
      console.log(`   - Email: ${user.email || 'N/A'}`);
      console.log(`   - Display Name: ${user.display_name || 'N/A'}`);
      console.log(`   - Role: ${user.role || 'user'}`);
      console.log(`   - Created: ${user.created_at}`);
    });
    
    // Also search for any existing admin users
    console.log('\n🔐 Searching for existing admin users...');
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('user_id, email, display_name, role')
      .eq('role', 'admin');
      
    if (adminError) {
      console.error('❌ Error searching admins:', adminError);
    } else {
      console.log(`📋 Found ${admins.length} admin users:`);
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin:`);
        console.log(`   - Email: ${admin.email || 'N/A'}`);
        console.log(`   - Display Name: ${admin.display_name || 'N/A'}`);
        console.log(`   - User ID: ${admin.user_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error);
  }
}

findAdminUsers();
