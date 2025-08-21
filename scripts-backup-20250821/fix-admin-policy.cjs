const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function addAdminPolicy() {
  console.log('🔧 Adding admin policy for tournament_registrations...');
  
  try {
    // Check existing policies first
    console.log('📋 Checking existing policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, permissive, roles, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'tournament_registrations';
      `
    });
    
    if (!policiesError && policies) {
      console.log('Current policies:', policies);
    }
    
    // Drop existing admin policy if it exists
    console.log('🗑️ Dropping existing admin policy (if any)...');
    await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "admins_manage_all_registrations" ON tournament_registrations;`
    });
    
    // Create new admin policy
    console.log('✨ Creating new admin policy...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "admins_manage_all_registrations" ON tournament_registrations
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.is_admin = true
          )
        );
      `
    });
    
    if (error) {
      console.error('❌ Error creating admin policy:', error);
      return;
    }
    
    console.log('✅ Admin policy created successfully!');
    
    // Verify the policy was created
    const { data: newPolicies } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, permissive, cmd 
        FROM pg_policies 
        WHERE tablename = 'tournament_registrations' 
        AND policyname = 'admins_manage_all_registrations';
      `
    });
    
    if (newPolicies && newPolicies.length > 0) {
      console.log('✅ Policy verified:', newPolicies[0]);
    }
    
    // Test with current admin user
    console.log('🧪 Testing admin access...');
    const testUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169'; // Anh Long
    
    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('user_id, full_name, is_admin')
      .eq('user_id', testUserId)
      .single();
    
    if (adminCheck) {
      console.log('Test user profile:', adminCheck);
      
      if (adminCheck.is_admin) {
        console.log('✅ User is admin - should be able to add registrations now!');
      } else {
        console.log('⚠️ User is not admin - updating admin status...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('user_id', testUserId);
        
        if (!updateError) {
          console.log('✅ User admin status updated!');
        }
      }
    }
    
    console.log('🎉 Policy setup complete! QuickAddUserDialog should work now.');
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

addAdminPolicy();
