#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugDuplicateChallenge() {
  console.log('🔍 Debugging duplicate challenge match constraint...\n');
  
  try {
    // 1. Check recent challenges
    console.log('📊 Recent challenges:');
    const { data: challenges, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (challengeError) {
      console.error('❌ Error fetching challenges:', challengeError);
      return;
    }
    
    challenges.forEach(challenge => {
      console.log(`  Challenge ${challenge.id}:`);
      console.log(`    Status: ${challenge.status}`);
      console.log(`    Challenger: ${challenge.challenger_id}`);
      console.log(`    Opponent: ${challenge.opponent_id || 'None'}`);
      console.log(`    Created: ${challenge.created_at}`);
      console.log('');
    });
    
    // 2. Check matches with challenge_id
    console.log('🎯 Matches with challenge_id:');
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .not('challenge_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (matchError) {
      console.error('❌ Error fetching matches:', matchError);
      return;
    }
    
    matches.forEach(match => {
      console.log(`  Match ${match.id}:`);
      console.log(`    Challenge ID: ${match.challenge_id}`);
      console.log(`    Status: ${match.status}`);
      console.log(`    Player1: ${match.player1_id}`);
      console.log(`    Player2: ${match.player2_id}`);
      console.log(`    Created: ${match.created_at}`);
      console.log('');
    });
    
    // 3. Check for duplicates
    console.log('🔍 Checking for duplicate challenge_id in matches:');
    const { data: duplicates, error: dupError } = await supabase
      .rpc('get_duplicate_challenge_matches');
      
    if (dupError) {
      console.log('ℹ️  Custom function not available, checking manually...');
      
      // Manual check for duplicates
      const challengeIdCounts = {};
      matches.forEach(match => {
        if (match.challenge_id) {
          challengeIdCounts[match.challenge_id] = (challengeIdCounts[match.challenge_id] || 0) + 1;
        }
      });
      
      const duplicateIds = Object.keys(challengeIdCounts).filter(id => challengeIdCounts[id] > 1);
      
      if (duplicateIds.length > 0) {
        console.log('❌ Found duplicate challenge_ids:');
        duplicateIds.forEach(id => {
          console.log(`  Challenge ID ${id}: ${challengeIdCounts[id]} matches`);
        });
      } else {
        console.log('✅ No duplicates found in recent matches');
      }
    } else {
      console.log('Duplicates found:', duplicates);
    }
    
    // 4. Check constraint
    console.log('📋 Checking unique_challenge_match constraint:');
    const { data: constraints, error: constraintError } = await supabase
      .rpc('check_table_constraints', { table_name: 'matches' });
      
    if (constraintError) {
      console.log('ℹ️  Custom constraint check not available');
    } else {
      console.log('Constraints:', constraints);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

// Run if this file is executed directly
debugDuplicateChallenge().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
