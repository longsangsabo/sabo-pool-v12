#!/usr/bin/env node

// Enhanced debug script with direct SQL queries
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

async function checkDatabaseIssues() {
  console.log('🔍 Enhanced database diagnostics...\n');

  try {
    // 1. Try to simulate the failing update
    console.log('📋 1. Testing UPDATE on tournament_matches (simulating the error):');
    
    // Get a sample match to test
    const { data: sampleMatch, error: sampleError } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, player1_id, player2_id, status')
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error getting sample match:', sampleError);
      return;
    }

    console.log(`✅ Sample match found: ${sampleMatch.id.substring(0,8)}`);

    // Try the same update that's failing
    console.log('🧪 Testing UPDATE query that might be causing the error...');
    
    const { data: updateTest, error: updateError } = await supabase
      .from('tournament_matches')
      .update({
        score_player1: 5,
        score_player2: 3,
        winner_id: sampleMatch.player1_id,
        loser_id: sampleMatch.player2_id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sampleMatch.id)
      .select();

    if (updateError) {
      console.error('❌ UPDATE Error found:', updateError);
      console.log('📝 This might be the source of the CASE statement error!');
      
      // Check if there are any triggers or functions causing this
      console.log('\n📋 2. Checking for problematic triggers or RLS policies...');
      
    } else {
      console.log('✅ UPDATE successful:', updateTest);
      
      // Revert the test change
      await supabase
        .from('tournament_matches')
        .update({
          score_player1: 0,
          score_player2: 0,
          winner_id: null,
          loser_id: null,
          status: 'pending',
          completed_at: null
        })
        .eq('id', sampleMatch.id);
      console.log('🔄 Test changes reverted');
    }

    // 3. Check for any custom functions that might contain CASE without ELSE
    console.log('\n📋 3. Checking database schema for functions and triggers:');
    
    // Use a more direct approach to check functions
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_schema_info');

    if (schemaError) {
      console.log('ℹ️ get_schema_info not available, trying alternative approach...');
      
      // Try to check RLS policies
      const { data: policies, error: policyError } = await supabase
        .from('tournament_matches')
        .select('*')
        .limit(0); // Just check if RLS allows SELECT
        
      if (policyError) {
        console.error('❌ RLS Policy error:', policyError);
      } else {
        console.log('✅ RLS policies seem OK for SELECT');
      }
    } else {
      console.log('✅ Schema info:', schemaInfo);
    }

    // 4. Check if there are any tournament-related functions
    console.log('\n📋 4. Checking for tournament-related stored procedures...');
    
    // Try to call any sabo-related functions to see if they exist
    const functionsToTest = [
      'advance_double_elimination_match',
      'sabo_advance_match',
      'update_tournament_status',
      'handle_tournament_match_completion'
    ];

    for (const funcName of functionsToTest) {
      try {
        // Just check if function exists by trying to call it with invalid params
        const { error } = await supabase.rpc(funcName, {});
        if (error) {
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log(`  - ${funcName}: Not found`);
          } else {
            console.log(`  - ${funcName}: Exists (error: ${error.message.substring(0,50)}...)`);
          }
        }
      } catch (err) {
        console.log(`  - ${funcName}: Error checking`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
  }
}

// Run the enhanced check
checkDatabaseIssues().then(() => {
  console.log('\n🎯 Enhanced database diagnostics completed!');
}).catch(error => {
  console.error('❌ Failed to run diagnostics:', error);
});
