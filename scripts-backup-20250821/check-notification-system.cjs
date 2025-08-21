const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkNotificationSystem() {
  console.log('🔍 CHECKING WHY NOTIFICATIONS ARE NOT CREATED...');
  
  // Check if we have database triggers for challenge creation
  console.log('\n1. Let\'s check if triggers were applied when we created challenge...');
  
  // Look at the recent accepted challenge again  
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', 'd0ba6ff2-843a-4683-94fe-1ac9c77c1134')
    .single();
    
  console.log('📋 Challenge details:');
  console.log('  ID:', challenge?.id?.slice(0,8));
  console.log('  Status:', challenge?.status);
  console.log('  Created:', challenge?.created_at);
  console.log('  Responded:', challenge?.responded_at);
  
  // Check if we have any challenge creation triggers in our SQL files
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n2. Checking for SQL trigger files...');
  const files = fs.readdirSync('.');
  const sqlFiles = files.filter(f => f.endsWith('.sql'));
  
  let hasCreateTrigger = false;
  let hasAcceptTrigger = false;
  
  sqlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('trigger_challenge_created') || content.includes('AFTER INSERT ON challenges')) {
        console.log(`  ✅ Found challenge creation trigger in: ${file}`);
        hasCreateTrigger = true;
      }
      if (content.includes('trigger_challenge_accepted') || content.includes('AFTER UPDATE ON challenges')) {
        console.log(`  ✅ Found challenge update trigger in: ${file}`);
        hasAcceptTrigger = true;
      }
    } catch (err) {
      // Skip files we can't read
    }
  });
  
  if (!hasCreateTrigger) {
    console.log('  ❌ No challenge creation trigger found');
  }
  if (!hasAcceptTrigger) {
    console.log('  ❌ No challenge accept trigger found');
  }
  
  // Try using the notification function directly
  console.log('\n3. Testing notification function...');
  const { data: functionResult, error: functionError } = await supabase
    .rpc('create_challenge_notification', {
      p_type: 'manual_test',
      p_challenge_id: 'd0ba6ff2-843a-4683-94fe-1ac9c77c1134',
      p_user_id: 'e30e1d1d-d714-4678-b63c-9f403ea2aeac',
      p_title: 'Manual Test Notification',
      p_message: 'Testing notification function manually',
      p_icon: 'bell',
      p_priority: 'medium'
    });
    
  if (functionError) {
    console.log('❌ Function error:', functionError);
    
    // Check if function exists
    console.log('\n4. Checking if notification function exists...');
    const { error: funcCheckError } = await supabase
      .rpc('create_challenge_notification', {});  // This will fail but tell us if function exists
      
    if (funcCheckError && funcCheckError.message.includes('could not find function')) {
      console.log('❌ create_challenge_notification function does not exist');
      console.log('🔧 SOLUTION: Need to run challenge-notification-schema.sql in Supabase Dashboard');
    }
  } else {
    console.log('✅ Function worked, notification ID:', functionResult);
  }
  
  // Check notification count
  const { data: notifications, error: readError } = await supabase
    .from('challenge_notifications')
    .select('*');
    
  if (readError) {
    console.log('❌ Read error:', readError);
    if (readError.message.includes('relation') && readError.message.includes('does not exist')) {
      console.log('❌ challenge_notifications table does not exist!');
      console.log('🔧 SOLUTION: Run challenge-notification-schema.sql to create table');
    }
  } else {
    console.log(`\n📊 Current notification count: ${notifications?.length || 0}`);
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  if (!hasCreateTrigger && !hasAcceptTrigger) {
    console.log('❌ Missing database triggers for automatic notification creation');
    console.log('🔧 SOLUTION: Run challenge-notification-schema.sql to create triggers');
  } else {
    console.log('✅ Database triggers should exist');
    console.log('⚠️ Possible issue: Triggers were added after challenges were created');
    console.log('💡 TIP: Create a new challenge to test if notifications work now');
  }
}

checkNotificationSystem();
