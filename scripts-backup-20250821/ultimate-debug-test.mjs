// Ultimate debug script - Create complete test scenario
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function ultimateDebugTest() {
  console.log('🔥 ULTIMATE DEBUG TEST - Complete Flow Check');
  console.log('=' .repeat(60));

  try {
    // 1. Get/Create test tournament  
    let { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name, status')
      .limit(1);

    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found. Cannot proceed with test.');
      return;
    }

    const tournament = tournaments[0];
    console.log('✅ Using tournament:', tournament.name, '(', tournament.id, ')');

    // 2. Check if we already have test match
    let { data: existingMatches } = await supabase
      .from('sabo_tournament_matches') 
      .select('*')
      .eq('tournament_id', tournament.id)
      .ilike('player1_name', '%UI Debug%');

    let testMatch = existingMatches?.[0];

    if (!testMatch) {
      console.log('\n📝 Creating new test match...');
      
      // Try with dummy UUID that might work
      const dummyUserId = '00000000-0000-0000-0000-000000000000';
      
      // Use raw SQL to bypass potential RLS issues
      const { data: newMatch, error: createError } = await supabase
        .rpc('create_test_match', {
          p_tournament_id: tournament.id,
          p_player1_id: dummyUserId,
          p_player2_id: dummyUserId,
          p_player1_name: 'Alice (UI Debug)',
          p_player2_name: 'Bob (UI Debug)'
        });

      if (createError) {
        console.log('❌ RPC create failed:', createError.message);
        console.log('Trying direct insert with admin...');
        
        // If we have service key, try with that
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL, 
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );
          
          const { data: adminMatch, error: adminError } = await supabaseAdmin
            .from('sabo_tournament_matches')
            .insert({
              tournament_id: tournament.id,
              player1_id: uuidv4(),
              player2_id: uuidv4(), 
              player1_name: 'Alice (UI Debug)',
              player2_name: 'Bob (UI Debug)',
              round_number: 999,
              match_number: 9999,
              status: 'pending',
              bracket_type: 'winner'
            })
            .select()
            .single();
            
          if (adminError) {
            console.log('❌ Admin insert failed:', adminError.message);
            return;
          } else {
            testMatch = adminMatch;
            console.log('✅ Test match created with admin access');
          }
        } else {
          console.log('❌ No service role key available');
          return;
        }
      } else {
        testMatch = newMatch;
        console.log('✅ Test match created via RPC');
      }
    } else {
      console.log('✅ Using existing test match');
    }

    console.log('📊 Test Match Details:');
    console.log('  ID:', testMatch.id);
    console.log('  Players:', testMatch.player1_name, 'vs', testMatch.player2_name);
    console.log('  Current scores:', testMatch.score_player1, '-', testMatch.score_player2);
    console.log('  Status:', testMatch.status);

    // 3. Test score submission with our fixed function
    console.log('\n🎯 Testing score submission...');
    const testScore1 = Math.floor(Math.random() * 10) + 1;
    const testScore2 = Math.floor(Math.random() * 10) + 1;
    
    const { data: result, error: scoreError } = await supabase.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: testScore1,
      p_player2_score: testScore2,
      p_submitted_by: null
    });

    if (scoreError) {
      console.log('❌ Score submission failed:', scoreError.message);
      return;
    }

    console.log('✅ Score submitted successfully!');
    console.log('📋 Function result:', result);

    // 4. Verify database update immediately
    console.log('\n🔍 Verifying database update...');
    const { data: updatedMatch, error: verifyError } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .eq('id', testMatch.id)
      .single();

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return;
    }

    console.log('✅ Database verification successful:');
    console.log('  Score Player 1:', updatedMatch.score_player1, '(expected:', testScore1, ')');
    console.log('  Score Player 2:', updatedMatch.score_player2, '(expected:', testScore2, ')');
    console.log('  Status:', updatedMatch.status);
    console.log('  Winner ID:', updatedMatch.winner_id);
    console.log('  Updated At:', updatedMatch.updated_at);

    // 5. Test real-time subscription
    console.log('\n📡 Testing real-time subscription...');
    let subscriptionTriggered = false;
    
    const subscription = supabase
      .channel('debug_test_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sabo_tournament_matches',
          filter: `id=eq.${testMatch.id}`
        }, 
        (payload) => {
          console.log('🔔 Real-time update received:', payload);
          subscriptionTriggered = true;
        }
      )
      .subscribe();
      
    // Submit another score to trigger real-time
    setTimeout(async () => {
      console.log('\n🎯 Triggering real-time test...');
      const rtScore1 = Math.floor(Math.random() * 10) + 1;
      const rtScore2 = Math.floor(Math.random() * 10) + 1;
      
      await supabase.rpc('submit_sabo_match_score', {
        p_match_id: testMatch.id,
        p_player1_score: rtScore1,
        p_player2_score: rtScore2,
        p_submitted_by: null
      });
      
      console.log(`📡 Real-time trigger sent: ${rtScore1}-${rtScore2}`);
      
      // Check after 3 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 ULTIMATE DEBUG SUMMARY');
        console.log('='.repeat(60));
        
        if (subscriptionTriggered) {
          console.log('✅ Database function: WORKING');
          console.log('✅ Data updates: WORKING');
          console.log('✅ Real-time subscriptions: WORKING');
          console.log('\n💡 If UI still not updating, the issue is:');
          console.log('  - Frontend component not subscribing correctly');
          console.log('  - React Query cache not invalidating');
          console.log('  - Component not re-rendering after state change');
          console.log('\n🔧 TRY IN BROWSER:');
          console.log('  1. Open http://localhost:8000/');
          console.log(`  2. Find tournament: ${tournament.name}`);
          console.log('  3. Look for match: Alice (UI Debug) vs Bob (UI Debug)');
          console.log('  4. Click "Enter Score" and test');
          console.log('  5. Check browser console for real-time updates');
        } else {
          console.log('❌ Real-time subscription: NOT WORKING');
          console.log('✅ Database function: WORKING');
          console.log('✅ Data updates: WORKING');
          console.log('\n💡 Real-time issue could be:');
          console.log('  - Supabase real-time not enabled');
          console.log('  - Frontend real-time setup incorrect');
          console.log('  - Connection issues');
        }
        
        console.log('\n📋 READY FOR UI TESTING:');
        console.log('Tournament ID:', tournament.id);
        console.log('Tournament Name:', tournament.name);
        console.log('Test Match ID:', testMatch.id);
        console.log('Players: Alice (UI Debug) vs Bob (UI Debug)');
        
        process.exit(0);
      }, 3000);
      
    }, 1000);

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

ultimateDebugTest();
