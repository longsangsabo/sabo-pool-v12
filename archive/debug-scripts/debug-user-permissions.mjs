#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 Checking user permissions for tournament_matches...\n')

async function checkUserPermissions() {
  try {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('❌ No authenticated user:', userError)
      return
    }
    
    console.log('👤 Current user ID:', user.id)

    // 2. Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, full_name')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Profile error:', profileError)
    } else {
      console.log('👤 User profile:', profile)
      console.log('🔒 Is Admin:', profile.is_admin)
    }

    // 3. Check tournaments created by user
    const { data: userTournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name, created_by, club_id')
      .eq('created_by', user.id)
    
    if (tournError) {
      console.log('❌ Tournament error:', tournError)
    } else {
      console.log('🏆 Tournaments created by user:', userTournaments.length)
      userTournaments.forEach((t, i) => {
        console.log(`   ${i+1}. "${t.name}" (${t.id})`)
      })
    }

    // 4. Check club ownership
    const { data: userClubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, name')
      .eq('user_id', user.id)
    
    if (clubError) {
      console.log('❌ Club error:', clubError)
    } else {
      console.log('🏢 Clubs owned by user:', userClubs.length)
      userClubs.forEach((c, i) => {
        console.log(`   ${i+1}. "${c.name}" (${c.id})`)
      })
    }

    // 5. Test insert permission on a real tournament
    if (userTournaments.length > 0) {
      const testTournamentId = userTournaments[0].id
      console.log(`\n🧪 Testing insert on tournament: ${testTournamentId}`)
      
      const testMatch = {
        tournament_id: testTournamentId,
        player1_id: user.id, // Use current user as dummy player
        player2_id: user.id,
        round_number: 999, // Dummy round to identify test
        match_number: 999,
        status: 'pending'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('tournament_matches')
        .insert([testMatch])
        .select()

      if (insertError) {
        console.log('❌ Insert still fails:', insertError.message)
        console.log('   Code:', insertError.code)
      } else {
        console.log('✅ Insert successful! Policy allows organizer.')
        
        // Clean up
        await supabase
          .from('tournament_matches')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🗑️ Test data cleaned')
      }
    } else {
      console.log('⚠️ No user tournaments found for testing')
    }

  } catch (error) {
    console.log('💥 General error:', error)
  }
}

checkUserPermissions()
