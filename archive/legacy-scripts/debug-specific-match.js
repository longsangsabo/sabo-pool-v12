#!/usr/bin/env node

// Debug the specific match causing the error
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugSpecificMatch() {
  console.log('🔍 Debugging specific match from error log...\n');

  // The match ID from the error: 1603275b-61d9-44a4-b58c-052a74a87ce9
  const errorMatchId = '1603275b-61d9-44a4-b58c-052a74a87ce9';

  try {
    // 1. Get the specific match data
    console.log('📋 1. Getting match data for:', errorMatchId);
    
    const { data: matchData, error: matchError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('id', errorMatchId)
      .single();

    if (matchError) {
      console.error('❌ Error getting match data:', matchError);
      return;
    }

    console.log('✅ Match data found:');
    console.log(JSON.stringify(matchData, null, 2));

    // 2. Try the exact UPDATE that's failing
    console.log('\n📋 2. Testing the exact UPDATE operation...');
    
    // Simulate the frontend update with exact same structure
    const testUpdate = {
      score_player1: 5,
      score_player2: 3,
      winner_id: matchData.player1_id,
      loser_id: matchData.player2_id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🧪 Update payload:', testUpdate);

    const { data: updateResult, error: updateError } = await supabase
      .from('tournament_matches')
      .update(testUpdate)
      .eq('id', errorMatchId)
      .select();

    if (updateError) {
      console.error('❌ UPDATE Error reproduced:', updateError);
      console.log('\n🔍 Error details:');
      console.log('  Code:', updateError.code);
      console.log('  Message:', updateError.message);
      console.log('  Details:', updateError.details);
      console.log('  Hint:', updateError.hint);
      
      // This is likely the CASE statement error!
      if (updateError.message.includes('case not found') || updateError.hint?.includes('CASE statement')) {
        console.log('\n🎯 FOUND THE ISSUE! This is the CASE statement error.');
        console.log('💡 There might be a trigger or RLS policy with incomplete CASE logic.');
      }
      
    } else {
      console.log('✅ UPDATE successful:', updateResult);
      console.log('🤔 Hmm, the update worked here. The error might be context-specific.');
    }

    // 3. Check if there are any specific RLS policies or triggers for this match
    console.log('\n📋 3. Checking for context-specific issues...');
    
    // Try with different user contexts
    console.log('🔐 Testing with anonymous user context...');
    
    // Create anonymous client (like frontend)
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const { data: anonResult, error: anonError } = await anonClient
      .from('tournament_matches')
      .update({
        score_player1: 7,
        score_player2: 4,
        winner_id: matchData.player1_id,
        status: 'completed'
      })
      .eq('id', errorMatchId)
      .select();

    if (anonError) {
      console.error('❌ Anonymous user UPDATE Error:', anonError);
      console.log('🎯 This might be the context where the CASE error occurs!');
    } else {
      console.log('✅ Anonymous user UPDATE successful');
    }

    // 4. Check tournament status and context
    console.log('\n📋 4. Checking tournament context...');
    
    const { data: tournamentData, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', matchData.tournament_id)
      .single();

    if (tournamentError) {
      console.error('❌ Tournament data error:', tournamentError);
    } else {
      console.log('✅ Tournament context:');
      console.log(`  Status: ${tournamentData.status}`);
      console.log(`  Type: ${tournamentData.tournament_type}`);
      console.log(`  Format: ${tournamentData.format}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error during specific match debug:', error);
  }
}

// Run the specific match debug
debugSpecificMatch().then(() => {
  console.log('\n🎯 Specific match debugging completed!');
}).catch(error => {
  console.error('❌ Failed to debug specific match:', error);
});
