#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 Debugging UUID format issues...\n')

async function debugUUIDIssues() {
  try {
    // 1. Check tournament registrations format
    console.log('📋 1. Checking tournament_registrations user_id format...')
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('user_id, tournament_id')
      .limit(5)
    
    if (regError) {
      console.log('❌ Registration error:', regError)
    } else {
      console.log('✅ Sample registration data:')
      registrations.forEach((reg, i) => {
        console.log(`   ${i+1}. user_id: "${reg.user_id}" (type: ${typeof reg.user_id}, length: ${reg.user_id?.length})`)
        console.log(`      tournament_id: "${reg.tournament_id}" (type: ${typeof reg.tournament_id}, length: ${reg.tournament_id?.length})`)
      })
    }

    // 2. Check tournaments format
    console.log('\n🏆 2. Checking tournaments id format...')
    const { data: tournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(5)
    
    if (tournError) {
      console.log('❌ Tournament error:', tournError)
    } else {
      console.log('✅ Sample tournament data:')
      tournaments.forEach((tourn, i) => {
        console.log(`   ${i+1}. id: "${tourn.id}" (type: ${typeof tourn.id}, length: ${tourn.id?.length})`)
        console.log(`      name: "${tourn.name}"`)
      })
    }

    // 3. Test valid UUID insert
    console.log('\n✏️ 3. Testing with real UUID data...')
    
    if (registrations && registrations.length >= 2 && tournaments && tournaments.length >= 1) {
      const testMatch = {
        tournament_id: tournaments[0].id,
        player1_id: registrations[0].user_id,
        player2_id: registrations[1].user_id,
        round_number: 1,
        match_number: 1,
        status: 'pending'
      }

      console.log('🧪 Test match data:', JSON.stringify(testMatch, null, 2))

      const { data: insertData, error: insertError } = await supabase
        .from('tournament_matches')
        .insert([testMatch])
        .select()

      if (insertError) {
        console.log('❌ Real UUID insert error:', insertError)
        console.log('   Error details:', JSON.stringify(insertError, null, 2))
      } else {
        console.log('✅ Real UUID insert successful:', insertData)
        
        // Clean up
        console.log('🗑️ Cleaning up test data...')
        await supabase
          .from('tournament_matches')
          .delete()
          .eq('id', insertData[0].id)
        console.log('✅ Test data cleaned')
      }
    } else {
      console.log('⚠️ Not enough sample data for real UUID test')
    }

    // 4. Check if UUID validation function exists
    console.log('\n🔧 4. Testing UUID validation...')
    const testUUIDs = [
      'test-player-1', // Invalid
      '123e4567-e89b-12d3-a456-426614174000', // Valid
      null, // Null
      '12345', // Invalid
    ]

    testUUIDs.forEach(uuid => {
      const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
      console.log(`   "${uuid}" → ${isValid ? '✅ Valid' : '❌ Invalid'} UUID`)
    })

  } catch (error) {
    console.log('💥 General error:', error)
  }
}

debugUUIDIssues()
