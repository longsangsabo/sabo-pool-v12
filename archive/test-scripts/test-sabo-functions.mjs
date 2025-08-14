#!/usr/bin/env node

// Test SABO bracket generation functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSABOFunctions() {
  console.log('🧪 TESTING SABO BRACKET GENERATION FUNCTIONS');
  console.log('=============================================');

  try {
    // 1. Check if SABO functions exist
    console.log('\n1️⃣ Checking SABO function availability...');
    
    const saboFunctions = [
      'generate_sabo_tournament_bracket',
      'advance_sabo_tournament', 
      'submit_sabo_match_score',
      'validate_sabo_tournament_structure'
    ];

    for (const funcName of saboFunctions) {
      try {
        const { data, error } = await supabase
          .from('pg_proc')
          .select('proname')
          .eq('proname', funcName)
          .single();

        console.log(`   ${funcName}: ${data ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        if (error && !error.message.includes('no rows returned')) {
          console.log(`     Error: ${error.message}`);
        }
      } catch (err) {
        console.log(`   ${funcName}: ❓ CHECK FAILED - ${err.message}`);
      }
    }

    // 2. Test getting a sample tournament
    console.log('\n2️⃣ Looking for test tournament...');
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type')
      .or('tournament_type.eq.sabo_double_elimination,tournament_type.eq.double_elimination')
      .limit(1);

    if (tourError) {
      console.log(`❌ Error fetching tournaments: ${tourError.message}`);
      return;
    }

    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No test tournaments found');
      return;
    }

    const testTournament = tournaments[0];
    console.log(`✅ Found test tournament: ${testTournament.name} (${testTournament.tournament_type})`);

    // 3. Test SABO bracket generation (dry run)
    console.log('\n3️⃣ Testing SABO bracket generation...');
    try {
      const { data: result, error: bracketError } = await supabase.rpc(
        'generate_sabo_tournament_bracket',
        { 
          p_tournament_id: testTournament.id,
          p_seeding_method: 'registration_order'
        }
      );

      if (bracketError) {
        console.log(`❌ SABO function error: ${bracketError.message}`);
      } else {
        console.log('✅ SABO function call successful');
        console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ Exception calling SABO function: ${error.message}`);
    }

    console.log('\n🎯 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSABOFunctions();
