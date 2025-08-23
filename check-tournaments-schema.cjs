const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTournamentsSchema() {
  try {
    console.log('🔍 Checking tournaments table schema...\n');

    // Get all tournaments to see structure
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('*')
      .limit(5);

    if (tourError) {
      console.error('Error fetching tournaments:', tourError);
      return;
    }

    if (tournaments && tournaments.length > 0) {
      console.log('📋 Sample tournament record:');
      console.log(JSON.stringify(tournaments[0], null, 2));
      
      console.log('\n📋 Available columns:');
      Object.keys(tournaments[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof tournaments[0][key]} (${tournaments[0][key]})`);
      });
    } else {
      console.log('❌ No tournaments found');
    }

    // Check all tournaments
    const { data: allTournaments, error: allError } = await supabase
      .from('tournaments')
      .select('*');

    if (allError) {
      console.error('Error fetching all tournaments:', allError);
      return;
    }

    console.log(`\n📊 Total tournaments: ${allTournaments?.length || 0}`);
    
    if (allTournaments && allTournaments.length > 0) {
      allTournaments.forEach((t, index) => {
        console.log(`${index + 1}. ${t.name || t.title || 'Unnamed'} - Status: ${t.status} - ID: ${t.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTournamentsSchema();
