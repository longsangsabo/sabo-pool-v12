const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSabo32Schema() {
  console.log('🔍 CHECKING SABO32_MATCHES SCHEMA\n');
  
  try {
    // Get table schema using a different approach
    const { data: tableInfo, error: tableError } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError);
      return;
    }
    
    if (tableInfo.length === 0) {
      console.log('❌ No data in table to analyze schema');
      return;
    }
    
    console.log('📋 Current sabo32_matches columns:');
    Object.keys(tableInfo[0]).forEach(col => {
      const value = tableInfo[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`   ${col}: ${type} (value: ${value})`);
    });
    
    // Check which columns are missing
    const requiredColumns = [
      'id', 'tournament_id', 'bracket_type', 'round_number', 'match_number',
      'sabo_match_id', 'player1_id', 'player2_id', 'winner_id', 'loser_id',
      'score_player1', 'score_player2', 'status', 'group_id', 
      'advances_to_match_id', 'feeds_loser_to_match_id', 'qualifies_as'
    ];
    
    const existingColumns = Object.keys(tableInfo[0]);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    console.log('\n🔍 Missing columns analysis:');
    if (missingColumns.length === 0) {
      console.log('✅ All required columns exist');
    } else {
      console.log('❌ Missing columns:');
      missingColumns.forEach(col => {
        console.log(`   - ${col}`);
      });
    }
    
    // Show sample data
    console.log('\n📊 Sample data:');
    const { data: sample, error: sampleError } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Sample data failed:', sampleError);
    } else if (sample.length > 0) {
      console.log('   Sample match structure:');
      Object.keys(sample[0]).forEach(key => {
        console.log(`     ${key}: ${sample[0][key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSabo32Schema().catch(console.error);
