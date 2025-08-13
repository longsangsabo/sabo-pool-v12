#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 DEBUGGING TOURNAMENT_MATCHES SCHEMA & DATA...\n')

async function debugSchema() {
  try {
    // 1. Check exact table structure
    console.log('📋 1. Checking tournament_matches columns...')
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Select error:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ Existing columns:', Object.keys(data[0]))
    } else {
      console.log('📋 Table empty, getting schema info...')
      
      // Try to get schema via info query
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'tournament_matches' })
        .catch(() => ({ data: null, error: 'RPC not available' }))
      
      if (schemaError) {
        console.log('⚠️ Cannot get schema via RPC')
      } else {
        console.log('📋 Schema:', schemaData)
      }
    }

    // 2. Test simple insert with minimal data
    console.log('\n🧪 2. Testing minimal insert...')
    const minimalMatch = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      round_number: 1,
      match_number: 1,
      status: 'scheduled'
    }

    console.log('🧪 Test data:', JSON.stringify(minimalMatch, null, 2))

    const { data: insertData, error: insertError } = await supabase
      .from('tournament_matches')
      .insert([minimalMatch])
      .select()

    if (insertError) {
      console.log('❌ Insert error:', insertError)
      console.log('   Code:', insertError.code)
      console.log('   Details:', insertError.details)
      console.log('   Hint:', insertError.hint)
    } else {
      console.log('✅ Insert success:', insertData)
      
      // Clean up
      if (insertData && insertData.length > 0) {
        await supabase
          .from('tournament_matches')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🗑️ Test data cleaned')
      }
    }

    // 3. Check what ClientSideDoubleElimination is trying to insert
    console.log('\n📊 3. Sample match data from bracket generation:')
    const sampleMatchFromBracket = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      player1_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
      player2_id: '519cf7c9-e112-40b2-9e4d-0cd44783ec9e',
      round_number: 1,
      match_number: 1,
      winner_id: null,
      status: 'scheduled',
      score_player1: null,
      score_player2: null,
      bracket_type: 'winner',
      next_match_id: null
    }

    console.log('🧪 Bracket data:', JSON.stringify(sampleMatchFromBracket, null, 2))

    const { data: bracketInsert, error: bracketError } = await supabase
      .from('tournament_matches')
      .insert([sampleMatchFromBracket])
      .select()

    if (bracketError) {
      console.log('❌ Bracket insert error:', bracketError)
      console.log('   This is likely the same error SABO bracket gets!')
    } else {
      console.log('✅ Bracket insert success:', bracketInsert)
      
      // Clean up
      if (bracketInsert && bracketInsert.length > 0) {
        await supabase
          .from('tournament_matches')
          .delete()
          .eq('id', bracketInsert[0].id)
        console.log('🗑️ Bracket test data cleaned')
      }
    }

    // 4. Check RLS status
    console.log('\n🔒 4. Checking RLS status...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'tournament_matches' })
      .catch(() => ({ data: null, error: 'RPC not available' }))
    
    if (rlsError) {
      console.log('⚠️ Cannot check RLS status')
    } else {
      console.log('🔒 RLS Status:', rlsStatus)
    }

  } catch (error) {
    console.log('💥 Debug error:', error)
  }
}

debugSchema()
