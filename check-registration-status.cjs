const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 KIỂM TRA TÌNH TRẠNG ĐĂNG KÝ USER HIỆN TẠI...\n');
  
  // 1. Kiểm tra users đăng ký gần đây
  console.log('1. KIỂM TRA USERS ĐĂNG KÝ GẦN ĐÂY (24H):');
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: recentProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, full_name, phone, email, created_at')
    .gte('created_at', yesterday)
    .order('created_at', { ascending: false });
  
  if (profileError) {
    console.log('❌ Lỗi lấy profiles gần đây:', profileError.message);
  } else {
    const count = recentProfiles ? recentProfiles.length : 0;
    console.log(`   ✅ Có ${count} profiles được tạo trong 24h qua:`);
    
    if (count > 0) {
      recentProfiles.forEach((profile, index) => {
        const name = profile.full_name || 'No name';
        const phone = profile.phone || 'No phone';
        const time = new Date(profile.created_at).toLocaleString('vi-VN');
        console.log(`     ${index + 1}. ${name} - ${phone} (${time})`);
      });
    } else {
      console.log('     ⚠️ Không có user nào đăng ký trong 24h qua');
    }
  }
  
  // 2. Kiểm tra phone format issues hiện tại
  console.log(`\n2. KIỂM TRA PHONE FORMAT ISSUES:`);
  const { data: allProfiles, error: phoneError } = await supabase
    .from('profiles')
    .select('user_id, phone')
    .not('phone', 'is', null);
  
  if (phoneError) {
    console.log('❌ Lỗi lấy phone numbers:', phoneError.message);
  } else {
    const totalPhones = allProfiles ? allProfiles.length : 0;
    const badFormats = allProfiles ? allProfiles.filter(p => 
      p.phone && p.phone.startsWith('84') && !p.phone.startsWith('+84')
    ) : [];
    
    console.log(`   📊 Total phones: ${totalPhones}`);
    console.log(`   ✅ Good format: ${totalPhones - badFormats.length}`);
    console.log(`   ❌ Bad format: ${badFormats.length}`);
    
    if (badFormats.length > 0) {
      console.log(`   🚨 CÒN ${badFormats.length} PHONE NUMBERS CẦN FIX!`);
      badFormats.slice(0, 5).forEach(profile => {
        console.log(`     - ${profile.phone} (user: ${profile.user_id.substring(0, 8)})`);
      });
      return;
    } else {
      console.log(`   🎉 Tất cả phone numbers đều có format đúng!`);
    }
  }

  // 3. Kiểm tra có user nào bị lỗi registration gần đây không
  console.log(`\n3. KIỂM TRA AUTH USERS VS PROFILES:`);
  
  // Get auth users từ profiles table (vì không access được auth.users trực tiếp)
  const { data: allProfileUsers } = await supabase
    .from('profiles')
    .select('user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (allProfileUsers && allProfileUsers.length > 0) {
    console.log(`   ✅ Có ${allProfileUsers.length} profiles trong database`);
    
    // Kiểm tra xem có profile nào missing data không
    const { data: incompleteProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone, email')
      .or('full_name.is.null,phone.is.null,email.is.null')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const incompleteCount = incompleteProfiles ? incompleteProfiles.length : 0;
    console.log(`   ⚠️ Profiles thiếu data: ${incompleteCount}`);
    
    if (incompleteCount > 0) {
      console.log('     Top profiles thiếu data:');
      incompleteProfiles.slice(0, 3).forEach((profile, index) => {
        const missing = [];
        if (!profile.full_name) missing.push('name');
        if (!profile.phone) missing.push('phone');
        if (!profile.email) missing.push('email');
        console.log(`       ${index + 1}. User ${profile.user_id.substring(0, 8)}: missing ${missing.join(', ')}`);
      });
    }
  }

  // 4. Test SQL function có hoạt động không
  console.log(`\n4. TEST SQL FUNCTIONS:`);
  
  try {
    // Test phone validation function
    const { data: phoneResult, error: phoneTestError } = await supabase
      .rpc('validate_and_format_phone', { input_phone: '84987654321' });
    
    if (phoneTestError) {
      console.log(`   ❌ validate_and_format_phone function: CHƯA ĐƯỢC TẠO`);
      console.log(`      Error: ${phoneTestError.message}`);
    } else {
      console.log(`   ✅ validate_and_format_phone function: HOẠT ĐỘNG`);
      console.log(`      Test: '84987654321' → '${phoneResult}'`);
    }
  } catch (error) {
    console.log(`   ❌ Phone validation function: KHÔNG TỒN TẠI`);
  }
  
  try {
    // Test debug function
    const testUserId = allProfileUsers && allProfileUsers[0] ? allProfileUsers[0].user_id : null;
    if (testUserId) {
      const { data: debugResult, error: debugError } = await supabase
        .rpc('debug_user_registration', { user_id_param: testUserId });
      
      if (debugError) {
        console.log(`   ❌ debug_user_registration function: CHƯA ĐƯỢC TẠO`);
      } else {
        console.log(`   ✅ debug_user_registration function: HOẠT ĐỘNG`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Debug function: KHÔNG TỒN TẠI`);
  }
  
  console.log(`\n` + '='.repeat(60));
  console.log('📋 TÌNH TRẠNG HIỆN TẠI:');
  console.log('='.repeat(60));
  
  const hasRecentUsers = recentProfiles && recentProfiles.length > 0;
  const hasPhoneIssues = allProfiles && allProfiles.some(p => 
    p.phone && p.phone.startsWith('84') && !p.phone.startsWith('+84')
  );
  
  if (!hasRecentUsers) {
    console.log('⚠️  KHÔNG CÓ USER ĐĂNG KÝ GẦN ĐÂY');
    console.log('   → Không thể verify liệu lỗi đã được fix hay chưa');
    console.log('   → Cần có user thực tế đăng ký để test');
  } else {
    console.log(`✅ CÓ ${recentProfiles.length} USER ĐĂNG KÝ GẦN ĐÂY`);
    console.log('   → Registration system có vẻ đang hoạt động');
  }
  
  if (hasPhoneIssues) {
    console.log('❌ VẪN CÒN PHONE FORMAT ISSUES');
    console.log('   → NGUY CƠ CAO users mới sẽ gặp lỗi registration');
  } else {
    console.log('✅ PHONE FORMAT ĐÃ ĐƯỢC FIX HOÀN TẤT');
    console.log('   → Phone format không còn là nguyên nhân gây lỗi');
  }
  
  console.log(`\n💡 KẾT LUẬN VỀ REGISTRATION ERRORS:`);
  
  if (hasPhoneIssues) {
    console.log('🚨 CÓ KHẢ NĂNG CAO VẪN CÒN LỖI');
    console.log('📝 CẦN LÀM:');
    console.log('   1. Chạy FIX_REGISTRATION_ERRORS.sql ngay lập tức');
    console.log('   2. Fix phone format issues còn lại');
    console.log('   3. Test đăng ký user mới');
  } else if (!hasRecentUsers) {
    console.log('🤔 KHÔNG ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN');
    console.log('📝 CẦN LÀM:');
    console.log('   1. Chạy FIX_REGISTRATION_ERRORS.sql để đảm bảo');
    console.log('   2. Monitor registration của users mới');
    console.log('   3. Test thử với tài khoản mới');
  } else {
    console.log('🎉 CÓ VẺ ĐÃ ĐƯỢC FIX THÀNH CÔNG');
    console.log('📝 KHUYẾN NGHỊ:');
    console.log('   1. Vẫn nên chạy FIX_REGISTRATION_ERRORS.sql để chắc chắn');
    console.log('   2. Monitor tiếp registration errors');
    console.log('   3. Sẵn sàng debug nếu có reports từ users');
  }
  
  console.log(`\n🔧 NEXT STEPS:`);
  console.log('1. Chạy script FIX_REGISTRATION_ERRORS.sql trong Supabase Dashboard');
  console.log('2. Test đăng ký account mới với số điện thoại');
  console.log('3. Monitor Supabase logs để catch real-time errors');
  console.log('4. Có debug tools sẵn nếu cần troubleshoot specific users');
})();
