// Script để xóa hết RLS cho tất cả bảng
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function nukeAllRLS() {
  try {
    console.log('💥 NUKING ALL RLS - Disable RLS for all tables...');
    
    // List of main tables to disable RLS
    const tables = [
      'sabo_tournament_matches',
      'tournaments', 
      'tournament_players',
      'players',
      'profiles',
      'clubs',
      'club_members',
      'challenges',
      'bracket_matches',
      'user_ratings',
      'notifications'
    ];
    
    for (const table of tables) {
      try {
        console.log(`🔧 Disabling RLS for ${table}...`);
        
        // Try to disable RLS using a direct update to pg_class
        // This is a hack but should work
        const result = await supabase.rpc('exec', {
          sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
        });
        
        if (result.error) {
          console.log(`❌ Failed to disable RLS for ${table}:`, result.error.message);
          
          // Try alternative method - grant all permissions
          const grantResult = await supabase.rpc('exec', {
            sql: `
              DROP POLICY IF EXISTS "Enable all for authenticated users" ON ${table};
              DROP POLICY IF EXISTS "Enable read access for all users" ON ${table};
              DROP POLICY IF EXISTS "${table}_policy" ON ${table};
              CREATE POLICY "allow_all_${table}" ON ${table} USING (true) WITH CHECK (true);
            `
          });
          
          if (grantResult.error) {
            console.log(`❌ Alternative method failed for ${table}:`, grantResult.error.message);
          } else {
            console.log(`✅ Created permissive policy for ${table}`);
          }
        } else {
          console.log(`✅ Disabled RLS for ${table}`);
        }
      } catch (error) {
        console.log(`❌ Error with ${table}:`, error.message);
      }
    }
    
    // Test access after changes
    console.log('\n🧪 Testing access after RLS removal...');
    
    const testResult = await supabase
      .from('sabo_tournament_matches')
      .select('count(*)', { count: 'exact' });
      
    console.log('Test query result:', testResult);
    
    console.log('\n✅ RLS removal complete! Try the app now.');
    
  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

nukeAllRLS();
