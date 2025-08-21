require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 KIỂM TRA THÔNG BÁO MOBILE HEADER')
console.log('===================================')

async function checkNotifications() {
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('\n1. 📊 Kiểm tra tổng số thông báo...')
    
    // Check notifications table
    const { data: notifications, error: notifError } = await serviceClient
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (notifError) {
      console.log('❌ Error checking notifications:', notifError.message)
    } else {
      console.log(`✅ Found ${notifications.length} recent notifications`)
      if (notifications.length > 0) {
        console.log('📋 Recent notifications:')
        notifications.forEach((notif, i) => {
          console.log(`   ${i+1}. ${notif.title} (${notif.type}) - Read: ${notif.is_read}`)
          console.log(`      User: ${notif.user_id?.substring(0,8)}... - ${notif.created_at}`)
        })
      }
    }

    console.log('\n2. 🔔 Kiểm tra challenge_notifications table...')
    
    // Check challenge_notifications table (legacy)
    const { data: challengeNotifs, error: challengeError } = await serviceClient
      .from('challenge_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (challengeError) {
      console.log('❌ Error checking challenge_notifications:', challengeError.message)
    } else {
      console.log(`✅ Found ${challengeNotifs.length} recent challenge notifications`)
      if (challengeNotifs.length > 0) {
        console.log('📋 Recent challenge notifications:')
        challengeNotifs.forEach((notif, i) => {
          console.log(`   ${i+1}. ${notif.title} (${notif.type}) - Read: ${notif.is_read}`)
          console.log(`      User: ${notif.user_id?.substring(0,8)}... - ${notif.created_at}`)
        })
      }
    }

    console.log('\n3. 👤 Kiểm tra thông báo cho user cụ thể...')
    
    // Get a sample user
    const { data: users, error: userError } = await serviceClient
      .from('users')
      .select('id, username')
      .limit(3)
    
    if (!userError && users.length > 0) {
      for (const user of users) {
        console.log(`\n🔍 Checking notifications for ${user.username} (${user.id?.substring(0,8)}...)`)
        
        // Check notifications for this user
        const { data: userNotifs, error } = await serviceClient
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (!error) {
          console.log(`   📊 Total notifications: ${userNotifs.length}`)
          console.log(`   📬 Unread: ${userNotifs.filter(n => !n.is_read).length}`)
          
          if (userNotifs.length > 0) {
            console.log('   📋 Recent notifications:')
            userNotifs.slice(0, 3).forEach((notif, i) => {
              console.log(`     ${i+1}. ${notif.title} - ${notif.is_read ? 'Read' : 'UNREAD'}`)
            })
          } else {
            console.log('   ⚠️  No notifications found for this user')
          }
        }
      }
    }

    console.log('\n4. 🔧 Kiểm tra UnifiedNotificationBell component behavior...')
    console.log('📋 Components được sử dụng:')
    console.log('   - MobileHeader.tsx uses UnifiedNotificationBell')
    console.log('   - UnifiedNotificationBell queries notifications table')
    console.log('   - ChallengeNotificationBell queries challenge_notifications table')
    
    console.log('\n🎯 PHÂN TÍCH VẤN ĐỀ:')
    console.log('====================')
    console.log('1. Mobile header sử dụng UnifiedNotificationBell component')
    console.log('2. Component này query bảng "notifications"')  
    console.log('3. Nếu không có thông báo nào, badge sẽ không hiển thị')
    console.log('4. Có thể RLS đang block việc query notifications')
    
    console.log('\n📋 KHUYẾN NGHỊ:')
    console.log('===============')
    console.log('1. Tạo thông báo test để kiểm tra')
    console.log('2. Kiểm tra RLS policies trên bảng notifications')
    console.log('3. Kiểm tra auth context trong mobile header')
    console.log('4. Debug UnifiedNotificationBell component')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkNotifications()
