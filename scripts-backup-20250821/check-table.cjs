const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTable() {
  console.log('🔍 CHECKING challenge_notifications table...');
  
  try {
    const { data, error } = await supabase
      .from('challenge_notifications')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Table error:', error.message);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n🚨 ROOT CAUSE: Table challenge_notifications không tồn tại!');
        console.log('💊 SOLUTION: Phải chạy complete-notification-system-setup.sql');
      }
    } else {
      console.log('✅ Table exists, found', (data || []).length, 'rows');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkTable();
