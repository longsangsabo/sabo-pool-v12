// Kiểm tra SABO matches trực tiếp
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ quiet: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSABOMatches() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🔍 Checking SABO matches table...');
  
  try {
    // Test basic table access
    console.log('1️⃣ Testing basic table access...');
    const { data: basicTest, error: basicError } = await supabase
      .from('sabo_tournament_matches')
      .select('count');
      
    if (basicError) {
      console.error('❌ Basic table access error:', basicError);
      return;
    }
    
    console.log('✅ Basic table access OK');
    
    // Try to get any records from table
    console.log('2️⃣ Getting any records from table...');
    const { data: anyRecords, error: anyError } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .limit(3);
      
    if (anyError) {
      console.error('❌ Error getting any records:', anyError);
      return;
    }
    
    console.log(`📊 Total records in table: ${anyRecords?.length || 0}`);
    if (anyRecords && anyRecords.length > 0) {
      console.log('📋 Sample record:', anyRecords[0]);
    }
    
    // Check specifically for our tournament
    console.log('3️⃣ Checking for tournament matches...');
    const { data: tournamentMatches, error: tournamentError } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId);
      
    if (tournamentError) {
      console.error('❌ Error getting tournament matches:', tournamentError);
      return;
    }
    
    console.log(`🎯 Matches for tournament ${tournamentId}: ${tournamentMatches?.length || 0}`);
    
    if (tournamentMatches && tournamentMatches.length > 0) {
      console.log('✅ Tournament matches found!');
      console.log('📋 First few matches:');
      tournamentMatches.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i+1}. ${match.sabo_match_id} - ${match.bracket_type} R${match.round_number}M${match.match_number}`);
      });
    } else {
      console.log('❌ No matches found for this tournament');
      
      // Check if matches exist but with different tournament ID
      console.log('4️⃣ Checking if matches exist with any tournament ID...');
      const { data: allMatches, error: allError } = await supabase
        .from('sabo_tournament_matches')
        .select('tournament_id, count()')
        .not('tournament_id', 'is', null);
        
      if (allError) {
        console.error('❌ Error checking all matches:', allError);
      } else {
        console.log('📊 All tournament IDs in table:', allMatches);
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

checkSABOMatches();
