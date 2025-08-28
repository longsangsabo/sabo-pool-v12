const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function sendMilestoneNotifications() {
  try {
    console.log('📱 Sending milestone notifications to users...\n');

    // 1. Tìm users đã được cộng milestone gần đây (hôm nay)
    const { data: recentAwards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('*, profiles(display_name)')
      .eq('event_type', 'rank_registration')
      .gte('awarded_at', '2025-08-22T00:00:00Z')
      .order('awarded_at', { ascending: false });

    if (awardsError) {
      console.error('Error fetching recent awards:', awardsError);
      return;
    }

    console.log(`Found ${recentAwards.length} recent milestone awards to notify...\n`);

    // 2. Kiểm tra cấu trúc notifications table
    console.log('Checking notifications table structure...');
    const { data: sampleNotification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (notificationError) {
      console.error('Notifications table error:', notificationError);
      return;
    }

    let notificationColumns = [];
    if (sampleNotification && sampleNotification.length > 0) {
      notificationColumns = Object.keys(sampleNotification[0]);
      console.log('Available columns:', notificationColumns.join(', '));
    }

    // 3. Gửi thông báo cho từng user
    for (const award of recentAwards) {
      console.log(`\n📱 Sending notification to: ${award.profiles?.display_name || 'Unknown'}...`);

      try {
        // Tạo notification object phù hợp với table structure
        const notificationData = {
          user_id: award.player_id,
          title: '🎯 Milestone Hoàn Thành!',
          message: `Chúc mừng! Bạn đã hoàn thành milestone "Đăng ký hạng thành công" và nhận được ${award.spa_points_awarded} SPA points!`,
          type: 'milestone_achievement',
          is_read: false,
          created_at: new Date().toISOString()
        };

        // Chỉ thêm metadata nếu có column 'metadata' hoặc 'data'
        if (notificationColumns.includes('metadata')) {
          notificationData.metadata = {
            milestone_id: award.milestone_id,
            spa_awarded: award.spa_points_awarded,
            badge_icon: '🎯',
            badge_name: 'Định vị'
          };
        }

        if (notificationColumns.includes('data')) {
          notificationData.data = {
            milestone_id: award.milestone_id,
            spa_awarded: award.spa_points_awarded
          };
        }

        const { data: notification, error: insertError } = await supabase
          .from('notifications')
          .insert(notificationData)
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Failed to send notification: ${insertError.message}`);
          
          // Try simpler version without extra fields
          const simpleNotification = {
            user_id: award.player_id,
            title: '🎯 Milestone Hoàn Thành!',
            message: `Chúc mừng! Bạn đã hoàn thành milestone "Đăng ký hạng thành công" và nhận được ${award.spa_points_awarded} SPA points!`,
            is_read: false,
            created_at: new Date().toISOString()
          };

          const { data: simpleResult, error: simpleError } = await supabase
            .from('notifications')
            .insert(simpleNotification)
            .select()
            .single();

          if (simpleError) {
            console.error(`❌ Simple notification also failed: ${simpleError.message}`);
          } else {
            console.log(`✅ Sent simple notification`);
          }
        } else {
          console.log(`✅ Sent notification successfully`);
        }

      } catch (error) {
        console.error(`❌ Error sending notification: ${error.message}`);
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📱 NOTIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`📊 Users with recent milestones: ${recentAwards.length}`);
    console.log(`📱 Notifications attempted: ${recentAwards.length}`);
    console.log('');
    console.log('✅ Notification process completed!');
    console.log('Users should now see milestone achievement notifications');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
  }
}

// Run the notification sender
sendMilestoneNotifications();
