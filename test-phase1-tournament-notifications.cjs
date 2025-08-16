const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testTournamentNotificationSystem() {
  console.log('🧪 TESTING PHASE 1: TOURNAMENT NOTIFICATION SYSTEM');
  console.log('===================================================');
  console.log('');

  try {
    // Test 1: Create test tournament registration
    console.log('📋 TEST 1: Tournament Registration Notification');
    console.log('----------------------------------------------');
    
    const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
    const testTournamentId = 'test-tournament-' + Date.now();
    
    // Simulate tournament registration
    const { data: regData, error: regError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'tournament_registration_confirmed',
        p_user_id: testUserId,
        p_title: '🏆 Đăng ký giải đấu thành công',
        p_message: 'Bạn đã đăng ký thành công giải đấu "SABO Pool Championship 2025" tại Club SABO. Khởi tranh: 20/08/2025 09:00. Phí: 100,000 VND',
        p_icon: 'trophy',
        p_priority: 'medium',
        p_action_text: 'Xem chi tiết',
        p_action_url: '/tournaments/' + testTournamentId
      });

    if (regError) {
      console.log('❌ Registration notification failed:', regError.message);
    } else {
      console.log('✅ Registration notification created:', regData);
    }

    // Test 2: Payment confirmation notification
    console.log('');
    console.log('💳 TEST 2: Payment Confirmation Notification');
    console.log('-------------------------------------------');
    
    const { data: payData, error: payError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'payment_confirmed',
        p_user_id: testUserId,
        p_title: '💳 Thanh toán được xác nhận',
        p_message: 'Thanh toán 100,000 VND cho giải đấu "SABO Pool Championship 2025" đã được xác nhận. Bạn đã chính thức tham gia!',
        p_icon: 'credit-card',
        p_priority: 'high',
        p_action_text: 'Xem giải đấu',
        p_action_url: '/tournaments/' + testTournamentId
      });

    if (payError) {
      console.log('❌ Payment notification failed:', payError.message);
    } else {
      console.log('✅ Payment notification created:', payData);
    }

    // Test 3: Bracket release notification
    console.log('');
    console.log('📋 TEST 3: Bracket Release Notification');
    console.log('--------------------------------------');
    
    const { data: bracketData, error: bracketError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'bracket_released',
        p_user_id: testUserId,
        p_title: '📋 Bảng đấu đã được công bố',
        p_message: 'Bảng đấu cho giải đấu "SABO Pool Championship 2025" đã sẵn sàng! Xem lịch thi đấu và chuẩn bị cho trận đầu tiên.',
        p_icon: 'calendar',
        p_priority: 'high',
        p_action_text: 'Xem bảng đấu',
        p_action_url: '/tournaments/' + testTournamentId + '/bracket'
      });

    if (bracketError) {
      console.log('❌ Bracket notification failed:', bracketError.message);
    } else {
      console.log('✅ Bracket notification created:', bracketData);
    }

    // Test 4: Match scheduling notification
    console.log('');
    console.log('📅 TEST 4: Match Scheduling Notification');
    console.log('--------------------------------------');
    
    const { data: matchData, error: matchError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'match_scheduled',
        p_user_id: testUserId,
        p_title: '📅 Lịch thi đấu mới',
        p_message: 'Trận đấu của bạn với Player123 trong giải "SABO Pool Championship 2025" được lên lịch vào 20/08/2025 10:30',
        p_icon: 'calendar',
        p_priority: 'medium',
        p_action_text: 'Xem chi tiết',
        p_action_url: '/tournaments/' + testTournamentId + '/matches/match-001'
      });

    if (matchError) {
      console.log('❌ Match notification failed:', matchError.message);
    } else {
      console.log('✅ Match notification created:', matchData);
    }

    // Test 5: Tournament completion notification
    console.log('');
    console.log('🏅 TEST 5: Tournament Completion Notification');
    console.log('--------------------------------------------');
    
    const { data: completeData, error: completeError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'tournament_completed',
        p_user_id: testUserId,
        p_title: '🏅 Giải đấu kết thúc',
        p_message: 'Giải đấu "SABO Pool Championship 2025" đã kết thúc! Xem kết quả và bảng xếp hạng cuối cùng.',
        p_icon: 'trophy',
        p_priority: 'medium',
        p_action_text: 'Xem kết quả',
        p_action_url: '/tournaments/' + testTournamentId + '/results'
      });

    if (completeError) {
      console.log('❌ Completion notification failed:', completeError.message);
    } else {
      console.log('✅ Completion notification created:', completeData);
    }

    // Test 6: Payment reminder notification
    console.log('');
    console.log('⏰ TEST 6: Payment Reminder Notification');
    console.log('--------------------------------------');
    
    const { data: reminderData, error: reminderError } = await supabase
      .rpc('create_challenge_notification', {
        p_type: 'payment_reminder',
        p_user_id: testUserId,
        p_title: '⏰ Nhắc nhở thanh toán',
        p_message: 'Bạn chưa thanh toán cho giải đấu "SABO Pool Championship 2025". Vui lòng thanh toán trong 24h để giữ chỗ.',
        p_icon: 'clock',
        p_priority: 'medium',
        p_action_text: 'Thanh toán ngay',
        p_action_url: '/tournaments/' + testTournamentId + '/payment'
      });

    if (reminderError) {
      console.log('❌ Reminder notification failed:', reminderError.message);
    } else {
      console.log('✅ Reminder notification created:', reminderData);
    }

    // Test 7: Check total notifications created
    console.log('');
    console.log('📊 TEST 7: Verify Notification Count');
    console.log('-----------------------------------');
    
    const { data: countData, error: countError } = await supabase
      .from('challenge_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (countError) {
      console.log('❌ Count query failed:', countError.message);
    } else {
      console.log(`✅ Total notifications for user: ${countData.length}`);
      console.log('');
      console.log('📋 Recent notifications:');
      countData.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${notif.priority}`);
      });
    }

    console.log('');
    console.log('🎯 PHASE 1 TESTING COMPLETE!');
    console.log('============================');
    console.log('');
    console.log('✅ TOURNAMENT NOTIFICATION TYPES TESTED:');
    console.log('   ├── 🏆 Registration confirmation');
    console.log('   ├── 💳 Payment confirmation');
    console.log('   ├── 📋 Bracket release');
    console.log('   ├── 📅 Match scheduling');
    console.log('   ├── 🏅 Tournament completion');
    console.log('   └── ⏰ Payment reminders');
    console.log('');
    console.log('📱 TESTING INSTRUCTIONS:');
    console.log('1. Open http://localhost:8000 in browser');
    console.log('2. Login with your account');
    console.log('3. Check notification bell - should show new notifications');
    console.log('4. Click bell → navigate to notifications page');
    console.log('5. Verify all tournament notifications are displayed');
    console.log('6. Test clicking on action URLs');
    console.log('7. Test marking notifications as read');
    console.log('');
    console.log('🚀 READY FOR PHASE 2: CLUB MANAGEMENT NOTIFICATIONS!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTournamentNotificationSystem();
