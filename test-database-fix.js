#!/usr/bin/env node

/**
 * Test script to verify database relationship fixes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODQzNzksImV4cCI6MjA1MDI2MDM3OX0.sLMN24d_aSVhqQ1fWHp8kq1YWixJQoRgz9-dO9_gT8k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnections() {
  console.log('🔍 Testing database relationships and connections...\n');

  // Test 1: Basic matches table query
  console.log('1. Testing basic matches table query...');
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Matches table error:', error);
    } else {
      console.log('✅ Matches table accessible:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.error('❌ Matches table exception:', err);
  }

  // Test 2: Profiles table query
  console.log('\n2. Testing profiles table query...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name')
      .limit(5);
    
    if (error) {
      console.error('❌ Profiles table error:', error);
    } else {
      console.log('✅ Profiles table accessible:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.error('❌ Profiles table exception:', err);
  }

  // Test 3: Club profiles query (the 406 error)
  console.log('\n3. Testing club_profiles table query...');
  try {
    const { data, error } = await supabase
      .from('club_profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Club profiles table error:', error);
    } else {
      console.log('✅ Club profiles table accessible:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.error('❌ Club profiles table exception:', err);
  }

  // Test 4: Tournament matches table
  console.log('\n4. Testing tournament_matches table query...');
  try {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Tournament matches table error:', error);
    } else {
      console.log('✅ Tournament matches table accessible:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.error('❌ Tournament matches table exception:', err);
  }

  // Test 5: Test new separate query approach for matches
  console.log('\n5. Testing manual relationship query (matches + profiles)...');
  try {
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .limit(3);

    if (matchError) {
      console.error('❌ Matches query error:', matchError);
      return;
    }

    if (matches && matches.length > 0) {
      const playerIds = new Set();
      matches.forEach(match => {
        if (match.player1_id) playerIds.add(match.player1_id);
        if (match.player2_id) playerIds.add(match.player2_id);
      });

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, avatar_url')
        .in('user_id', Array.from(playerIds));

      if (profileError) {
        console.error('❌ Profiles relationship query error:', profileError);
      } else {
        console.log('✅ Manual relationship query successful');
        console.log(`   - ${matches.length} matches found`);
        console.log(`   - ${profiles?.length || 0} player profiles found`);
        console.log(`   - ${playerIds.size} unique player IDs in matches`);
      }
    } else {
      console.log('⚠️  No matches found to test relationships');
    }
  } catch (err) {
    console.error('❌ Manual relationship query exception:', err);
  }

  console.log('\n🏁 Database relationship test completed');
}

// Run the test
testDatabaseConnections().catch(console.error);
