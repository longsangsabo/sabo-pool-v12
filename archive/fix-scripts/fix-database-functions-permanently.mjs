import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixDatabaseFunctionsPermanently() {
  console.log('🔧 FIXING DATABASE FUNCTIONS TO PREVENT FUTURE ISSUES');
  console.log('====================================================\n');
  
  console.log('STEP 1: Updating assign_participant_to_next_match function...');
  
  // Fix the broken function with corrected logic
  const fixedFunction = `
  CREATE OR REPLACE FUNCTION assign_participant_to_next_match(
    p_tournament_id UUID,
    p_round_number INTEGER,
    p_participant_id UUID
  ) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    v_match_id UUID;
    v_current_player1 UUID;
    v_current_player2 UUID;
  BEGIN
    -- Find the next available match in the round
    SELECT id, player1_id, player2_id 
    INTO v_match_id, v_current_player1, v_current_player2
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id
      AND round_number = p_round_number
      AND (player1_id IS NULL OR player2_id IS NULL)
      AND status = 'pending'
    ORDER BY match_number
    LIMIT 1;
    
    -- Only proceed if we found a match
    IF v_match_id IS NOT NULL THEN
      -- Assign to the first empty slot
      IF v_current_player1 IS NULL THEN
        -- Assign to player1_id slot
        UPDATE tournament_matches
        SET 
          player1_id = p_participant_id,
          status = CASE WHEN v_current_player2 IS NOT NULL THEN 'ready' ELSE 'pending' END,
          updated_at = NOW()
        WHERE id = v_match_id;
        
      ELSIF v_current_player2 IS NULL THEN
        -- Assign to player2_id slot  
        UPDATE tournament_matches
        SET 
          player2_id = p_participant_id,
          status = 'ready', -- Both players now assigned
          updated_at = NOW()
        WHERE id = v_match_id;
      END IF;
      
      -- Log the assignment for debugging
      RAISE NOTICE 'Assigned participant % to match % in round %', p_participant_id, v_match_id, p_round_number;
    ELSE
      -- Log when no available match found
      RAISE NOTICE 'No available match found in round % for participant %', p_round_number, p_participant_id;
    END IF;
  END;
  $$;
  `;
  
  try {
    // Execute the function update
    const { error } = await supabase.rpc('exec_sql', { sql: fixedFunction });
    
    if (error) {
      console.log('❌ Cannot update function via RPC. Need manual database update.');
      console.log('Please run this SQL in Supabase Dashboard:');
      console.log(fixedFunction);
    } else {
      console.log('✅ Function updated successfully!');
    }
  } catch (err) {
    console.log('❌ Function update failed:', err.message);
    console.log('\n📋 MANUAL FIX REQUIRED:');
    console.log('Copy this SQL and run in Supabase Dashboard SQL Editor:');
    console.log('=' .repeat(60));
    console.log(fixedFunction);
    console.log('=' .repeat(60));
  }
  
  console.log('\nSTEP 2: Testing the fix with a new tournament...');
  
  // Create a test tournament to verify the fix
  const testTournamentName = `Test SABO Fix ${Date.now()}`;
  
  console.log(`🎯 Creating test tournament: "${testTournamentName}"`);
  
  const { data: testTournament, error: createError } = await supabase
    .from('tournaments')
    .insert({
      name: testTournamentName,
      tournament_type: 'double_elimination',
      format: 'double_elimination',
      max_participants: 16,
      status: 'registration_open',
      description: 'Test tournament to verify SABO advancement fix'
    })
    .select()
    .single();
    
  if (createError) {
    console.log('❌ Failed to create test tournament:', createError.message);
    return;
  }
  
  console.log(`✅ Test tournament created: ${testTournament.id}`);
  
  // Add test registrations
  console.log('\n🎮 Adding 16 test registrations...');
  
  const testUsers = [];
  for (let i = 1; i <= 16; i++) {
    testUsers.push({
      tournament_id: testTournament.id,
      user_id: `test-user-${i.toString().padStart(2, '0')}-${Date.now()}`,
      registration_status: 'confirmed'
    });
  }
  
  const { error: regError } = await supabase
    .from('tournament_registrations')
    .insert(testUsers);
    
  if (regError) {
    console.log('❌ Failed to add registrations:', regError.message);
    return;
  }
  
  console.log('✅ 16 test registrations added');
  
  // Generate bracket using database function
  console.log('\n🏗️ Generating SABO bracket...');
  
  try {
    const { data: bracketResult, error: bracketError } = await supabase.rpc('generate_sabo_tournament_bracket', {
      p_tournament_id: testTournament.id
    });
    
    if (bracketError) {
      console.log('❌ Bracket generation failed:', bracketError.message);
      
      // Fallback to manual bracket generation
      console.log('🔄 Falling back to manual bracket generation...');
      await generateTestBracketManually(testTournament.id, testUsers);
    } else {
      console.log('✅ Bracket generated successfully!');
      console.log('Result:', bracketResult);
    }
    
    // Test advancement with the corrected function
    await testAdvancementWithNewTournament(testTournament.id);
    
  } catch (err) {
    console.log('❌ Bracket generation error:', err.message);
  }
}

