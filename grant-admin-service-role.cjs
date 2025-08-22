const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use SERVICE ROLE key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('URL:', supabaseUrl);
  console.log('Service Role Key:', serviceRoleKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function grantAdminRole() {
  const email = 'sabomedia23@gmail.com';
  
  try {
    console.log('🔍 Looking for user with email:', email);
    
    // First, find the user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('📋 Available users:');
      users.users.forEach(u => console.log(`  - ${u.email} (${u.id})`));
      return;
    }
    
    console.log('✅ Found user:', user.id, '-', user.email);
    
    // Update user role in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select();
    
    if (profileError) {
      console.log('⚠️ Profile update error (might be constraint):', profileError.message);
    } else {
      console.log('✅ Profile updated:', profileData);
    }
    
    // Check if user_roles table exists and add role there
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: user.id, 
        role: 'admin',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (userRoleError) {
      console.log('⚠️ User roles table error:', userRoleError.message);
      
      // Try to create the table if it doesn't exist
      console.log('🔧 Checking available tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (!tablesError) {
        console.log('📋 Available tables:', tables.map(t => t.table_name));
      }
    } else {
      console.log('✅ User role updated:', userRoleData);
    }
    
    // Verify the changes
    console.log('\n🔍 Verifying admin status...');
    
    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single();
    
    if (verifyError) {
      console.log('❌ Verification error:', verifyError);
    } else {
      console.log('✅ Current profile:', profile);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

grantAdminRole();
