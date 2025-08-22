const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use SERVICE ROLE key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTableRelationships() {
  try {
    console.log('🔍 Checking club_registrations table structure...');
    
    // Check foreign keys
    const { data: foreignKeys, error: fkError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        table_name,
        constraint_type
      `)
      .eq('table_schema', 'public')
      .eq('table_name', 'club_registrations')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (fkError) {
      console.error('❌ Error fetching foreign keys:', fkError);
    } else {
      console.log('🔗 Foreign keys in club_registrations:', foreignKeys);
    }
    
    // Check columns in club_registrations
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select(`
        column_name,
        data_type,
        is_nullable
      `)
      .eq('table_schema', 'public')
      .eq('table_name', 'club_registrations');
    
    if (colError) {
      console.error('❌ Error fetching columns:', colError);
    } else {
      console.log('📋 Columns in club_registrations:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // Test simple query first
    console.log('\n🧪 Testing simple club_registrations query...');
    const { data: testRegs, error: testError } = await supabase
      .from('club_registrations')
      .select('*')
      .limit(5);
    
    if (testError) {
      console.error('❌ Simple query error:', testError);
    } else {
      console.log('✅ Simple query works:', testRegs?.length || 0, 'records');
    }
    
    // Test query without join
    console.log('\n🧪 Testing query without relationship...');
    const { data: regsNoJoin, error: noJoinError } = await supabase
      .from('club_registrations')
      .select('id, user_id, club_name, status')
      .limit(3);
    
    if (noJoinError) {
      console.error('❌ No-join query error:', noJoinError);
    } else {
      console.log('✅ No-join query works:', regsNoJoin?.length || 0, 'records');
      
      // Try to get profiles separately for these user_ids
      if (regsNoJoin && regsNoJoin.length > 0) {
        const userIds = regsNoJoin.map(r => r.user_id);
        
        console.log('\n🧪 Testing profiles query for user_ids:', userIds);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, display_name, full_name, phone')
          .in('user_id', userIds);
        
        if (profileError) {
          console.error('❌ Profiles query error:', profileError);
        } else {
          console.log('✅ Profiles query works:', profiles?.length || 0, 'records');
          console.log('Found profiles:', profiles);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableRelationships();
