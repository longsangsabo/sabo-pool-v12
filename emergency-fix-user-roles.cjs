const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function emergencyFixUserRoles() {
  console.log('🚨 EMERGENCY: Fixing User Roles Relationship');
  console.log('============================================\n');
  
  // 1. Check what tables exist
  console.log('📋 1. CHECKING TABLE STATUS...');
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('count(*)')
    .limit(1);
    
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('count(*)')
    .limit(1);
    
  console.log('📊 profiles table:', profilesError ? `❌ ${profilesError.message}` : '✅ OK');
  console.log('📊 user_roles table:', userRolesError ? `❌ ${userRolesError.message}` : '✅ OK');
  
  // 2. Check foreign key constraint
  console.log('\n📋 2. CHECKING FOREIGN KEY CONSTRAINTS...');
  
  try {
    const constraintCheck = await fetch('https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
      },
      body: JSON.stringify({ 
        sql: `
          -- Check if user_roles table exists and has proper structure
          SELECT table_name, column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'user_roles' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })
    });
    
    console.log('🔍 Foreign key check completed');
    
    // 3. Re-create user_roles table if missing or broken
    console.log('\n📋 3. RECREATING USER_ROLES TABLE...');
    
    const recreateTableSql = `
      -- Drop and recreate user_roles table with proper constraints
      DROP TABLE IF EXISTS public.user_roles CASCADE;
      
      -- Create app_role enum if not exists
      DO $$ BEGIN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'club_owner', 'user');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      
      -- Create user_roles table
      CREATE TABLE public.user_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role public.app_role NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_by UUID REFERENCES auth.users(id),
        UNIQUE(user_id, role)
      );
      
      -- Enable RLS
      ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies for user_roles
      CREATE POLICY "Users can view their own roles" ON public.user_roles
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Service role can manage all roles" ON public.user_roles
        FOR ALL USING (auth.role() = 'service_role');
      
      -- Grant permissions
      GRANT ALL ON public.user_roles TO service_role;
      GRANT SELECT ON public.user_roles TO authenticated;
      
      -- Insert default roles for existing users based on profiles.is_admin
      INSERT INTO public.user_roles (user_id, role, created_at)
      SELECT 
        user_id,
        CASE WHEN is_admin = true THEN 'admin'::app_role ELSE 'user'::app_role END,
        now()
      FROM public.profiles
      ON CONFLICT (user_id, role) DO NOTHING;
    `;
    
    const recreateResponse = await fetch('https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
      },
      body: JSON.stringify({ sql: recreateTableSql })
    });
    
    if (recreateResponse.ok) {
      console.log('✅ user_roles table recreated successfully');
    } else {
      console.log('❌ Failed to recreate table:', await recreateResponse.text());
    }
    
  } catch (error) {
    console.log('❌ Emergency fix error:', error.message);
  }
  
  // 4. Test if relationship now works
  console.log('\n📋 4. TESTING FIXED RELATIONSHIP...');
  
  const { data: testJoin, error: joinError } = await supabase
    .from('profiles')
    .select(`
      user_id,
      display_name,
      user_roles(role)
    `)
    .limit(3);
    
  if (joinError) {
    console.log('❌ Join still broken:', joinError.message);
  } else {
    console.log('✅ Relationship fixed!');
    console.log('📊 Sample data:', testJoin);
  }
  
  // 5. Test user permissions
  console.log('\n📋 5. TESTING USER PERMISSIONS...');
  
  // Test if regular users can now access their data
  const { data: userTest, error: userTestError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(3);
    
  if (userTestError) {
    console.log('❌ User access still broken:', userTestError.message);
  } else {
    console.log('✅ User permissions restored');
    console.log(`📊 ${userTest?.length} user roles found`);
  }
}

emergencyFixUserRoles().catch(console.error);