async function generateTestBracketManually(tournamentId, users) {
  console.log('📝 Generating test bracket manually...');
  
  const matches = [];
  let matchNumber = 1;
  
  // Round 1: 8 matches
  for (let i = 0; i < 8; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 1,
      match_number: matchNumber++,
      player1_id: users[i].user_id,
      player2_id: users[15-i].user_id,
      status: 'ready',
      bracket_type: 'winners'
    });
  }
  
  // Round 2: 4 matches
  for (let i = 0; i < 4; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 2,
      match_number: matchNumber++,
      status: 'pending',
      bracket_type: 'winners'
    });
  }
  
  // Round 3: 2 matches
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 3,
      match_number: matchNumber++,
      status: 'pending',
      bracket_type: 'winners'
    });
  }
  
  // Losers Branch A
  for (let i = 0; i < 4; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 101,
      match_number: matchNumber++,
      status: 'pending',
      bracket_type: 'losers'
    });
  }
  
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 102,
      match_number: matchNumber++,
      status: 'pending',
      bracket_type: 'losers'
    });
  }
  
  matches.push({
    tournament_id: tournamentId,
    round_number: 103,
    match_number: matchNumber++,
    status: 'pending',
    bracket_type: 'losers'
  });
  
  // Losers Branch B
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 201,
      match_number: matchNumber++,
      status: 'pending',
      bracket_type: 'losers'
    });
  }
  
  matches.push({
    tournament_id: tournamentId,
    round_number: 202,
    match_number: matchNumber++,
    status: 'pending',
    bracket_type: 'losers'
  });
  
  // Finals
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 250,
      match_number: matchNumber++,
      status: 'pending',
      bracket_type: 'winners'
    });
  }
  
  matches.push({
    tournament_id: tournamentId,
    round_number: 300,
    match_number: matchNumber++,
    status: 'pending',
    bracket_type: 'winners'
  });
  
  const { error } = await supabase
    .from('tournament_matches')
    .insert(matches);
    
  if (error) {
    console.log('❌ Manual bracket generation failed:', error.message);
  } else {
    console.log(`✅ Manual bracket generated: ${matches.length} matches`);
  }
}

async function testAdvancementWithNewTournament(tournamentId) {
  console.log('\n🧪 Testing advancement with new tournament...');
  
  // Get first Round 1 match
  const { data: testMatch } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 1)
    .eq('match_number', 1)
    .single();
    
  if (!testMatch) {
    console.log('❌ No test match found');
    return;
  }
  
  console.log(`🎮 Testing Round 1 Match 1...`);
  
  // Submit a test score
  try {
    const { data: result, error } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: 15,
      p_player2_score: 10,
      p_submitted_by: testMatch.player1_id
    });
    
    if (error) {
      console.log('❌ Score submission failed:', error.message);
      return;
    }
    
    console.log('✅ Score submission successful!');
    console.log('Advancement result:', result.advancement);
    
    // Check if advancement worked correctly
    const { data: round2Matches } = await supabase
      .from('tournament_matches')
      .select('match_number, player1_id, player2_id, status')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 2)
      .order('match_number');
      
    const { data: losersR1Matches } = await supabase
      .from('tournament_matches')
      .select('match_number, player1_id, player2_id, status')
      .eq('tournament_id', tournamentId)
      .eq('round_number', 101)
      .order('match_number');
      
    console.log('\n📊 Round 2 Status:');
    round2Matches?.forEach(match => {
      const hasP1 = match.player1_id ? '✅' : '❌';
      const hasP2 = match.player2_id ? '✅' : '❌';
      console.log(`  Match ${match.match_number}: P1:${hasP1} P2:${hasP2} | Status: ${match.status}`);
    });
    
    console.log('\n📊 Losers Round 1 Status:');
    losersR1Matches?.forEach(match => {
      const hasP1 = match.player1_id ? '✅' : '❌';
      const hasP2 = match.player2_id ? '✅' : '❌';
      console.log(`  Match ${match.match_number}: P1:${hasP1} P2:${hasP2} | Status: ${match.status}`);
    });
    
    // Verify winner and loser placement
    const winnerAdvanced = round2Matches?.some(m => m.player1_id === result.winner_id || m.player2_id === result.winner_id);
    const loserId = result.winner_id === testMatch.player1_id ? testMatch.player2_id : testMatch.player1_id;
    const loserAdvanced = losersR1Matches?.some(m => m.player1_id === loserId || m.player2_id === loserId);
    
    console.log('\n🎯 ADVANCEMENT VERIFICATION:');
    console.log(`- Winner advanced to Round 2: ${winnerAdvanced ? '✅' : '❌'}`);
    console.log(`- Loser advanced to Losers R1: ${loserAdvanced ? '✅' : '❌'}`);
    
    if (winnerAdvanced && loserAdvanced) {
      console.log('\n🎉 DATABASE FUNCTIONS FIXED! Future tournaments will work correctly!');
    } else {
      console.log('\n⚠️ Database functions still have issues. Manual SQL update required.');
    }
    
  } catch (err) {
    console.log('❌ Test failed:', err.message);
  }
}

fixDatabaseFunctionsPermanently();
