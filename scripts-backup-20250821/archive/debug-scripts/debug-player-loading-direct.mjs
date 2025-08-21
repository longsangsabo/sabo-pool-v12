#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 DEBUGGING PLAYER LOADING DIRECTLY...\n')

async function debugPlayerLoading() {
  try {
    // 1. Find tournament với players
    console.log('🏆 1. Finding tournaments with registrations...')
    const { data: tournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name, status')
      .limit(10)
    
    if (tournError) {
      console.log('❌ Tournament query failed:', tournError)
      return
    }
    
    console.log(`Found ${tournaments.length} tournaments:`)
    tournaments.forEach((t, i) => {
      console.log(`   ${i+1}. ${t.name} (${t.id}) - ${t.status}`)
    })

    // 2. Check registrations for each tournament
    for (const tournament of tournaments.slice(0, 3)) {
      console.log(`\n📋 Checking registrations for: ${tournament.name}`)
      
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('user_id, registration_status')
        .eq('tournament_id', tournament.id)
      
      if (regError) {
        console.log(`❌ Registration query failed:`, regError)
        continue
      }
      
      console.log(`   Found ${registrations.length} registrations`)
      const confirmed = registrations.filter(r => r.registration_status === 'confirmed')
      console.log(`   Confirmed: ${confirmed.length}`)
      
      if (confirmed.length > 0) {
        // Test original query like ClientSideDoubleElimination
        console.log(`\n🧪 Testing original query for tournament: ${tournament.id}`)
        
        const { data: originalResult, error: originalError } = await supabase
          .from('tournament_registrations')
          .select(`
            user_id,
            profiles:user_id (
              full_name,
              elo
            )
          `)
          .eq('tournament_id', tournament.id)
          .eq('registration_status', 'confirmed')
          .limit(16)

        if (originalError) {
          console.log('❌ Original query failed:', originalError)
          console.log('   Code:', originalError.code)
          console.log('   Details:', originalError.details)
          
          // Try alternative query
          console.log('\n🔄 Trying alternative query...')
          const { data: altResult, error: altError } = await supabase
            .from('tournament_registrations')
            .select('user_id')
            .eq('tournament_id', tournament.id)
            .eq('registration_status', 'confirmed')
          
          if (altError) {
            console.log('❌ Alternative query also failed:', altError)
          } else {
            console.log('✅ Alternative query worked:', altResult.length, 'players')
            
            // Try to get profiles separately
            if (altResult.length > 0) {
              const userIds = altResult.map(r => r.user_id)
              const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('user_id, full_name, elo')
                .in('user_id', userIds)
              
              if (profileError) {
                console.log('❌ Profiles query failed:', profileError)
              } else {
                console.log('✅ Profiles query worked:', profiles.length, 'profiles')
                console.log('🎯 SOLUTION: Use separate queries!')
                return
              }
            }
          }
        } else {
          console.log('✅ Original query worked:', originalResult.length, 'players')
          console.log('🎯 Players loaded successfully!')
          return
        }
      }
    }

  } catch (error) {
    console.log('💥 Debug error:', error)
  }
}

debugPlayerLoading()
