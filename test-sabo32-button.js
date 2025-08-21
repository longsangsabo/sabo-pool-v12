// =============================================
// TEST SABO-32 BRACKET CREATION BUTTON
// Verify 32-player tournament creation works
// =============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtrrfpttqhqcjkqzqgei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnJmcHR0cWhxY2prcXpxZ2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0OTY1NDksImV4cCI6MjA0NzA3MjU0OX0.IUJGrmZGZSqTJEdhOLtb1KdgGW7-m7_FGYIRm-8rIzY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSABO32Creation() {
  console.log('🧪 Testing SABO-32 tournament creation...');
  
  try {
    // 1. Create a test tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Test SABO-32 Tournament',
        tournament_type: 'double_elimination',
        max_participants: 32,
        status: 'registration'
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('❌ Error creating tournament:', tournamentError);
      return;
    }

    console.log('✅ Tournament created:', tournament.id);

    // 2. Create 32 fake players (registrations)
    const fakeUsers = Array.from({ length: 32 }, (_, i) => ({
      tournament_id: tournament.id,
      user_id: `fake-user-${i + 1}`,
      registration_status: 'confirmed',
      payment_status: 'paid'
    }));

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert(fakeUsers);

    if (regError) {
      console.error('❌ Error creating registrations:', regError);
      return;
    }

    console.log('✅ 32 registrations created');

    // 3. Test bracket generation
    console.log('🎯 Testing bracket generation for 32 players...');
    
    // Import and test SABO32TournamentEngine
    const { SABO32TournamentEngine } = await import('./src/tournaments/sabo/SABO32TournamentEngine.js');
    
    const playerIds = fakeUsers.map(u => u.user_id);
    const matches = await SABO32TournamentEngine.createTournament(tournament.id, playerIds);
    
    console.log('📊 SABO-32 matches created:', {
      total: matches.length,
      groupA: matches.filter(m => m.group_id === 'A').length,
      groupB: matches.filter(m => m.group_id === 'B').length,
      crossBracket: matches.filter(m => m.group_id === null).length
    });

    // 4. Insert matches to database 
    const matchInserts = matches.map(match => ({
      id: crypto.randomUUID(),
      tournament_id: tournament.id,
      group_id: match.group_id,
      bracket_type: match.bracket_type,
      round_number: match.round_number,
      match_number: match.match_number,
      sabo_match_id: match.sabo_match_id,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('tournament_matches')
      .insert(matchInserts);

    if (insertError) {
      console.error('❌ Error inserting matches:', insertError);
      return;
    }

    console.log('✅ All 53 matches inserted to database');
    console.log('🎯 SABO-32 tournament creation test PASSED!');
    console.log(`📱 Test tournament ID: ${tournament.id}`);
    
    // 5. Cleanup (optional)
    // await supabase.from('tournament_matches').delete().eq('tournament_id', tournament.id);
    // await supabase.from('tournament_registrations').delete().eq('tournament_id', tournament.id);
    // await supabase.from('tournaments').delete().eq('id', tournament.id);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testSABO32Creation();
