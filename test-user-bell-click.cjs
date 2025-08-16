const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function simulateRealUserClick() {
  console.log('🖱️  SIMULATING REAL USER CLICKING NOTIFICATION BELL...\n');
  
  // Get a real user to test with
  console.log('1. Getting real user from database...');
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .limit(1);
    
  if (userError || !users || users.length === 0) {
    console.log('❌ No users found in profiles table');
    console.log('   This means notification bell will always show empty');
    return;
  }
  
  const testUser = users[0];
  console.log('✅ Found user:', testUser.full_name, '(ID:', testUser.user_id.slice(0,8) + '...)');
  
  console.log('\n2. Simulating notification bell click...');
  console.log('   Component: UnifiedNotificationBell');
  console.log('   Variant: desktop');
  console.log('   User authenticated: YES');
  
  console.log('\n3. Testing fetchNotifications() query...');
  try {
    const { data: notifications, error: notifError } = await supabase
      .from('challenge_notifications')
      .select('*')
      .eq('user_id', testUser.user_id)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (notifError) {
      console.log('❌ NOTIFICATION QUERY FAILED:');
      console.log('   Error:', notifError.message);
      console.log('   Code:', notifError.code);
      
      // Diagnose specific errors
      if (notifError.message.includes('relation') && notifError.message.includes('does not exist')) {
        console.log('\n🔧 ROOT CAUSE: Table challenge_notifications không tồn tại!');
        console.log('💊 CURE: Phải chạy complete-notification-system-setup.sql trước');
        console.log('\n👤 USER SEES: Loading spinner → Empty "Chưa có thông báo nào"');
      } else if (notifError.code === '42501') {
        console.log('\n🔧 ROOT CAUSE: RLS policy blocking access');
        console.log('💊 CURE: User cần login properly hoặc fix RLS policies');
        console.log('\n👤 USER SEES: Loading spinner → Empty notifications');
      } else {
        console.log('\n🔧 ROOT CAUSE: Unknown database error');
        console.log('💊 CURE: Check Supabase connection and permissions');
      }
    } else {
      console.log('✅ Query successful!');
      console.log('   Found', (notifications || []).length, 'notifications');
      
      if (!notifications || notifications.length === 0) {
        console.log('\n👤 USER SEES: Empty state "Chưa có thông báo nào"');
        console.log('💡 This is normal if user has no notifications yet');
      } else {
        console.log('\n👤 USER SEES: List of notifications');
        console.log('   Latest:', notifications[0].title);
        console.log('   Unread count:', notifications.filter(n => !n.is_read).length);
      }
    }
  } catch (err) {
    console.log('❌ NETWORK/CONNECTION ERROR:', err.message);
    console.log('\n👤 USER SEES: Loading spinner forever or error toast');
  }
  
  console.log('\n📊 TESTING RESULT SUMMARY:');
  console.log('Bell Icon: ✅ Should appear in header');
  console.log('Click Response: ✅ Dropdown should open');
  console.log('Data Loading: ❓ Depends on database setup');
  console.log('Error Handling: ❓ Check console for details');
  
  console.log('\n🎯 NEXT STEPS FOR USER:');
  console.log('1. Open http://localhost:8003 in browser');
  console.log('2. Login with valid account');
  console.log('3. Click bell icon in top-right header');
  console.log('4. Open F12 console to see any errors');
  console.log('5. Report what you see in dropdown');
  
  console.log('\n🔍 EXPECTED USER BEHAVIORS:');
  console.log('SCENARIO A: Database not setup');
  console.log('  → Click bell → Loading → Empty "Chưa có thông báo nào"');
  console.log('  → Console shows: relation "challenge_notifications" does not exist');
  
  console.log('\nSCENARIO B: Database setup but no notifications');
  console.log('  → Click bell → Loading → Empty "Chưa có thông báo nào"');
  console.log('  → This is normal behavior');
  
  console.log('\nSCENARIO C: Database setup with notifications');
  console.log('  → Click bell → Loading → List of notifications');
  console.log('  → Badge shows unread count');
  console.log('  → Can click notifications to mark as read');
}

simulateRealUserClick().catch(console.error);
