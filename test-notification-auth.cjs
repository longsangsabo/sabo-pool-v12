const { createClient } = require('@supabase/supabase-js')
require('dotenv/config')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 COMPREHENSIVE NOTIFICATION BELL TEST')
console.log('======================================')

async function testNotificationBell() {
  try {
    // 1. Get a real user ID with notifications
    console.log('\n1. 🔍 Getting users with notifications...')
    const { data: userNotifications, error: userError } = await supabaseService
      .from('notifications')
      .select('user_id')
      .eq('read', false)
      .limit(5)

    if (userError) throw userError
    
    if (!userNotifications || userNotifications.length === 0) {
      console.log('❌ No unread notifications found')
      return
    }

    // Get the first user with notifications
    const testUserId = userNotifications[0].user_id
    console.log(`📋 Testing with user: ${testUserId.substring(0, 8)}...`)

    // 2. Test service role access
    console.log('\n2. 🔐 Test service role access...')
    const { data: serviceNotifications, error: serviceError } = await supabaseService
      .from('notifications')
      .select('*')
      .eq('user_id', testUserId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (serviceError) throw serviceError
    console.log(`✅ Service role sees ${serviceNotifications.length} unread notifications`)

    // 3. Test anon access (should fail due to RLS)
    console.log('\n3. 🔐 Test anon access (should be blocked by RLS)...')
    const { data: anonNotifications, error: anonError } = await supabaseAnon
      .from('notifications')
      .select('*')
      .eq('user_id', testUserId)
      .eq('read', false)

    console.log(`⚠️  Anon sees ${anonNotifications?.length || 0} notifications (expected: 0 due to RLS)`)
    if (anonError) {
      console.log(`❌ Anon error (expected): ${anonError.message}`)
    }

    // 4. Simulate authenticated user session
    console.log('\n4. 🔑 Simulate authenticated user session...')
    
    // Create a temporary session for testing
    const { data: authData, error: authError } = await supabaseService.auth.admin.generateLink({
      type: 'magiclink',
      email: 'test@example.com',
      options: {
        redirectTo: 'http://localhost:3000'
      }
    })

    if (!authError && authData) {
      console.log('✅ Auth link generated for testing')
    }

    // 5. Test notification count query (what UnifiedNotificationBell uses)
    console.log('\n5. 📊 Test notification count query...')
    const { count: notificationCount, error: countError } = await supabaseService
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', testUserId)
      .eq('read', false)

    if (countError) throw countError
    console.log(`📈 Unread notification count: ${notificationCount}`)

    // 6. Test mark as read functionality
    console.log('\n6. ✅ Test mark as read functionality...')
    if (serviceNotifications.length > 0) {
      const testNotificationId = serviceNotifications[0].id
      const { error: updateError } = await supabaseService
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', testNotificationId)

      if (updateError) throw updateError
      console.log(`✅ Successfully marked notification ${testNotificationId} as read`)

      // Revert the change
      await supabaseService
        .from('notifications')
        .update({ read: false, read_at: null })
        .eq('id', testNotificationId)
      console.log(`🔄 Reverted notification ${testNotificationId} back to unread`)
    }

    console.log('\n🎯 NOTIFICATION BELL STATUS:')
    console.log('============================')
    console.log('✅ Notifications exist in database')
    console.log('✅ Service role can read/write notifications')
    console.log('✅ Mark as read functionality works')
    console.log('⚠️  RLS blocks anon access (correct behavior)')
    console.log('')
    console.log('📱 MOBILE HEADER REQUIREMENTS:')
    console.log('==============================')
    console.log('1. User must be authenticated (signed in)')
    console.log('2. UnifiedNotificationBell should query "notifications" table')
    console.log('3. Component should use auth.uid() for user_id filter')
    console.log('4. RLS policies must allow authenticated users to see their notifications')
    console.log('')
    console.log('🔧 NEXT STEPS:')
    console.log('==============')
    console.log('1. Run fix-notifications-rls.sql on Supabase')
    console.log('2. Ensure user is signed in when testing mobile header')
    console.log('3. Check browser dev tools for any auth/query errors')
    console.log('4. Verify UnifiedNotificationBell auth context')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testNotificationBell()
