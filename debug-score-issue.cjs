require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugScoreIssue() {
  console.log('🔍 DEBUG: Score Display Issues');
  console.log('=====================================');

  // Check authentication
  const { data: authData, error: authError } = await supabase.auth.getSession();
  console.log('🔐 Auth Status:', authData?.session ? 'Logged in' : 'Not logged in');
  
  if (authData?.session) {
    console.log('👤 User:', authData.session.user.email);
    console.log('🆔 User ID:', authData.session.user.id);
    
    // Check user role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, club_id, full_name')
      .eq('user_id', authData.session.user.id)
      .single();
    
    if (userProfile) {
      console.log('🏆 User Role:', userProfile.role);
      console.log('🏢 Club ID:', userProfile.club_id);
      console.log('👤 Full Name:', userProfile.full_name);
    }
  } else {
    console.log('❌ No authenticated user found');
    console.log('💡 Solution: Please login at the application first');
    return;
  }

  // Check recent tournament matches with scores
  console.log('\n📊 Recent Tournament Matches:');
  const { data: matches, error } = await supabase
    .from('tournament_matches')
    .select(`
      id, 
      match_number, 
      score_player1, 
      score_player2, 
      status, 
      player1_id, 
      player2_id, 
      tournament_id,
      created_at,
      updated_at,
      winner_id,
      round_number,
      bracket_type
    `)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching matches:', error);
    return;
  }

  if (matches && matches.length > 0) {
    matches.forEach((match, index) => {
      console.log(`\n${index + 1}. Match ${match.match_number}:`);
      console.log(`   Scores: ${match.score_player1 || 0} - ${match.score_player2 || 0}`);
      console.log(`   Status: ${match.status}`);
      console.log(`   Winner: ${match.winner_id || 'None'}`);
      console.log(`   Updated: ${new Date(match.updated_at).toLocaleString()}`);
      console.log(`   Tournament: ${match.tournament_id}`);
    });
  } else {
    console.log('❌ No matches found');
  }

  // Check active tournaments
  console.log('\n🏆 Active Tournaments:');
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, status, club_id')
    .eq('status', 'active')
    .limit(5);

  if (tournaments && tournaments.length > 0) {
    tournaments.forEach(tournament => {
      console.log(`- ${tournament.name} (${tournament.id}) - Club: ${tournament.club_id}`);
    });
  } else {
    console.log('❌ No active tournaments found');
  }

  // Check if user is club owner for any tournament
  if (authData?.session && userProfile?.club_id) {
    console.log('\n🔑 Checking club ownership permissions...');
    const { data: ownedTournaments } = await supabase
      .from('tournaments')
      .select('id, name, status')
      .eq('club_id', userProfile.club_id);
    
    if (ownedTournaments && ownedTournaments.length > 0) {
      console.log('✅ You own these tournaments:');
      ownedTournaments.forEach(t => {
        console.log(`   - ${t.name} (${t.status})`);
      });
    } else {
      console.log('❌ No tournaments found for your club');
    }
  }
}

debugScoreIssue().catch(console.error);
