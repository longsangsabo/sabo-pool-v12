#!/usr/bin/env node

// Debug script to check database triggers and functions
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

async function checkDatabaseTriggers() {
  console.log('🔍 Checking database triggers and functions...\n');

  try {
    // 1. Check triggers on tournament_matches table
    console.log('📋 1. Checking triggers on tournament_matches table:');
    const { data: triggers, error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            t.trigger_name,
            t.event_manipulation,
            t.trigger_schema,
            t.trigger_catalog,
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
          FROM information_schema.triggers t
          LEFT JOIN pg_proc p ON p.proname = regexp_replace(t.action_statement, '.*EXECUTE FUNCTION ([^(]+).*', '\\1')
          WHERE t.event_object_table = 'tournament_matches'
          AND t.trigger_schema = 'public';
        `
      });

    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError);
    } else {
      console.log('✅ Triggers found:', JSON.stringify(triggers, null, 2));
    }

    // 2. Check functions with CASE statements
    console.log('\n📋 2. Checking functions with CASE statements:');
    const { data: functions, error: functionError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_functiondef(p.oid) as function_definition
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE pg_get_functiondef(p.oid) ILIKE '%CASE%'
          AND (
            pg_get_functiondef(p.oid) ILIKE '%tournament_matches%'
            OR pg_get_functiondef(p.oid) ILIKE '%sabo%'
            OR p.proname ILIKE '%tournament%'
            OR p.proname ILIKE '%sabo%'
          )
          AND n.nspname = 'public';
        `
      });

    if (functionError) {
      console.error('❌ Error checking functions:', functionError);
    } else {
      console.log('✅ Functions with CASE statements:', JSON.stringify(functions, null, 2));
    }

    // 3. Check recent changes to tournament_matches
    console.log('\n📋 3. Checking recent updates to tournament_matches:');
    const { data: recentMatches, error: matchError } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, status, score_player1, score_player2, winner_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (matchError) {
      console.error('❌ Error checking recent matches:', matchError);
    } else {
      console.log('✅ Recent tournament matches:');
      recentMatches?.forEach(match => {
        console.log(`  - Match ${match.id.substring(0,8)}: ${match.status}, scores: ${match.score_player1}-${match.score_player2}, updated: ${match.updated_at}`);
      });
    }

    // 4. Test a safe SELECT query to see if basic operations work
    console.log('\n📋 4. Testing basic database connectivity:');
    const { data: testData, error: testError } = await supabase
      .from('tournament_matches')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connectivity error:', testError);
    } else {
      console.log('✅ Database connectivity OK');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkDatabaseTriggers().then(() => {
  console.log('\n🎯 Database check completed!');
}).catch(error => {
  console.error('❌ Failed to check database:', error);
});
