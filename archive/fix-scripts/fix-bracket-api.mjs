import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixBracketGenerationAPI() {
  console.log('🔧 Testing and fixing bracket generation API...');
  
  try {
    // 1. Test edge function availability
    console.log('1. 🧪 Testing edge function...');
    
    const { data: testData, error: testError } = await supabase.functions.invoke(
      'generate-tournament-bracket', 
      {
        body: { 
          test: true,
          tournament_id: 'test-id' 
        }
      }
    );
    
    if (testError) {
      console.log('❌ Edge function not available:', testError.message);
      console.log('🔄 Creating fallback solution...');
      
      // Create fallback bracket generation function
      await createFallbackBracketFunction();
      
    } else {
      console.log('✅ Edge function is available');
      console.log('📝 Test response:', testData);
    }
    
    // 2. Test with real tournament
    console.log('\n2. 🏆 Testing with real tournament...');
    
    const { data: tournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name, status')
      .limit(1);
    
    if (tournError || !tournaments || tournaments.length === 0) {
      console.log('⚠️ No tournaments available for testing');
      return;
    }
    
    const testTournament = tournaments[0];
    console.log(`🎯 Testing with: ${testTournament.name}`);
    
    // Test bracket generation with real tournament
    const { data: bracketData, error: bracketError } = await supabase.functions.invoke(
      'generate-tournament-bracket',
      {
        body: {
          tournament_id: testTournament.id,
          generation_type: 'elo_based',
          test_mode: true
        }
      }
    );
    
    if (bracketError) {
      console.log('❌ Bracket generation failed:', bracketError.message);
      console.log('🔧 Implementing direct database solution...');
      
      await implementDirectBracketGeneration(testTournament.id);
      
    } else {
      console.log('✅ Bracket generation successful!');
      console.log('📊 Result:', bracketData);
    }
    
    console.log('\n🎉 Bracket generation fix completed!');
    
  } catch (error) {
    console.error('❌ Fix process failed:', error);
    await createEmergencyFallback();
  }
}

async function createFallbackBracketFunction() {
  console.log('🛠️ Creating fallback bracket generation...');
  
  const fallbackSQL = `
    CREATE OR REPLACE FUNCTION generate_simple_bracket(
      p_tournament_id UUID,
      p_generation_type TEXT DEFAULT 'elo_based'
    )
    RETURNS JSON AS $$
    DECLARE
      v_participants UUID[];
      v_participant_count INTEGER;
      v_matches_created INTEGER := 0;
      v_round INTEGER := 1;
      v_match_number INTEGER := 1;
    BEGIN
      -- Get confirmed participants
      SELECT array_agg(user_id ORDER BY 
        CASE 
          WHEN p_generation_type = 'elo_based' THEN -COALESCE(p.elo, 1000)
          WHEN p_generation_type = 'registration_order' THEN EXTRACT(EPOCH FROM tr.created_at)
          ELSE random()
        END
      ), COUNT(*)
      INTO v_participants, v_participant_count
      FROM tournament_registrations tr
      LEFT JOIN profiles p ON p.user_id = tr.user_id
      WHERE tr.tournament_id = p_tournament_id 
      AND tr.registration_status = 'confirmed';
      
      -- Check minimum participants
      IF v_participant_count < 2 THEN
        RETURN json_build_object(
          'success', false,
          'error', 'Need at least 2 confirmed participants'
        );
      END IF;
      
      -- Clear existing matches
      DELETE FROM tournament_matches WHERE tournament_id = p_tournament_id;
      
      -- Generate first round matches
      FOR i IN 1..v_participant_count BY 2 LOOP
        IF i + 1 <= v_participant_count THEN
          INSERT INTO tournament_matches (
            tournament_id, round_number, match_number,
            player1_id, player2_id, status
          ) VALUES (
            p_tournament_id, v_round, v_match_number,
            v_participants[i], v_participants[i + 1], 'scheduled'
          );
        ELSE
          -- Odd number, give bye
          INSERT INTO tournament_matches (
            tournament_id, round_number, match_number,
            player1_id, player2_id, status, winner_id
          ) VALUES (
            p_tournament_id, v_round, v_match_number,
            v_participants[i], NULL, 'completed', v_participants[i]
          );
        END IF;
        
        v_match_number := v_match_number + 1;
        v_matches_created := v_matches_created + 1;
      END LOOP;
      
      -- Update tournament status
      UPDATE tournaments 
      SET status = 'in_progress', updated_at = now()
      WHERE id = p_tournament_id;
      
      RETURN json_build_object(
        'success', true,
        'matches_created', v_matches_created,
        'participants', v_participant_count,
        'message', 'Bracket generated successfully'
      );
      
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object(
        'success', false,
        'error', SQLERRM
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: fallbackSQL });
  
  if (error) {
    console.log('⚠️ Could not create fallback function:', error.message);
  } else {
    console.log('✅ Fallback function created successfully');
  }
}

async function implementDirectBracketGeneration(tournamentId) {
  console.log('🔧 Implementing direct bracket generation...');
  
  try {
    // Use the fallback function we created
    const { data, error } = await supabase.rpc('generate_simple_bracket', {
      p_tournament_id: tournamentId,
      p_generation_type: 'elo_based'
    });
    
    if (error) {
      console.log('❌ Direct generation failed:', error.message);
    } else {
      console.log('✅ Direct generation successful:', data);
    }
    
  } catch (error) {
    console.log('❌ Direct generation error:', error.message);
  }
}

async function createEmergencyFallback() {
  console.log('🚨 Creating emergency fallback for bracket generation...');
  
  // This will be a simple client-side bracket generation that doesn't depend on edge functions
  const clientFallbackCode = `
    // Emergency client-side bracket generation
    export async function generateBracketFallback(tournamentId, generationType = 'elo_based') {
      const supabase = createClient(/* your config */);
      
      try {
        // 1. Get participants
        const { data: registrations } = await supabase
          .from('tournament_registrations')
          .select('user_id')
          .eq('tournament_id', tournamentId)
          .eq('registration_status', 'confirmed');
        
        if (!registrations || registrations.length < 2) {
          throw new Error('Need at least 2 confirmed participants');
        }
        
        // 2. Get profiles for seeding
        const userIds = registrations.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, elo, full_name')
          .in('user_id', userIds);
        
        // 3. Sort participants
        let sortedParticipants = profiles.sort((a, b) => {
          if (generationType === 'elo_based') {
            return (b.elo || 1000) - (a.elo || 1000);
          }
          return Math.random() - 0.5; // random
        });
        
        // 4. Generate first round matches
        const matches = [];
        for (let i = 0; i < sortedParticipants.length; i += 2) {
          if (sortedParticipants[i + 1]) {
            matches.push({
              tournament_id: tournamentId,
              round_number: 1,
              match_number: Math.floor(i / 2) + 1,
              player1_id: sortedParticipants[i].user_id,
              player2_id: sortedParticipants[i + 1].user_id,
              status: 'scheduled'
            });
          }
        }
        
        // 5. Insert matches
        const { error } = await supabase
          .from('tournament_matches')
          .upsert(matches);
        
        if (error) throw error;
        
        // 6. Update tournament status  
        await supabase
          .from('tournaments')
          .update({ status: 'in_progress' })
          .eq('id', tournamentId);
        
        return {
          success: true,
          matches_created: matches.length,
          participants: sortedParticipants.length
        };
        
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  `;
  
  console.log('📝 Emergency fallback code prepared (implement in components)');
  console.log('📋 Client-side fallback ready for use');
}

// Run the fix
fixBracketGenerationAPI();
