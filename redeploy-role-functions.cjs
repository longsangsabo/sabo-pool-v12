const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function redeployRoleFunctions() {
  console.log('🔧 Re-deploying role functions...\n');
  
  try {
    // Just deploy the core functions we need
    const roleFunctionsSql = `
-- Role functions for unified system
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    roles_result JSON;
BEGIN
    SELECT COALESCE(
        json_agg(role ORDER BY created_at),
        '[]'::json
    ) INTO roles_result
    FROM user_roles 
    WHERE user_id = _user_id;
    
    RETURN roles_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id AND role = _role
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE plpgsql
AS $$
DECLARE
    primary_role app_role;
BEGIN
    SELECT role INTO primary_role
    FROM user_roles 
    WHERE user_id = _user_id
    ORDER BY 
        CASE role
            WHEN 'admin' THEN 1
            WHEN 'moderator' THEN 2
            WHEN 'club_owner' THEN 3
            WHEN 'user' THEN 4
            ELSE 999
        END ASC,
        created_at ASC
    LIMIT 1;
    
    RETURN primary_role;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(UUID) TO authenticated;
`;
    
    console.log('📤 Deploying role functions...');
    const { data, error } = await supabase.rpc('sql', { query: roleFunctionsSql });
    
    if (error) {
      console.log('❌ Deploy error:', error.message);
      return;
    }
    
    console.log('✅ Role functions deployed successfully\n');
    
    // Test the function
    console.log('🧪 Testing get_user_primary_role...');
    const { data: testResult, error: testError } = await supabase
      .rpc('get_user_primary_role', { _user_id: 'd7d6ce12-490f-4fff-b913-80044de5e169' });
    
    if (testError) {
      console.log('❌ Test error:', testError.message);
    } else {
      console.log('✅ Test result:', testResult);
      console.log('🎯 Expected: admin (should be admin for Anh Long)\n');
    }
    
    // Test with another user
    console.log('🧪 Testing with Anh Long Magic...');
    const { data: testResult2, error: testError2 } = await supabase
      .rpc('get_user_primary_role', { _user_id: '94527a17-1dd9-42f9-bcb7-6969329464e2' });
    
    if (testError2) {
      console.log('❌ Test error:', testError2.message);
    } else {
      console.log('✅ Test result:', testResult2);
      console.log('🎯 Expected: admin (should be admin for Anh Long Magic)');
    }
    
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

redeployRoleFunctions().catch(console.error);
