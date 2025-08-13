#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 Debugging tournament_matches table...\n')

async function debugTournamentMatches() {
  try {
    // 1. Check table structure
    console.log('📋 1. Checking table structure...')
    const { data: columns, error: schemaError } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1)
    
    if (schemaError) {
      console.log('❌ Schema error:', schemaError)
      return
    }
    console.log('✅ Table exists, sample structure:', Object.keys(columns[0] || {}))

    // 2. Check permissions - try to read
    console.log('\n📖 2. Testing READ permission...')
    const { data: readData, error: readError } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.log('❌ Read error:', readError)
    } else {
      console.log('✅ Read successful:', readData.length, 'rows')
    }

    // 3. Check permissions - try to insert test data
    console.log('\n✏️ 3. Testing INSERT permission...')
    const testMatch = {
      tournament_id: 'test-tournament',
      player1_id: 'test-player-1',
      player2_id: 'test-player-2',
      round_number: 1,
      match_number: 1,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('tournament_matches')
      .insert([testMatch])
      .select()

    if (insertError) {
      console.log('❌ Insert error:', insertError)
      console.log('   Error details:', JSON.stringify(insertError, null, 2))
    } else {
      console.log('✅ Insert successful:', insertData)
      
      // Clean up test data
      console.log('\n🗑️ Cleaning up test data...')
      const { error: deleteError } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', 'test-tournament')
      
      if (deleteError) {
        console.log('⚠️ Delete error (test data may remain):', deleteError)
      } else {
        console.log('✅ Test data cleaned up')
      }
    }

    // 4. Check RLS policies
    console.log('\n🔒 4. Checking RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'tournament_matches' })
      .catch(() => null)
    
    if (policyError) {
      console.log('⚠️ Cannot check policies (may need admin access)')
    } else {
      console.log('📜 RLS policies:', policies)
    }

  } catch (error) {
    console.log('💥 General error:', error)
  }
}

// Run debug
debugTournamentMatches()
