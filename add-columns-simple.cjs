const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addColumnsOneByOne() {
  console.log('🔧 ADDING MISSING COLUMNS ONE BY ONE\n');
  
  try {
    // Add loser_id column
    console.log('1️⃣ Adding loser_id column...');
    const { error: loserError } = await serviceSupabase.rpc('exec_sql', {
      sql: 'ALTER TABLE sabo32_matches ADD COLUMN IF NOT EXISTS loser_id UUID;'
    });
    
    if (loserError) {
      console.error('❌ Failed to add loser_id:', loserError);
    } else {
      console.log('✅ loser_id added');
    }
    
    // Add advances_to_match_id column
    console.log('2️⃣ Adding advances_to_match_id column...');
    const { error: advancesError } = await serviceSupabase.rpc('exec_sql', {
      sql: 'ALTER TABLE sabo32_matches ADD COLUMN IF NOT EXISTS advances_to_match_id UUID;'
    });
    
    if (advancesError) {
      console.error('❌ Failed to add advances_to_match_id:', advancesError);
    } else {
      console.log('✅ advances_to_match_id added');
    }
    
    // Add feeds_loser_to_match_id column
    console.log('3️⃣ Adding feeds_loser_to_match_id column...');
    const { error: feedsError } = await serviceSupabase.rpc('exec_sql', {
      sql: 'ALTER TABLE sabo32_matches ADD COLUMN IF NOT EXISTS feeds_loser_to_match_id UUID;'
    });
    
    if (feedsError) {
      console.error('❌ Failed to add feeds_loser_to_match_id:', feedsError);
    } else {
      console.log('✅ feeds_loser_to_match_id added');
    }
    
    // Test the columns
    console.log('4️⃣ Testing columns...');
    const { data: testData, error: testError } = await serviceSupabase
      .from('sabo32_matches')
      .select('id, loser_id, advances_to_match_id, feeds_loser_to_match_id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log('✅ All columns working');
      console.log('   Sample:', testData[0]);
    }
    
    // Update loser_id for completed matches
    console.log('5️⃣ Updating loser_id...');
    const { error: updateError } = await serviceSupabase.rpc('exec_sql', {
      sql: `
      UPDATE sabo32_matches 
      SET loser_id = CASE 
        WHEN winner_id = player1_id THEN player2_id
        WHEN winner_id = player2_id THEN player1_id
        ELSE NULL
      END
      WHERE status = 'completed' 
        AND winner_id IS NOT NULL;
      `
    });
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
    } else {
      console.log('✅ loser_id updated for completed matches');
    }
    
    console.log('\\n🎯 COLUMNS ADDED SUCCESSFULLY');
    console.log('🔄 Frontend should now work correctly');
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
  }
}

addColumnsOneByOne().catch(console.error);
