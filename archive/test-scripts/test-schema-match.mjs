#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 TESTING EXACT SCHEMA MATCH...\n')

async function testSchemaMatch() {
  try {
    // Test 1: Minimal required fields based on schema
    console.log('🧪 Test 1: Minimal required fields...')
    const minimalTest = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      round_number: 1,
      match_number: 1
      // All other fields have defaults or nullable
    }

    console.log('Data:', JSON.stringify(minimalTest, null, 2))

    const { data: test1, error: error1 } = await supabase
      .from('tournament_matches')
      .insert([minimalTest])
      .select()

    if (error1) {
      console.log('❌ Test 1 failed:', error1.message)
      console.log('   Code:', error1.code)
      console.log('   Details:', error1.details)
    } else {
      console.log('✅ Test 1 success! Minimal insert works')
      
      // Clean up
      await supabase.from('tournament_matches').delete().eq('id', test1[0].id)
    }

    // Test 2: Full bracket data format
    console.log('\n🧪 Test 2: Full bracket format...')
    const bracketTest = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      round_number: 1,
      match_number: 1,
      bracket_type: 'winner',
      player1_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
      player2_id: '519cf7c9-e112-40b2-9e4d-0cd44783ec9e',
      status: 'pending',
      score_player1: 0,
      score_player2: 0,
      winner_id: null
    }

    console.log('Data:', JSON.stringify(bracketTest, null, 2))

    const { data: test2, error: error2 } = await supabase
      .from('tournament_matches')
      .insert([bracketTest])
      .select()

    if (error2) {
      console.log('❌ Test 2 failed:', error2.message)
      console.log('   Code:', error2.code)
      console.log('   Details:', error2.details)
      
      // Check specific field issues
      if (error2.message.includes('constraint')) {
        console.log('🔍 Possible constraint violation:')
        console.log('   - tournament_id exists?')
        console.log('   - player_id format correct?')
        console.log('   - status value allowed?')
      }
    } else {
      console.log('✅ Test 2 success! Full bracket insert works')
      
      // Clean up
      await supabase.from('tournament_matches').delete().eq('id', test2[0].id)
    }

    // Test 3: Check what's actually in ClientSideDoubleElimination
    console.log('\n📋 Test 3: Check ClientSideDoubleElimination match format...')
    
    // This simulates what the actual bracket generator creates
    const clientSideMatch = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      player1_id: null, // This might be the issue!
      player2_id: null,
      round_number: 1,
      match_number: 1,
      winner_id: null,
      status: 'scheduled', // Different from 'pending'?
      score_player1: null,
      score_player2: null,
      bracket_type: 'winner',
      next_match_id: null // This field might not exist in schema!
    }

    console.log('Data:', JSON.stringify(clientSideMatch, null, 2))

    const { data: test3, error: error3 } = await supabase
      .from('tournament_matches')
      .insert([clientSideMatch])
      .select()

    if (error3) {
      console.log('❌ Test 3 failed:', error3.message)
      console.log('   This is likely the EXACT error SABO bracket gets!')
      console.log('   Code:', error3.code)
      console.log('   Details:', error3.details)
      
      if (error3.message.includes('next_match_id')) {
        console.log('🎯 FOUND IT! next_match_id field does not exist in schema!')
      }
      if (error3.message.includes('scheduled')) {
        console.log('🎯 FOUND IT! scheduled status not allowed!')
      }
    } else {
      console.log('✅ Test 3 success')
      await supabase.from('tournament_matches').delete().eq('id', test3[0].id)
    }

  } catch (error) {
    console.log('💥 Test error:', error.message)
  }
}

testSchemaMatch()
