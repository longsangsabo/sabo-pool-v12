#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 DEBUGGING PLAYER LOADING...\n')

async function debugPlayerLoading() {
  try {
    // 1. Check if we have any tournaments
    console.log('🏆 1. Checking tournaments...')
    const { data: tournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name, status')
      .limit(5)

    if (tournError) {
      console.log('❌ Tournament error:', tournError)
      return
    }

    console.log('✅ Tournaments found:', tournaments.length)
    tournaments.forEach((t, i) => {
      console.log(`   ${i+1}. "${t.name}" (${t.id}) - ${t.status}`)
    })

    if (!tournaments.length) {
      console.log('❌ No tournaments found! Create one first.')
      return
    }

    const testTournamentId = tournaments[0].id

    // 2. Check tournament registrations
    console.log(`\n👥 2. Checking registrations for: ${testTournamentId}`)
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', testTournamentId)

    if (regError) {
      console.log('❌ Registration error:', regError)
    } else {
      console.log(`✅ Registrations found: ${registrations.length}`)
      registrations.forEach((reg, i) => {
        console.log(`   ${i+1}. User: ${reg.user_id} - Status: ${reg.registration_status}`)
      })

      if (!registrations.length) {
        console.log('❌ No registrations! Need to register players first.')
        return
      }
    }

    // 3. Check profiles table
    console.log('\n👤 3. Checking profiles...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)

    if (profileError) {
      console.log('❌ Profile error:', profileError)
    } else {
      console.log(`✅ Profiles found: ${profiles.length}`)
      profiles.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.full_name || 'No name'} (${p.user_id || p.id})`)
      })
    }

    // 4. Test the exact query from ClientSideDoubleElimination
    console.log('\n🔍 4. Testing ClientSideDoubleElimination query...')
    const { data: testQuery, error: testError } = await supabase
      .from('tournament_registrations')
      .select(`
        user_id,
        profiles:user_id (
          full_name,
          elo
        )
      `)
      .eq('tournament_id', testTournamentId)
      .eq('registration_status', 'confirmed')
      .limit(16)

    if (testError) {
      console.log('❌ Test query error:', testError)
      console.log('   Code:', testError.code)
      console.log('   Details:', testError.details)
      console.log('   Hint:', testError.hint)

      // Check if profiles relationship exists
      if (testError.message.includes('profiles')) {
        console.log('\n🔧 Checking foreign key relationship...')
        
        // Check what columns exist in tournament_registrations
        const { data: sample, error: sampleError } = await supabase
          .from('tournament_registrations')
          .select('*')
          .limit(1)

        if (!sampleError && sample.length) {
          console.log('📋 tournament_registrations columns:', Object.keys(sample[0]))
        }
      }
    } else {
      console.log('✅ Test query success:', testQuery?.length || 0, 'results')
      if (testQuery?.length) {
        console.log('   Sample result:', JSON.stringify(testQuery[0], null, 2))
      }
    }

  } catch (error) {
    console.log('💥 Debug error:', error.message)
  }
}

debugPlayerLoading()
