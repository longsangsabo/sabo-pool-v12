import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTournamentMatchesSchema() {
  console.log('🔍 Checking tournament_matches schema...\n');
  
  try {
    // Try to get one row to see what columns exist
    const { data: sample, error: sampleError } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.error('❌ Sample error:', sampleError);
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('📋 Available columns in tournament_matches:');
      Object.keys(sample[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof sample[0][key]} = ${sample[0][key]}`);
      });
    } else {
      console.log('⚠️ No sample data found');
      
      // Try to insert a test match to see what columns are required
      console.log('\n🧪 Testing column structure...');
      
      // Try different column name variations
      const testColumns = [
        'score_player1', 'score_player2',
        'player1_score', 'player2_score', 
        'player_1_score', 'player_2_score',
        'score1', 'score2'
      ];
      
      for (const col of testColumns) {
        try {
          await supabase.from('tournament_matches').select(col).limit(1);
          console.log(`   ✅ ${col} exists`);
        } catch (err) {
          console.log(`   ❌ ${col} does not exist`);
        }
      }
    }
    
    // Also check what tournaments exist
    console.log('\n🏆 Available tournaments:');
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status')
      .limit(5);
      
    if (tourError) {
      console.error('❌ Tournament error:', tourError);
    } else {
      tournaments.forEach(t => {
        console.log(`   - ${t.name}: ${t.tournament_type} (${t.status})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Schema check error:', error);
  }
}

checkTournamentMatchesSchema();
