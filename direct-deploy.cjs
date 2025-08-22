const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function directDeploy() {
  console.log('🔧 Direct deployment via REST API...\n');
  
  const functionSql = `
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

GRANT EXECUTE ON FUNCTION public.get_user_primary_role(UUID) TO authenticated;
`;

  try {
    const response = await fetch('https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
      },
      body: JSON.stringify({ sql: functionSql })
    });
    
    if (!response.ok) {
      console.log('❌ Response not OK:', response.status, response.statusText);
    } else {
      console.log('✅ Function deployed via REST');
    }
    
  } catch (e) {
    console.log('❌ REST error:', e.message);
  }
  
  // Alternative: Manual test without function
  console.log('🧪 Manual priority test...');
  
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role, created_at')
    .eq('user_id', 'd7d6ce12-490f-4fff-b913-80044de5e169')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.log('❌ Query error:', error.message);
  } else {
    console.log('📋 Raw roles for Anh Long:', roles);
    
    const priorities = {
      'admin': 1,
      'moderator': 2, 
      'club_owner': 3,
      'user': 4
    };
    
    const sortedRoles = roles
      .map(r => ({ ...r, priority: priorities[r.role] || 999 }))
      .sort((a, b) => a.priority - b.priority);
    
    console.log('🎯 Priority sorted:', sortedRoles);
    console.log('✅ Primary role should be:', sortedRoles[0]?.role);
    console.log('📍 Expected redirect: /admin/dashboard');
  }
}

directDeploy().catch(console.error);
