const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function testPrimaryRoleFunction() {
  console.log('🔍 Testing get_user_primary_role function directly...\n');
  
  const userIds = [
    'd7d6ce12-490f-4fff-b913-80044de5e169', // Anh Long
    '94527a17-1dd9-42f9-bcb7-6969329464e2'  // Anh Long Magic
  ];
  
  for (const userId of userIds) {
    console.log(`📋 Testing user: ${userId}`);
    
    // Test 1: Direct function call
    const { data: primaryRole, error: primaryError } = await supabase
      .rpc('get_user_primary_role', { _user_id: userId });
    
    console.log(`   📍 Primary role result:`, primaryRole);
    if (primaryError) console.log(`   ❌ Primary role error:`, primaryError.message);
    
    // Test 2: Check raw roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    console.log(`   📋 Raw roles:`, roles);
    if (rolesError) console.log(`   ❌ Roles error:`, rolesError.message);
    
    // Test 3: Manual priority calculation
    if (roles && roles.length > 0) {
      const priorities = {
        'admin': 1,
        'moderator': 2,
        'club_owner': 3,
        'user': 4
      };
      
      const sortedRoles = roles
        .map(r => ({ ...r, priority: priorities[r.role] || 999 }))
        .sort((a, b) => a.priority - b.priority);
      
      console.log(`   🔧 Manual calculation:`, sortedRoles[0]?.role);
      console.log(`   📊 Role priorities:`, sortedRoles.map(r => `${r.role}(${r.priority})`).join(', '));
    }
    
    console.log('');
  }
  
  // Test 4: Check function definition
  console.log('🔍 Checking function definition...');
  const { data: functionDef, error: defError } = await supabase
    .rpc('sql', { 
      query: `
        SELECT routine_definition 
        FROM information_schema.routines 
        WHERE routine_name = 'get_user_primary_role'
      `
    });
  
  if (defError) {
    console.log('❌ Cannot check function definition:', defError.message);
  } else {
    console.log('📜 Function definition found:', functionDef ? 'YES' : 'NO');
  }
}

testPrimaryRoleFunction().catch(console.error);
