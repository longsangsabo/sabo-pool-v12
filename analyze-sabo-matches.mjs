import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyzeMatches() {
  const tournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  console.log('🔍 Analyzing SABO matches fetch...');
  
  // 1. Check all matches in DB
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('round_number, match_number, bracket_type, status')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  console.log('📊 ALL MATCHES IN DATABASE:', allMatches?.length || 0);
  allMatches?.forEach(m => console.log(`- Match ${m.match_number}: Round ${m.round_number} (${m.bracket_type})`));
  
  // 2. Check what SABO hook actually fetches
  const { data: saboMatches } = await supabase
    .from('tournament_matches')
    .select('round_number, match_number, bracket_type, status')
    .eq('tournament_id', tournamentId)
    .in('round_number', [1, 2, 3, 101, 102, 103, 201, 202, 250, 300])
    .order('round_number')
    .order('match_number');
    
  console.log('\n🎯 SABO HOOK FETCHES:', saboMatches?.length || 0);
  saboMatches?.forEach(m => console.log(`- Match ${m.match_number}: Round ${m.round_number} (${m.bracket_type})`));
  
  // 3. Check round distribution
  const roundCounts = {};
  allMatches?.forEach(m => {
    roundCounts[m.round_number] = (roundCounts[m.round_number] || 0) + 1;
  });
  
  console.log('\n📈 ROUND DISTRIBUTION:');
  Object.keys(roundCounts).sort((a,b) => Number(a) - Number(b)).forEach(round => {
    const inSaboFilter = [1, 2, 3, 101, 102, 103, 201, 202, 250, 300].includes(Number(round));
    console.log(`- Round ${round}: ${roundCounts[round]} matches ${inSaboFilter ? '✅' : '❌'}`);
  });
  
  // 4. Check what component actually displays
  console.log('\n🧩 COMPONENT ANALYSIS:');
  console.log('- SABODoubleEliminationViewer uses useSABOTournamentMatches hook');
  console.log('- Hook filters rounds: [1, 2, 3, 101, 102, 103, 201, 202, 250, 300]');
  console.log('- Component uses SABOLogicCore.organizeMatches() to structure data');
  console.log('- If matches.length === 0, shows "No matches found"');
}

analyzeMatches().catch(console.error);
