#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🧪 TESTING FIXED MATCH DATA...\n')

async function testFixedMatch() {
  try {
    // Test fixed match data format (without next_match_id)
    const fixedMatch = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      player1_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
      player2_id: '519cf7c9-e112-40b2-9e4d-0cd44783ec9e',
      round_number: 1,
      match_number: 1,
      winner_id: null,
      status: 'pending', // Changed from 'scheduled'
      score_player1: 0,
      score_player2: 0,
      bracket_type: 'winner'
      // Removed: next_match_id, created_at, updated_at
    }

    console.log('🧪 Fixed match data:', JSON.stringify(fixedMatch, null, 2))

    const { data, error } = await supabase
      .from('tournament_matches')
      .insert([fixedMatch])
      .select()

    if (error) {
      console.log('❌ Still failed:', error.message)
      console.log('   Code:', error.code)
    } else {
      console.log('✅ SUCCESS! Fixed match insert works!')
      console.log('   Inserted:', data)
      
      // Clean up
      await supabase.from('tournament_matches').delete().eq('id', data[0].id)
      console.log('🗑️ Test data cleaned')
    }

  } catch (error) {
    console.log('💥 Error:', error.message)
  }
}

testFixedMatch()
