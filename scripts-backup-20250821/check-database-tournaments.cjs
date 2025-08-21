// Database check for tournaments
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournaments() {
  console.log('🔍 Checking for tournaments...');
  
  try {
    // Get tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      return;
    }
    
    console.log('🏆 Found tournaments:', tournaments?.length || 0);
    if (tournaments && tournaments.length > 0) {
      tournaments.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} (ID: ${t.id}) - Status: ${t.status}`);
      });
      
      // Check SABO matches for the first tournament
      const firstTournament = tournaments[0];
      console.log(`\n🎯 Checking SABO matches for tournament: ${firstTournament.id}`);
      
      const { data: saboMatches, error: saboError } = await supabase
        .from('sabo_tournament_matches')
        .select('*')
        .eq('tournament_id', firstTournament.id);
        
      if (saboError) {
        console.error('❌ Error fetching SABO matches:', saboError);
        return;
      }
      
      console.log('⚡ SABO matches found:', saboMatches?.length || 0);
      if (saboMatches && saboMatches.length > 0) {
        console.log('📊 Sample matches:');
        saboMatches.slice(0, 3).forEach((match, i) => {
          console.log(`  ${i + 1}. Round ${match.round_number}, Match ${match.match_number} (${match.bracket_type})`);
        });
      }
      
      // Check registrations
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', firstTournament.id)
        .eq('registration_status', 'confirmed');
        
      if (regError) {
        console.error('❌ Error fetching registrations:', regError);
        return;
      }
      
      console.log('👥 Confirmed registrations:', registrations?.length || 0);
      
      console.log(`\n🌐 Tournament URL: http://localhost:8004/tournaments/${firstTournament.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTournaments();
