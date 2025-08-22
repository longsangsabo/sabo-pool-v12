const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('📋 Checking available tables...');
    
    // Check what tables we can access
    const { data: rankings, error: rankError } = await supabase
      .from('player_rankings')
      .select('user_id, user_name, current_rank, verified_rank')
      .limit(1);
      
    console.log('player_rankings access:', rankError ? 'ERROR' : 'OK');
    if (rankError) console.log('Error:', rankError);
    
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('user_id, display_name, current_rank')
      .limit(1);
      
    console.log('profiles access:', profError ? 'ERROR' : 'OK');
    if (profError) console.log('Error:', profError);
    
    // Test update with minimal data
    if (rankings && rankings.length > 0) {
      const testUserId = rankings[0].user_id;
      console.log(`\n🧪 Testing update on user: ${testUserId}`);
      
      // Try updating just one field
      const { data, error } = await supabase
        .from('player_rankings')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', testUserId)
        .select();
        
      console.log('Update test result:', error ? 'FAILED' : 'SUCCESS');
      if (error) {
        console.log('Error details:', error);
      } else {
        console.log('Updated data:', data);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

listTables();
