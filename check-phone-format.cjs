const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 KIỂM TRA PHONE FORMAT TRONG DATABASE...\n');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, phone')
    .not('phone', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log('📱 PHONE NUMBERS HIỆN TẠI:');
  console.log('Format | Phone Number | Name');
  console.log('-'.repeat(50));
  
  const formatIssues = [];
  
  profiles?.forEach((profile, index) => {
    const phone = profile.phone;
    let formatStatus = '✅ OK';
    
    if (phone) {
      // Kiểm tra các vấn đề format
      if (phone.startsWith('84') && !phone.startsWith('+84')) {
        formatStatus = '⚠️  Missing +';
        formatIssues.push({
          user_id: profile.user_id,
          current: phone,
          correct: '+' + phone,
          name: profile.full_name
        });
      } else if (!phone.startsWith('+84') && !phone.startsWith('0')) {
        formatStatus = '❌ Invalid';
      }
    }
    
    const formatCol = formatStatus.padEnd(12);
    const phoneCol = (phone || 'NULL').padEnd(15);
    const nameCol = profile.full_name || 'No name';
    
    console.log(`${formatCol} | ${phoneCol} | ${nameCol}`);
  });
  
  if (formatIssues.length > 0) {
    console.log(`\n🚨 PHÁT HIỆN ${formatIssues.length} PHONE NUMBERS CẦN FIX:`);
    formatIssues.forEach(issue => {
      console.log(`   ${issue.current} → ${issue.correct} (${issue.name})`);
    });
    
    console.log(`\n🔧 SCRIPT FIX:`);
    console.log('-- SQL to fix phone format issues');
    formatIssues.forEach(issue => {
      console.log(`UPDATE profiles SET phone = '${issue.correct}' WHERE user_id = '${issue.user_id}';`);
    });
  } else {
    console.log(`\n✅ Tất cả phone numbers đều có format đúng!`);
  }
  
  console.log(`\n📊 THỐNG KÊ:`);
  const totalPhones = profiles?.length || 0;
  const validPhones = profiles?.filter(p => p.phone && (p.phone.startsWith('+84') || p.phone.startsWith('0'))).length || 0;
  const invalidPhones = totalPhones - validPhones;
  
  console.log(`   Total profiles with phone: ${totalPhones}`);
  console.log(`   Valid format: ${validPhones}`);
  console.log(`   Invalid format: ${invalidPhones}`);
  console.log(`   Issues to fix: ${formatIssues.length}`);
})();
