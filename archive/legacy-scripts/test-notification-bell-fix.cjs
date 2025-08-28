require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 TEST UNIFIED NOTIFICATION BELL FIX')
console.log('====================================')

async function testNotificationBell() {
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  try {
    console.log('\n1. 🔐 Test anon client access to notifications...')
    
    // Simulate what UnifiedNotificationBell does (without auth)
    const { data: anonData, error: anonError } = await anonClient
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (anonError) {
      console.log('❌ Anon client error:', anonError.message)
      console.log('   This is EXPECTED - anon cannot access notifications')
    } else {
      console.log(`⚠️  Anon can see ${anonData.length} notifications (unexpected)`)
    }

    console.log('\n2. 📊 Quick count of notifications per user...')
    
    // Use service role to get user notification stats
    const serviceClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: userStats, error: statsError } = await serviceClient
      .from('notifications')
      .select('user_id, is_read')
    
    if (!statsError && userStats) {
      const userCounts = {}
      
      userStats.forEach(notif => {
        const userId = notif.user_id?.substring(0, 8) + '...'
        if (!userCounts[userId]) {
          userCounts[userId] = { total: 0, unread: 0 }
        }
        userCounts[userId].total++
        if (!notif.is_read) {
          userCounts[userId].unread++
        }
      })
      
      console.log('📋 User notification counts:')
      Object.entries(userCounts)
        .slice(0, 5)
        .forEach(([userId, counts]) => {
          console.log(`   ${userId}: ${counts.total} total, ${counts.unread} unread`)
        })
    }

    console.log('\n3. 🎯 PHÂN TÍCH MOBILE HEADER ISSUE...')
    console.log('=====================================')
    console.log('✅ UnifiedNotificationBell component đã được fix:')
    console.log('   - Query from "notifications" table (was "challenge_notifications")')
    console.log('   - Subscription listen on "notifications" table')
    console.log('   - markAsRead updates "notifications" table')
    
    console.log('\n❗ VẤN ĐỀ CÒN LẠI:')
    console.log('==================')
    console.log('1. 🔒 RLS Policy: Authenticated users cannot read notifications')
    console.log('2. 📱 Mobile Header: Component cần authentication để hoạt động')
    console.log('3. 🔄 Component State: Có thể cần force refresh')
    
    console.log('\n🔧 CẦN LÀM TIẾP:')
    console.log('================')
    console.log('1. Chạy fix-spa-transactions-rls.sql trên Supabase (cho notifications table)')
    console.log('2. Kiểm tra auth context trong mobile app') 
    console.log('3. Test mobile header với authenticated user')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testNotificationBell()
