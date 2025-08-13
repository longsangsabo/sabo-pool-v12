#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugTimezone() {
  console.log('🕐 Debugging timezone issues...\n');
  
  try {
    // 1. Check recent challenges with scheduled_time
    console.log('📅 Recent challenges with scheduled_time:');
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, scheduled_time, created_at')
      .not('scheduled_time', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    challenges.forEach(challenge => {
      const scheduledTime = new Date(challenge.scheduled_time);
      const createdTime = new Date(challenge.created_at);
      
      console.log(`\n🎯 Challenge: ${challenge.id}`);
      console.log(`  Database scheduled_time: ${challenge.scheduled_time}`);
      console.log(`  JavaScript Date: ${scheduledTime.toString()}`);
      console.log(`  Local time (vi-VN): ${scheduledTime.toLocaleString('vi-VN')}`);
      console.log(`  UTC time: ${scheduledTime.toUTCString()}`);
      console.log(`  ISO string: ${scheduledTime.toISOString()}`);
      console.log(`  Timezone offset: ${scheduledTime.getTimezoneOffset()} minutes`);
      console.log(`  Created at: ${createdTime.toLocaleString('vi-VN')}`);
    });
    
    // 2. Test different timezone conversions
    console.log('\n🌏 Testing timezone conversions:');
    
    // Simulate user input: 9:00 AM Vietnam time
    const userInput = '2025-08-13T09:00'; // This is what user enters in datetime-local
    console.log(`\n📝 User input: ${userInput} (datetime-local format)`);
    
    // Method 1: Direct Date creation (treats as local time)
    const directDate = new Date(userInput);
    console.log(`\nMethod 1 - Direct Date creation:`);
    console.log(`  JavaScript Date: ${directDate.toString()}`);
    console.log(`  toISOString(): ${directDate.toISOString()}`);
    console.log(`  toLocaleString('vi-VN'): ${directDate.toLocaleString('vi-VN')}`);
    
    // Method 2: Force Vietnam timezone
    const vietnamDate = new Date(userInput + '+07:00'); // Add Vietnam timezone
    console.log(`\nMethod 2 - With Vietnam timezone (+07:00):`);
    console.log(`  JavaScript Date: ${vietnamDate.toString()}`);
    console.log(`  toISOString(): ${vietnamDate.toISOString()}`);
    console.log(`  toLocaleString('vi-VN'): ${vietnamDate.toLocaleString('vi-VN')}`);
    
    // Method 3: Using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    console.log(`\nMethod 3 - Intl.DateTimeFormat (Asia/Ho_Chi_Minh):`);
    console.log(`  Direct: ${formatter.format(directDate)}`);
    console.log(`  Vietnam: ${formatter.format(vietnamDate)}`);
    
    // 4. Test what happens when storing to database
    console.log('\n💾 Database storage test:');
    
    const testDateTime = new Date('2025-08-13T09:00:00+07:00');
    console.log(`Original time (Vietnam 9 AM): ${testDateTime.toLocaleString('vi-VN')}`);
    console.log(`Stored as ISO: ${testDateTime.toISOString()}`);
    
    // Simulate reading from database
    const fromDatabase = new Date(testDateTime.toISOString());
    console.log(`Read from DB: ${fromDatabase.toLocaleString('vi-VN')}`);
    
    // 5. Current system info
    console.log('\n🖥️  System info:');
    console.log(`  Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`  Timezone offset: ${new Date().getTimezoneOffset()} minutes`);
    console.log(`  Current time: ${new Date().toLocaleString('vi-VN')}`);
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

// Run the debug
debugTimezone().then(() => {
  console.log('\n✅ Timezone debug completed');
  console.log('\n🔧 Recommended fixes:');
  console.log('1. Store datetime with timezone info');
  console.log('2. Use consistent timezone conversion');
  console.log('3. Display time in Vietnam timezone');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
