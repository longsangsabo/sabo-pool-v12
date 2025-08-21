#!/usr/bin/env node
import { TournamentMatchDBHandler } from './src/services/TournamentMatchDBHandler.js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 Testing TournamentMatchDBHandler with service role...\n')

async function testServiceRole() {
  try {
    // 1. Check table access
    console.log('📋 1. Checking table access...')
    const tableResult = await TournamentMatchDBHandler.checkTableStructure()
    console.log('Table check result:', tableResult.exists ? '✅ Success' : '❌ Failed')

    // 2. Test insert permission
    console.log('\n🧪 2. Testing insert permission...')
    const canInsert = await TournamentMatchDBHandler.testInsertPermission()
    console.log('Insert permission:', canInsert ? '✅ Success' : '❌ Failed')

    // 3. Test with real tournament data
    console.log('\n📊 3. Testing with sample matches...')
    const sampleMatches = [
      {
        tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f', // Real tournament from earlier
        player1_id: 'e411093e-144a-46c3-9def-37186c4ee6c8', // Real player from earlier  
        player2_id: '519cf7c9-e112-40b2-9e4d-0cd44783ec9e', // Real player from earlier
        round_number: 1,
        match_number: 1,
        status: 'scheduled'
      },
      {
        tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
        player1_id: 'd7d6ce12-490f-4fff-b913-80044de5e169',
        player2_id: '4bedc2fd-a85d-483d-80e5-c9541d6ecdc2', 
        round_number: 1,
        match_number: 2,
        status: 'scheduled'
      }
    ];

    const savedCount = await TournamentMatchDBHandler.saveMatchesSafely(
      sampleMatches,
      'f2aa6977-4797-4770-af4b-92ee3856781f'
    )

    console.log(`\n🎯 Final result: ${savedCount}/${sampleMatches.length} matches saved`)
    
    if (savedCount === sampleMatches.length) {
      console.log('🎉 SUCCESS! Service role bypassed RLS correctly.')
    } else {
      console.log('⚠️ PARTIAL SUCCESS: Some matches saved but not all.')
    }

  } catch (error) {
    console.log('💥 Test failed:', error)
  }
}

testServiceRole()
