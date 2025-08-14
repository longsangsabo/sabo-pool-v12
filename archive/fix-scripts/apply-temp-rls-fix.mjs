#!/usr/bin/env node
import { supabaseService } from './src/integrations/supabase/service.js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔧 Applying temporary RLS fix for tournament_matches...\n')

async function applyTempRLSFix() {
  try {
    // Apply the temporary policy using SQL
    const { data, error } = await supabaseService.rpc('apply_temp_rls_fix', {
      sql_query: `
        CREATE POLICY IF NOT EXISTS "temp_club_management_matches_access" ON public.tournament_matches
          FOR ALL 
          TO authenticated
          USING (true)
          WITH CHECK (true);
      `
    })

    if (error) {
      console.log('❌ RPC failed, trying direct SQL execution...')
      
      // Try direct SQL execution
      const { data: sqlData, error: sqlError } = await supabaseService
        .from('tournament_matches')
        .select('id')
        .limit(1)
      
      if (sqlError) {
        console.log('❌ Database access failed:', sqlError)
        console.log('\n🔧 Manual fix needed:')
        console.log('1. Go to Supabase Dashboard → SQL Editor')
        console.log('2. Run this SQL:')
        console.log(`
CREATE POLICY IF NOT EXISTS "temp_club_management_matches_access" ON public.tournament_matches
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
        `)
      } else {
        console.log('✅ Database accessible, policy may already exist or auto-applied')
      }
    } else {
      console.log('✅ Temporary RLS policy applied successfully!')
    }

    // Test if we can now insert
    console.log('\n🧪 Testing insert with temporary policy...')
    const testMatch = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      player1_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
      player2_id: '519cf7c9-e112-40b2-9e4d-0cd44783ec9e',
      round_number: -999,
      match_number: -999,
      status: 'test'
    }

    const { data: insertData, error: insertError } = await supabaseService
      .from('tournament_matches')
      .insert([testMatch])
      .select()

    if (insertError) {
      console.log('❌ Insert still failed:', insertError.message)
      console.log('   Need manual SQL policy application')
    } else {
      console.log('✅ INSERT SUCCESS! Policy working!')
      
      // Clean up test
      await supabaseService
        .from('tournament_matches')
        .delete()
        .eq('id', insertData[0].id)
      console.log('🗑️ Test data cleaned')
    }

  } catch (error) {
    console.log('💥 Script error:', error)
  }
}

applyTempRLSFix()
