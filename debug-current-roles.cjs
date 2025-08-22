const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase with correct project
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserRoles() {
  try {
    console.log('🔍 Checking all user roles and profiles...\n');
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .order('email');
      
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log('📊 PROFILES TABLE:');
      profiles.forEach(profile => {
        console.log(`  📧 ${profile.email} | Role: ${profile.role || 'none'} | Name: ${profile.display_name || 'N/A'}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Check user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id, 
        role, 
        created_at,
        profiles(email, display_name)
      `)
      .order('created_at', { ascending: false });
      
    if (rolesError) {
      console.error('❌ Error fetching user_roles:', rolesError);
    } else {
      console.log('🎭 USER_ROLES TABLE:');
      userRoles.forEach(userRole => {
        const email = userRole.profiles?.email || 'Unknown';
        const name = userRole.profiles?.display_name || 'N/A';
        console.log(`  👤 ${email} | Role: ${userRole.role} | Added: ${userRole.created_at}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Check specific admin emails
    const adminEmails = [
      'longsangsabo@gmail.com',
      'sabomedia30@gmail.com', 
      'sabomedia23@gmail.com'
    ];
    
    console.log('🔍 CHECKING ADMIN EMAILS:');
    for (const email of adminEmails) {
      // Check in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, email, role')
        .eq('email', email)
        .single();
        
      if (profile) {
        console.log(`  📧 ${email} found in profiles - Role: ${profile.role || 'none'}`);
        
        // Check in user_roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.user_id);
          
        const rolesList = roles?.map(r => r.role).join(', ') || 'none';
        console.log(`  🎭 ${email} roles in user_roles: ${rolesList}`);
      } else {
        console.log(`  ❌ ${email} NOT FOUND in profiles`);
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkUserRoles();
