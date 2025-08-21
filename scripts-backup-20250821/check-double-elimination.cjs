const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDoubleEliminationBracket() {
  console.log('🎯 Checking DOUBLE ELIMINATION bracket functionality...');
  
  try {
    // 1. Check if there are double elimination tournaments
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('id, name, status, tournament_type, max_participants')
      .eq('tournament_type', 'double_elimination')
      .limit(5);

    if (tourError) {
      console.error('❌ Error fetching double elimination tournaments:', tourError);
      return;
    }

    if (!tournaments || tournaments.length === 0) {
      console.log('⚠️ No double elimination tournaments found');
      
      // Check all tournaments
      const { data: allTournaments } = await supabase
        .from('tournaments')
        .select('id, name, tournament_type')
        .limit(5);
      
      console.log('📋 Available tournaments:', allTournaments?.map(t => ({
        id: t.id,
        name: t.name,
        type: t.tournament_type
      })));
      return;
    }

    console.log('✅ Found double elimination tournaments:', tournaments.length);
    const testTournament = tournaments[0];
    console.log('🎯 Testing with tournament:', {
      id: testTournament.id,
      name: testTournament.name,
      max_participants: testTournament.max_participants
    });

    // 2. Check for double elimination bracket functions
    console.log('🔍 Testing generate_double_elimination_bracket function...');
    
    const { data: bracketData, error: bracketError } = await supabase.rpc('generate_double_elimination_bracket', {
      p_tournament_id: testTournament.id
    });

    if (bracketError) {
      console.log('⚠️ generate_double_elimination_bracket function issue:', bracketError.message);
      
      // Try alternative function names
      console.log('🔄 Trying alternative function names...');
      
      const { data: altData, error: altError } = await supabase.rpc('create_double_elimination_bracket', {
        tournament_id: testTournament.id
      });
      
      if (altError) {
        console.log('⚠️ create_double_elimination_bracket also failed:', altError.message);
      } else {
        console.log('✅ Alternative function works!');
      }
    } else {
      console.log('✅ Double elimination bracket generation function works');
      console.log('📊 Bracket data preview:', {
        matches_created: Array.isArray(bracketData) ? bracketData.length : 'unknown',
        data_type: typeof bracketData
      });
    }

    // 3. Check existing matches for double elimination tournament
    const { data: matches, error: matchError } = await supabase
      .from('tournament_matches')
      .select('id, round_number, match_number, bracket_type, player1_id, player2_id')
      .eq('tournament_id', testTournament.id)
      .order('round_number', { ascending: true })
      .limit(10);

    if (matchError) {
      console.error('❌ Error checking matches:', matchError);
    } else {
      console.log('📊 Existing matches for double elimination:', matches.length);
      if (matches.length > 0) {
        console.log('🔍 Sample matches:', matches.slice(0, 3).map(m => ({
          round: m.round_number,
          match: m.match_number,
          bracket: m.bracket_type,
          has_players: !!(m.player1_id || m.player2_id)
        })));
      }
    }

    // 4. Check if tournament has registrations
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('id, user_id')
      .eq('tournament_id', testTournament.id)
      .limit(5);

    if (regError) {
      console.log('⚠️ Could not check registrations:', regError.message);
    } else {
      console.log('👥 Tournament registrations:', registrations.length);
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

checkDoubleEliminationBracket();
