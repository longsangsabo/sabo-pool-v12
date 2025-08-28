// Debug Tournament ID and SABO32BracketViewer
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiqyqjqsghhsypriilxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcXlxanFzZ2hoc3lwcmlpbHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODgzNTMsImV4cCI6MjA0ODQ2NDM1M30.eJH4jNgPfmSWgCrz1_-FQHxR_7YLR_F-f4JMGzKP3Ns';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournamentAndMatches() {
  console.log('=== CHECKING TOURNAMENT AND MATCHES ===');
  
  try {
    // 1. Get all tournaments (double elimination type)
    console.log('\n1. GETTING ALL DOUBLE ELIMINATION TOURNAMENTS:');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status, max_participants, current_participants')
      .eq('tournament_type', 'double_elimination')
      .order('created_at', { ascending: false });

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError);
      return;
    }

    console.log(`Found ${tournaments?.length || 0} double elimination tournaments:`);
    tournaments?.forEach(t => {
      console.log(`- ${t.name} (ID: ${t.id}, Status: ${t.status}, Players: ${t.current_participants}/${t.max_participants})`);
    });

    // 2. Check if any tournament has 32 participants (SABO-32)
    const sabo32Candidates = tournaments?.filter(t => t.max_participants === 32 || t.current_participants === 32);
    console.log(`\nFound ${sabo32Candidates?.length || 0} potential SABO-32 tournaments:`);
    sabo32Candidates?.forEach(t => {
      console.log(`- ${t.name} (ID: ${t.id})`);
    });

    // 3. For each potential SABO-32 tournament, check matches
    if (sabo32Candidates && sabo32Candidates.length > 0) {
      for (const tournament of sabo32Candidates) {
        console.log(`\n=== CHECKING MATCHES FOR TOURNAMENT: ${tournament.name} (${tournament.id}) ===`);
        
        // Check sabo32_matches table
        const { data: sabo32Matches, error: sabo32Error } = await supabase
          .from('sabo32_matches')
          .select('*')
          .eq('tournament_id', tournament.id)
          .order('round_number', { ascending: true })
          .order('match_number', { ascending: true });

        if (sabo32Error) {
          console.error(`Error fetching sabo32_matches for ${tournament.id}:`, sabo32Error);
        } else {
          console.log(`Found ${sabo32Matches?.length || 0} matches in sabo32_matches table`);
          if (sabo32Matches && sabo32Matches.length > 0) {
            console.log('Sample matches:');
            sabo32Matches.slice(0, 3).forEach(m => {
              console.log(`  - Match ${m.match_number} (Round ${m.round_number}): ${m.bracket_type}, Group ${m.group_id}, Status: ${m.status}`);
            });
          }
        }

        // Also check tournament_matches table for comparison
        const { data: tournamentMatches, error: tournamentError } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', tournament.id);

        if (tournamentError) {
          console.error(`Error fetching tournament_matches for ${tournament.id}:`, tournamentError);
        } else {
          console.log(`Found ${tournamentMatches?.length || 0} matches in tournament_matches table`);
        }
      }
    }

    // 4. Check if there are any SABO32 matches at all
    console.log('\n4. CHECKING ALL SABO32 MATCHES:');
    const { data: allSabo32Matches, error: allSabo32Error } = await supabase
      .from('sabo32_matches')
      .select('tournament_id, count(*)')
      .order('tournament_id');

    if (allSabo32Error) {
      console.error('Error fetching all sabo32_matches:', allSabo32Error);
    } else {
      console.log(`Total rows in sabo32_matches: ${allSabo32Matches?.length || 0}`);
      if (allSabo32Matches && allSabo32Matches.length > 0) {
        allSabo32Matches.forEach(item => {
          console.log(`- Tournament ${item.tournament_id}: ${item.count} matches`);
        });
      }
    }

  } catch (error) {
    console.error('Overall error:', error);
  }
}

checkTournamentAndMatches();
