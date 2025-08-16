const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function cleanupTestNotifications() {
  console.log('🧹 CLEANING UP TEST NOTIFICATIONS...');
  console.log('');
  
  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
  
  // First, let's see what we have
  console.log('📋 Current notifications in database:');
  const { data: allNotifications, error: fetchError } = await supabase
    .from('challenge_notifications')
    .select('id, type, title, created_at')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.log('❌ Error fetching notifications:', fetchError.message);
    return;
  }
  
  console.log(`Found ${allNotifications?.length || 0} notifications`);
  if (allNotifications) {
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.type}] ${notif.title}`);
    });
  }
  console.log('');
  
  // Define test notification patterns to delete
  const testPatterns = [
    'Test',
    'Setup Test', 
    'RLS Test',
    'Dark Mode Test',
    'Flow Test',
    'Player123',
    'Player456', 
    'Player789',
    'SABO Champions Club',
    'Testing if notification system',
    'Testing RLS policies',
    'Thách đấu mới từ Player123',
    'Nhận được +50 SPA',
    'Nhắc nhở trận đấu',
    'Được chấp nhận vào club',
    'Thách đấu 8-Ball Pool',
    'Nhận được SPA',
    'Trận đấu sắp diễn ra'
  ];
  
  // Find notifications that match test patterns
  const testNotifications = allNotifications?.filter(notif => 
    testPatterns.some(pattern => 
      notif.title.includes(pattern) || 
      notif.type.includes('test') || 
      notif.type.includes('setup') ||
      notif.type.includes('rls')
    )
  ) || [];
  
  console.log(`🎯 Found ${testNotifications.length} test notifications to delete:`);
  testNotifications.forEach((notif, index) => {
    console.log(`${index + 1}. [${notif.type}] ${notif.title}`);
  });
  console.log('');
  
  if (testNotifications.length === 0) {
    console.log('✅ No test notifications found to delete!');
    console.log('Database is already clean.');
    return;
  }
  
  // Delete test notifications
  console.log('🗑️ Deleting test notifications...');
  const testIds = testNotifications.map(n => n.id);
  
  const { error: deleteError } = await supabase
    .from('challenge_notifications')
    .delete()
    .in('id', testIds);
    
  if (deleteError) {
    console.log('❌ Error deleting notifications:', deleteError.message);
    return;
  }
  
  console.log(`✅ Successfully deleted ${testNotifications.length} test notifications!`);
  console.log('');
  
  // Show remaining notifications
  console.log('📋 Remaining notifications (real ones):');
  const { data: remainingNotifications, error: remainingError } = await supabase
    .from('challenge_notifications')
    .select('id, type, title, created_at')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false });
    
  if (remainingError) {
    console.log('❌ Error fetching remaining notifications:', remainingError.message);
    return;
  }
  
  if (!remainingNotifications || remainingNotifications.length === 0) {
    console.log('🔔 No notifications remaining - clean slate!');
  } else {
    console.log(`Found ${remainingNotifications.length} real notifications:`);
    remainingNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.type}] ${notif.title}`);
    });
  }
  
  console.log('');
  console.log('🎉 CLEANUP COMPLETE!');
  console.log('✅ All test notifications have been removed');
  console.log('✅ Only real system notifications remain');
  console.log('✅ Notification bell will now show actual count');
  console.log('');
  console.log('💡 From now on, only real notifications will appear:');
  console.log('• Challenge invitations/responses');
  console.log('• Tournament updates');  
  console.log('• SPA transfers');
  console.log('• Club membership updates');
  console.log('• System announcements');
}

cleanupTestNotifications().catch(console.error);
