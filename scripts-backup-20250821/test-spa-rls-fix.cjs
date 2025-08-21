require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 TESTING RLS FIX FOR SPA TRANSACTIONS')
console.log('=====================================')

async function testRLSFix() {
  // Service role client
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  
  // Anon client (simulating UI)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  try {
    console.log('\n1. 📋 Checking current RLS policies...')
    const { data: policies, error: policyError } = await serviceClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'spa_transactions')
    
    if (policyError) {
      console.log('❌ Error checking policies:', policyError.message)
    } else {
      console.log(`✅ Found ${policies.length} RLS policies for spa_transactions`)
      policies.forEach(p => {
        console.log(`   - ${p.policyname}: ${p.cmd} for ${p.roles}`)
      })
    }

    console.log('\n2. 🎯 Testing BOSA user transaction visibility...')
    
    // Get BOSA user ID first
    const { data: bosaUser, error: bosaError } = await serviceClient
      .from('users')
      .select('id')
      .eq('username', 'BOSA')
      .single()
    
    if (bosaError || !bosaUser) {
      console.log('❌ Could not find BOSA user')
      return
    }
    
    const bosaUserId = bosaUser.id
    console.log(`📋 BOSA user ID: ${bosaUserId}`)

    // Test with service role (should work)
    const { data: serviceTransactions, error: serviceError } = await serviceClient
      .from('spa_transactions')
      .select('*')
      .eq('user_id', bosaUserId)
    
    console.log(`✅ Service role sees: ${serviceTransactions?.length || 0} transactions`)

    // Test simulating authenticated user (need to create a mock JWT or use actual auth)
    // For now, we'll check if RLS is properly configured
    console.log('\n3. 🔍 Testing anon access (should be blocked)...')
    const { data: anonTransactions, error: anonError } = await anonClient
      .from('spa_transactions')
      .select('*')
      .eq('user_id', bosaUserId)
    
    if (anonError) {
      console.log('✅ Anon access properly blocked:', anonError.message)
    } else {
      console.log(`⚠️  Anon can see ${anonTransactions?.length || 0} transactions (unexpected)`)
    }

    console.log('\n4. 📊 Checking if RLS is enabled...')
    const { data: tableInfo, error: tableError } = await serviceClient
      .rpc('pg_get_table_security', { table_name: 'spa_transactions' })
    
    if (tableError) {
      console.log('❌ Error checking table security:', tableError.message)
    }

    console.log('\n📋 NEXT STEPS:')
    console.log('===============')
    console.log('1. Run fix-spa-transactions-rls.sql on Supabase')
    console.log('2. Test with actual authenticated user in UI')
    console.log('3. Verify users can see their own transactions')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testRLSFix()
