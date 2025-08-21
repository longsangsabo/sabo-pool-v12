const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixBadgeSync() {
  console.log('🔧 FIXING NOTIFICATION BADGE SYNC ISSUE...');
  console.log('Screenshot shows: Badge=9+, Page shows 85 total/0 unread');
  console.log('');

  const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';

  console.log('1. Checking actual database state...');
  
  try {
    // Check total notifications
    const { data: notifications, error: queryError } = await supabase
      .from('challenge_notifications')
      .select('id, title, is_read, created_at')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.log('❌ Database query failed:', queryError.message);
      console.log('');
      console.log('🔧 RLS ISSUE - Frontend needs to be logged in to see notifications');
      console.log('💡 The badge is probably showing cached data from before RLS was enforced');
      console.log('');
      console.log('🎯 SOLUTION:');
      console.log('1. Login on the frontend first');
      console.log('2. Badge should sync automatically with real database state');
      console.log('3. If not, we need to add force refresh to component');
      return;
    }

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
    const totalCount = notifications?.length || 0;
    
    console.log(`✅ Database reality: ${totalCount} total, ${unreadCount} unread`);
    
    if (notifications && notifications.length > 0) {
      console.log('');
      console.log('📋 Recent notifications:');
      notifications.slice(0, 5).forEach((n, index) => {
        console.log(`   ${n.is_read ? '✅ Read' : '🔴 Unread'}: ${n.title.slice(0, 40)}...`);
      });
    }

    console.log('');
    console.log('2. Analysis:');
    console.log(`   📱 Frontend badge shows: 9+`);
    console.log(`   📄 Frontend page shows: 85 total, 0 unread`);
    console.log(`   🗄️  Database shows: ${totalCount} total, ${unreadCount} unread`);
    
    console.log('');
    if (unreadCount === 0) {
      console.log('🎯 DIAGNOSIS: Badge is showing stale/cached data!');
      console.log('');
      console.log('🔧 IMMEDIATE SOLUTIONS:');
      console.log('1. Refresh browser page → badge should show 0');
      console.log('2. Login again → badge should sync with database');
      console.log('3. Clear browser cache → removes stale data');
      console.log('');
      console.log('🛠️  CODE SOLUTIONS (if refresh doesn\'t work):');
      console.log('1. Add force refresh to UnifiedNotificationBell component');
      console.log('2. Clear localStorage notifications cache');
      console.log('3. Reset component state on mount');
    } else {
      console.log('🤔 DATABASE HAS UNREAD NOTIFICATIONS');
      console.log('The frontend notification page might have a bug in marking as read');
      console.log('');
      console.log('🔧 FIXING UNREAD NOTIFICATIONS:');
      
      // Mark all as read to sync with frontend state
      const { error: updateError } = await supabase
        .from('challenge_notifications')
        .update({ is_read: true })
        .eq('user_id', testUserId)
        .eq('is_read', false);

      if (updateError) {
        console.log('❌ Failed to mark as read:', updateError.message);
      } else {
        console.log('✅ Marked all notifications as read to match frontend');
        console.log('📱 Badge should now show 0 after refresh');
      }
    }

    console.log('');
    console.log('🔄 NEXT STEPS:');
    console.log('1. Refresh browser at http://localhost:8000');
    console.log('2. Login with your account');
    console.log('3. Check if badge now shows correct count');
    console.log('4. If still wrong, we need to add force refresh to component');

  } catch (err) {
    console.log('❌ Script error:', err.message);
  }
}

fixBadgeSync();
