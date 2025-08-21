const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL');
const serviceKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTableSchema() {
  try {
    console.log('🔍 Checking tournament_matches table schema...');
    
    // Get sample data to see columns
    const { data: testData, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    if (testData && testData.length > 0) {
      const availableColumns = Object.keys(testData[0]);
      console.log('✅ Available columns:');
      console.log(availableColumns.join(', '));
      
      console.log('\n🎯 Column check:');
      const expectedColumns = [
        'id', 'tournament_id', 'round_number', 'match_number',
        'player1_id', 'player2_id', 'winner_id', 'status',
        'player1_score', 'player2_score', 'bracket_type',
        'score_input_by', 'score_submitted_at', 'completed_at', 'updated_at'
      ];
      
      expectedColumns.forEach(col => {
        const exists = availableColumns.includes(col);
        console.log(`  ${exists ? '✅' : '❌'} ${col}`);
      });
      
      console.log('\n📋 Sample record:');
      console.log(testData[0]);
    } else {
      console.log('❌ No data found in tournament_matches table');
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
}

checkTableSchema();
