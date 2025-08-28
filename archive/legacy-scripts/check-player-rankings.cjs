const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkPlayerRankingsTable() {
  try {
    console.log('🔍 Checking player_rankings table...\n');

    // 1. Check if table exists and structure
    console.log('1. Checking table structure...');
    const { data: sample, error: sampleError } = await supabase
      .from('player_rankings')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error accessing player_rankings:', sampleError);
      
      // Check if it's actually called something else
      console.log('\n2. Checking for similar tables...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (profiles && profiles.length > 0) {
        console.log('Found profiles table columns:');
        Object.keys(profiles[0]).forEach(col => console.log(`- ${col}`));
      }
      
      return;
    }

    console.log('Table exists. Sample structure:');
    if (sample && sample.length > 0) {
      Object.keys(sample[0]).forEach(col => console.log(`- ${col}`));
    }

    // 2. Check current SPA values for our test users
    console.log('\n2. Checking SPA values for test users...');
    
    const testUsers = [
      '318fbe86-22c7-4d74-bca5-865661a6284f',
      '7903702f-dfed-40e0-9b4a-ebbf7d447b70', 
      '21c71eb2-3a42-4589-9089-24a9340a0e6a'
    ];

    for (const userId of testUsers) {
      const { data: ranking, error: rankingError } = await supabase
        .from('player_rankings')
        .select('spa_points, user_id')
        .eq('user_id', userId);

      if (rankingError) {
        console.error(`Error for ${userId}:`, rankingError);
      } else {
        console.log(`User ${userId}: ${ranking.length} records, SPA: ${ranking[0]?.spa_points || 'N/A'}`);
      }
    }

    // 3. Try direct update to check permissions
    console.log('\n3. Testing direct update permissions...');
    
    const { error: updateError } = await supabase
      .from('player_rankings')
      .update({ spa_points: 1 })
      .eq('user_id', '00000000-0000-0000-0000-000000000000'); // Dummy ID

    if (updateError) {
      console.log('Direct update error:', updateError.message);
      
      // Maybe we need to use RPC function
      console.log('\n4. Trying RPC approach...');
      
      // Check if there's an existing function to update SPA
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('update_spa_points', {
          p_user_id: testUsers[0],
          p_points: 150
        });
        
        if (rpcError) {
          console.log('RPC error:', rpcError.message);
        } else {
          console.log('✅ RPC success:', rpcResult);
        }
      } catch (error) {
        console.log('RPC not available');
      }
    } else {
      console.log('✅ Direct update permission OK');
    }

    // 4. Check what table the frontend actually reads from
    console.log('\n5. Alternative: Check if SPA is in profiles table...');
    for (const userId of testUsers.slice(0, 1)) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spa_points, display_name')
        .eq('user_id', userId)
        .single();

      if (!profileError) {
        console.log(`Profile SPA for ${profile.display_name}: ${profile.spa_points}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking player_rankings:', error);
  }
}

// Run the check
checkPlayerRankingsTable();
