const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igiqzfavlmcijmhqqqra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaXF6ZmF2bG1jaWptaHFxcXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MjI1NzEsImV4cCI6MjA1MDAwNDU3MX0.8_rJMLFWPwT7CxkOjdV0Y_DaZNs7cW7W3RG1cT5Dm94';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTournamentState() {
  console.log('🔍 Debugging Tournament State...\n');
  
  try {
    const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
    
    // 1. Check tournament info
    console.log('1️⃣ TOURNAMENT INFO:');
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();
      
    if (tournamentError) {
      console.error('❌ Tournament error:', tournamentError);
    } else {
      console.log('✅ Tournament:', {
        name: tournament.name,
        status: tournament.status,
        current_participants: tournament.current_participants,
        max_participants: tournament.max_participants,
        tournament_type: tournament.tournament_type
      });
    }
    
    // 2. Check all registrations
    console.log('\n2️⃣ ALL REGISTRATIONS:');
    const { data: allRegs, error: allRegsError } = await supabase
      .from('tournament_registrations')
      .select('user_id, registration_status, created_at')
      .eq('tournament_id', tournamentId);
      
    if (allRegsError) {
      console.error('❌ All registrations error:', allRegsError);
    } else {
      console.log('✅ Total registrations:', allRegs?.length || 0);
      const statusCounts = {};
      allRegs?.forEach(reg => {
        statusCounts[reg.registration_status] = (statusCounts[reg.registration_status] || 0) + 1;
      });
      console.log('📊 Status breakdown:', statusCounts);
    }
    
    // 3. Check confirmed registrations
    console.log('\n3️⃣ CONFIRMED REGISTRATIONS:');
    const { data: confirmedRegs, error: confirmedError } = await supabase
      .from('tournament_registrations')
      .select('user_id, registration_status')
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed');
      
    if (confirmedError) {
      console.error('❌ Confirmed registrations error:', confirmedError);
    } else {
      console.log('✅ Confirmed registrations:', confirmedRegs?.length || 0);
    }
    
    // 4. Check tournament matches
    console.log('\n4️⃣ TOURNAMENT MATCHES:');
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId);
      
    if (matchesError) {
      console.error('❌ Matches error:', matchesError);
    } else {
      console.log('✅ Total matches:', matches?.length || 0);
      if (matches && matches.length > 0) {
        console.log('📋 Sample match:', {
          round: matches[0].round,
          position: matches[0].position,
          player1_id: matches[0].player1_id,
          player2_id: matches[0].player2_id,
          match_status: matches[0].match_status
        });
      }
    }
    
    // 5. Check SABO functions
    console.log('\n5️⃣ SABO FUNCTION TEST:');
    try {
      const { data: saboBracket, error: saboError } = await supabase.rpc('generate_sabo_tournament_bracket', {
        tournament_id: tournamentId,
        seeding_method: 'elo_ranking'
      });
      
      if (saboError) {
        console.error('❌ SABO function error:', saboError.message);
      } else {
        console.log('✅ SABO function working:', saboBracket?.success || false);
      }
    } catch (error) {
      console.error('💥 SABO function exception:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugTournamentState();
