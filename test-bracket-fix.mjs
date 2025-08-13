import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testBracketGeneration() {
  console.log('🧪 Testing bracket generation fix...');
  
  try {
    // 1. Find a tournament with double_elimination type
    const { data: tournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status')
      .eq('tournament_type', 'double_elimination')
      .limit(1);
    
    if (tournError || !tournaments || tournaments.length === 0) {
      console.log('⚠️ No double elimination tournaments found for testing');
      return;
    }
    
    const testTournament = tournaments[0];
    console.log(`🏆 Testing with tournament: ${testTournament.name} (${testTournament.id})`);
    
    // 2. Check participants
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('user_id, registration_status')
      .eq('tournament_id', testTournament.id);
    
    if (regError) {
      console.log('❌ Error checking registrations:', regError.message);
      return;
    }
    
    const confirmedCount = registrations?.filter(r => r.registration_status === 'confirmed').length || 0;
    console.log(`👥 Found ${confirmedCount} confirmed participants`);
    
    // 3. Test each bracket generation function
    const functionsToTest = [
      'generate_advanced_tournament_bracket',
      'generate_double_elimination_bracket_complete_v8', 
      'generate_double_elimination_bracket_complete',
      'generate_complete_tournament_bracket'
    ];
    
    for (const funcName of functionsToTest) {
      console.log(`\n🔧 Testing ${funcName}...`);
      
      try {
        const { data, error } = await supabase.rpc(funcName, {
          p_tournament_id: testTournament.id
        });
        
        if (error) {
          console.log(`   ❌ ${funcName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${funcName}: Success -`, data);
          break; // Stop on first success
        }
      } catch (e) {
        console.log(`   ❌ ${funcName}: Exception -`, e.message);
      }
    }
    
    console.log('\n🎯 Bracket generation testing completed!');
    console.log('📝 The useBracketGeneration hook should now try multiple functions in fallback order.');
    console.log('🚀 Try generating bracket in the UI to see the improvements!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBracketGeneration();
