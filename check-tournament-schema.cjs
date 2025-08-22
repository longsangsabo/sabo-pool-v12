require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTournamentSchema() {
  console.log('🔍 CHECKING TOURNAMENT SCHEMA');
  console.log('============================');

  try {
    // 1. Check tournament_matches table
    console.log('\n1. 📊 TOURNAMENT_MATCHES TABLE:');
    console.log('--------------------------------');
    
    const { data: matchesData, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1);

    if (matchesError) {
      console.log('❌ Error fetching tournament_matches:', matchesError);
    } else if (matchesData && matchesData.length > 0) {
      console.log('✅ Available columns:');
      Object.keys(matchesData[0]).forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      console.log('\n📋 Sample record:');
      console.log(JSON.stringify(matchesData[0], null, 2));
    } else {
      console.log('📭 Table is empty');
    }

    // 2. Check tournament_registrations table
    console.log('\n\n2. 📊 TOURNAMENT_REGISTRATIONS TABLE:');
    console.log('-------------------------------------');
    
    const { data: regData, error: regError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .limit(1);

    if (regError) {
      console.log('❌ Error fetching tournament_registrations:', regError);
    } else if (regData && regData.length > 0) {
      console.log('✅ Available columns:');
      Object.keys(regData[0]).forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      console.log('\n📋 Sample record:');
      console.log(JSON.stringify(regData[0], null, 2));
    } else {
      console.log('📭 Table is empty');
    }

    // 3. Check profiles table structure
    console.log('\n\n3. 📊 PROFILES TABLE:');
    console.log('---------------------');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.log('❌ Error fetching profiles:', profileError);
    } else if (profileData && profileData.length > 0) {
      console.log('✅ Available columns:');
      Object.keys(profileData[0]).forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
    } else {
      console.log('📭 Table is empty');
    }

    // 4. Test foreign key relationship
    console.log('\n\n4. 🔗 TESTING FOREIGN KEY RELATIONSHIPS:');
    console.log('----------------------------------------');
    
    console.log('Testing tournament_registrations with profiles join...');
    const { data: joinTest, error: joinError } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        user_id,
        profiles(id, user_id, full_name, display_name)
      `)
      .limit(1);

    if (joinError) {
      console.log('❌ Foreign key relationship error:', joinError);
      
      // Try alternative approach
      console.log('\n🔄 Trying alternative approach...');
      const { data: regOnly, error: regOnlyError } = await supabase
        .from('tournament_registrations')
        .select('id, user_id, tournament_id, registration_status')
        .limit(1);
        
      if (regOnlyError) {
        console.log('❌ Even basic select failed:', regOnlyError);
      } else {
        console.log('✅ Basic tournament_registrations works:', regOnly?.length || 0, 'records');
      }
    } else {
      console.log('✅ Foreign key relationship works!');
      console.log('Data:', joinTest);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkTournamentSchema();
