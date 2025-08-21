require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 TESTING RLS POLICIES & SPA TRANSACTION ACCESS')
console.log('==============================================')

async function testRLSAccess() {
  // Service role client
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  
  // Anon client (simulating UI)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  try {
    console.log('\n1. 🎯 Finding test user...')
    
    // Find any user with SPA points
    const { data: testUser, error: userError } = await serviceClient
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0)
      .limit(1)
      .single()
    
    if (userError || !testUser) {
      console.log('❌ Could not find test user with SPA points')
      return
    }
    
    const testUserId = testUser.user_id
    console.log(`📋 Test user ID: ${testUserId.substring(0, 8)}... (${testUser.spa_points} SPA)`)

    console.log('\n2. 📊 Testing transaction access...')
    
    // Test with service role (should work)
    const { data: serviceTransactions, error: serviceError } = await serviceClient
      .from('spa_transactions')
      .select('*')
      .eq('user_id', testUserId)
    
    if (serviceError) {
      console.log('❌ Service role error:', serviceError.message)
    } else {
      console.log(`✅ Service role sees: ${serviceTransactions?.length || 0} transactions`)
      if (serviceTransactions?.length > 0) {
        console.log(`   Latest: +${serviceTransactions[0].points_change} SPA (${serviceTransactions[0].description})`)
      }
    }

    // Test with anon key (should be blocked)
    console.log('\n3. 🔒 Testing anon access (should be blocked)...')
    const { data: anonTransactions, error: anonError } = await anonClient
      .from('spa_transactions')
      .select('*')
      .eq('user_id', testUserId)
    
    if (anonError) {
      console.log('✅ Anon access properly blocked:', anonError.message)
    } else {
      console.log(`⚠️  Anon can see ${anonTransactions?.length || 0} transactions (RLS not working)`)
    }

    console.log('\n4. 🔍 Testing general anon query...')
    const { data: allAnonTransactions, error: allAnonError } = await anonClient
      .from('spa_transactions')
      .select('*')
      .limit(5)
    
    if (allAnonError) {
      console.log('✅ Anon general query blocked:', allAnonError.message)
    } else {
      console.log(`⚠️  Anon can see ${allAnonTransactions?.length || 0} transactions total`)
    }

    console.log('\n📋 DIAGNOSIS:')
    console.log('=============')
    if (serviceTransactions?.length > 0 && anonError) {
      console.log('✅ RLS is working correctly!')
      console.log('   - Service role can access transactions')
      console.log('   - Anon access is blocked')
      console.log('   - Users need to be authenticated to see their own transactions')
    } else if (serviceTransactions?.length > 0 && !anonError) {
      console.log('❌ RLS is NOT working!')
      console.log('   - Need to run fix-spa-transactions-rls.sql')
    } else {
      console.log('⚠️  No transaction data found - check if migration was successful')
    }

    console.log('\n🔧 NEXT STEPS:')
    console.log('==============')
    console.log('1. If RLS not working: Run fix-spa-transactions-rls.sql on Supabase')
    console.log('2. Test with authenticated user in actual UI')
    console.log('3. Verify authenticated users can see their own transaction history')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testRLSAccess()
