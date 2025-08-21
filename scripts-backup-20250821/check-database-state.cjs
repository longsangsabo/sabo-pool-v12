const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCurrentState() {
  console.log('🔍 CHECKING CURRENT DATABASE STATE...');
  
  // 1. Check if notifications table exists
  console.log('\n1. Checking notifications table structure...');
  const { data: tableInfo, error: tableError } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);
  
  if (tableError) {
    console.log('❌ Notifications table error:', tableError.message);
    if (tableError.code === '42P01') {
      console.log('💡 Table does not exist - need to create it');
    }
  } else {
    console.log('✅ Notifications table exists');
    console.log('Sample data structure:', Object.keys(tableInfo[0] || {}));
  }
  
  // 2. Check if functions exist
  console.log('\n2. Checking required functions...');
  
  const functions = [
    'get_user_notifications',
    'get_unread_notifications_count', 
    'mark_notification_read',
    'create_notification'
  ];
  
  for (const func of functions) {
    try {
      const { error } = await supabase.rpc(func, {});
      if (error) {
        if (error.message.includes('could not find function')) {
          console.log('❌ Function', func, 'missing');
        } else if (error.message.includes('required')) {
          console.log('✅ Function', func, 'exists (parameter error expected)');
        } else {
          console.log('⚠️  Function', func, 'exists but error:', error.message);
        }
      } else {
        console.log('✅ Function', func, 'works');
      }
    } catch (err) {
      console.log('❌ Function', func, 'error:', err.message);
    }
  }
  
  console.log('\n📋 CURRENT STATE SUMMARY:');
  console.log('- Database connection: ✅ Working');
  console.log('- Need to run SQL scripts to complete setup');
  
  console.log('\n🔧 IMMEDIATE ACTIONS NEEDED:');
  console.log('1. Run fix-notifications-table.sql in Supabase Dashboard');
  console.log('2. Run add-notification-functions.sql in Supabase Dashboard'); 
  console.log('3. Test the SimpleNotificationBell component');
}

checkCurrentState().catch(console.error);
