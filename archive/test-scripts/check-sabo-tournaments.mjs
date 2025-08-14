import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSABOTournaments() {
  console.log('🔍 Checking SABO tournaments...\n');
  
  try {
    // 1. Check recent tournaments
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (tourError) {
      console.error('❌ Error fetching tournaments:', tourError);
      return;
    }
    
    console.log('📋 Recent tournaments:');
    tournaments.forEach(t => {
      console.log(`   - ${t.name} (${t.id.substring(0, 8)}...) - Type: ${t.tournament_type} - Status: ${t.status}`);
    });
    
    // 2. Find SABO tournaments specifically
    const saboTournaments = tournaments.filter(t => 
      t.tournament_type.includes('double_elimination') || 
      t.name.toLowerCase().includes('sabo')
    );
    
    if (saboTournaments.length > 0) {
      console.log('\n🎯 SABO/Double Elimination tournaments found:');
      
      for (const tournament of saboTournaments) {
        console.log(`\n   📊 Tournament: ${tournament.name}`);
        console.log(`      - ID: ${tournament.id}`);
        console.log(`      - Type: ${tournament.tournament_type}`);
        console.log(`      - Status: ${tournament.status}`);
        
        // Check matches for this tournament
        const { data: matches, error: matchError } = await supabase
          .from('tournament_matches')
          .select('id, round_number, match_number, status')
          .eq('tournament_id', tournament.id)
          .order('round_number', { ascending: true });
          
        if (matchError) {
          console.log(`      ❌ Error fetching matches: ${matchError.message}`);
        } else {
          console.log(`      - Matches: ${matches.length} total`);
          
          if (matches.length > 0) {
            const rounds = [...new Set(matches.map(m => m.round_number))].sort();
            console.log(`      - Rounds: ${rounds.join(', ')}`);
            
            const completed = matches.filter(m => m.status === 'completed').length;
            console.log(`      - Progress: ${completed}/${matches.length} completed`);
          }
        }
      }
    } else {
      console.log('\n⚠️ No SABO tournaments found in recent tournaments');
    }
    
    // 3. Check if there are any matches at all
    console.log('\n🔍 Checking all tournament matches...');
    const { data: allMatches, error: allMatchError } = await supabase
      .from('tournament_matches')
      .select('tournament_id, round_number, status')
      .limit(10);
      
    if (allMatchError) {
      console.log(`❌ Error: ${allMatchError.message}`);
    } else {
      console.log(`📈 Total matches found: ${allMatches.length}`);
      if (allMatches.length > 0) {
        const uniqueTournaments = [...new Set(allMatches.map(m => m.tournament_id))];
        console.log(`   - From ${uniqueTournaments.length} tournaments`);
      }
    }
    
  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

checkSABOTournaments();
