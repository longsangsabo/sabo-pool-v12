// Check actual bracket types in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiqyqjqsghhsypriilxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcXlxanFzZ2hoc3lwcmlpbHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODgzNTMsImV4cCI6MjA0ODQ2NDM1M30.eJH4jNgPfmSWgCrz1_-FQHxR_7YLR_F-f4JMGzKP3Ns';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBracketTypes() {
  const tournamentId = '628efd1f-96e1-4944-a5d0-27e09310d86d';
  
  try {
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('bracket_type, group_id, count(*)')
      .eq('tournament_id', tournamentId)
      .order('bracket_type');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Unique bracket types in database:');
    const uniqueTypes = [...new Set(matches.map(m => m.bracket_type))];
    uniqueTypes.forEach(type => {
      const count = matches.filter(m => m.bracket_type === type).length;
      const groups = [...new Set(matches.filter(m => m.bracket_type === type).map(m => m.group_id))];
      console.log(`- ${type} (${count} matches, Groups: ${groups.join(', ')})`);
    });

  } catch (error) {
    console.error('Connection error:', error);
  }
}

checkBracketTypes();
