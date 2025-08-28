const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase with correct project
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAdminToSabomedia23() {
  const targetEmail = 'sabomedia23@gmail.com';
  
  try {
    console.log(`🔧 Granting admin role to ${targetEmail}...\n`);
    
    // First, check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, role')
      .eq('email', targetEmail)
      .single();
      
    if (profileError) {
      console.log(`❌ User ${targetEmail} not found in profiles table`);
      console.log('Error:', profileError.message);
      return;
    }
    
    console.log(`✅ Found user: ${profile.email} (ID: ${profile.user_id})`);
    console.log(`Current role in profiles: ${profile.role || 'none'}`);
    
    // Try to update profiles.role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', profile.user_id);
      
    if (updateError) {
      console.log(`⚠️ Could not update profiles.role: ${updateError.message}`);
    } else {
      console.log(`✅ Updated profiles.role to admin`);
    }
    
    // Check if role exists in user_roles table
    const { data: userRole, error: userRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();
      
    if (userRoleError && userRoleError.code !== 'PGRST116') {
      console.log(`❌ Error checking user_roles: ${userRoleError.message}`);
      return;
    }
    
    if (userRole) {
      console.log(`✅ User already has role in user_roles: ${userRole.role}`);
      
      // Update existing role
      const { error: updateRoleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', profile.user_id);
        
      if (updateRoleError) {
        console.log(`❌ Error updating user_roles: ${updateRoleError.message}`);
      } else {
        console.log(`✅ Updated user_roles.role to admin`);
      }
    } else {
      // Insert new role
      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.user_id,
          role: 'admin'
        });
        
      if (insertRoleError) {
        console.log(`❌ Error inserting into user_roles: ${insertRoleError.message}`);
      } else {
        console.log(`✅ Added admin role to user_roles table`);
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification:');
    
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('user_id', profile.user_id)
      .single();
      
    const { data: finalUserRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.user_id)
      .single();
      
    console.log(`📊 profiles.role: ${finalProfile?.role || 'none'}`);
    console.log(`📊 user_roles.role: ${finalUserRole?.role || 'none'}`);
    
    console.log('\n🎉 Admin role grant process completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

grantAdminToSabomedia23();
