const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseDatabaseError() {
  console.log('🔍 CHẨN ĐOÁN LỖI "database error saving new user"');
  console.log('=' .repeat(60));
  
  console.log('\n📋 CÁC NGUYÊN NHÂN CÓ THỂ:');
  console.log('1. Trigger handle_new_user bị lỗi');
  console.log('2. Profiles table thiếu constraint hoặc có lỗi schema');
  console.log('3. RLS policies block việc tạo profile');
  console.log('4. Function handle_new_user bị lỗi trong quá trình xử lý');
  console.log('5. Raw user metadata không đúng format');
  
  console.log('\n🔧 KIỂM TRA CHI TIẾT...\n');
  
  // 1. Kiểm tra xem có profile nào được tạo gần đây không
  console.log('1. KIỂM TRA PROFILES GẦN ĐÂY:');
  try {
    const { data: recentProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (profileError) {
      console.log('❌ Lỗi khi lấy profiles:', profileError.message);
    } else {
      console.log('✅ 5 profiles gần nhất:');
      recentProfiles?.forEach(profile => {
        console.log(`   - ${profile.full_name || 'No name'} | ${profile.phone || 'No phone'} | ${profile.created_at}`);
      });
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
  
  // 2. Kiểm tra constraints trên profiles table
  console.log('\n2. KIỂM TRA CONSTRAINTS:');
  try {
    // Test tạo profile với các trường required
    const testData = {
      user_id: '12345678-1234-1234-1234-123456789012', // Valid UUID
      full_name: 'Test User',
      phone: '+84123456789'
    };
    
    const { data: testResult, error: testError } = await supabase
      .from('profiles')
      .insert(testData)
      .select();
    
    if (testError) {
      console.log('❌ Test insert failed:', testError.message);
      console.log('   Code:', testError.code);
      console.log('   Details:', testError.details);
      
      // Phân tích mã lỗi cụ thể
      if (testError.code === '23505') {
        console.log('   → DUPLICATE KEY: user_id hoặc phone đã tồn tại');
      } else if (testError.code === '23502') {
        console.log('   → NULL CONSTRAINT: có field required bị null');
      } else if (testError.code === '22P02') {
        console.log('   → INVALID UUID: user_id không đúng format UUID');
      } else if (testError.code === '42501') {
        console.log('   → PERMISSION DENIED: RLS policy chặn insert');
      }
    } else {
      console.log('✅ Test insert thành công:', testResult);
      
      // Cleanup test data
      await supabase.from('profiles').delete().eq('user_id', testData.user_id);
      console.log('✅ Test data cleaned up');
    }
  } catch (error) {
    console.log('❌ Exception during constraint test:', error.message);
  }
  
  // 3. Kiểm tra các phone number có format lỗi
  console.log('\n3. KIỂM TRA PHONE NUMBER FORMAT:');
  try {
    const { data: invalidPhones, error: phoneError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone')
      .not('phone', 'is', null)
      .limit(10);
    
    if (phoneError) {
      console.log('❌ Lỗi kiểm tra phone numbers:', phoneError.message);
    } else {
      console.log('✅ Sample phone numbers trong database:');
      invalidPhones?.forEach(profile => {
        const phone = profile.phone;
        let status = '✅';
        let issues = [];
        
        if (!phone) {
          status = '⚠️';
          issues.push('NULL');
        } else {
          if (!phone.startsWith('+84') && !phone.startsWith('0')) {
            status = '❌';
            issues.push('Invalid format');
          }
          if (phone.length < 10) {
            status = '❌';
            issues.push('Too short');
          }
        }
        
        console.log(`   ${status} ${phone || 'NULL'} - ${profile.full_name} ${issues.length > 0 ? '(' + issues.join(', ') + ')' : ''}`);
      });
    }
  } catch (error) {
    console.log('❌ Exception during phone check:', error.message);
  }
  
  // 4. Mô phỏng lỗi registration
  console.log('\n4. MÔ PHỎNG REGISTRATION PROCESS:');
  console.log('Giả lập những gì xảy ra khi user đăng ký...');
  
  // Test với các trường hợp thường gặp
  const testCases = [
    {
      name: 'Valid Vietnam phone',
      phone: '0987654321',
      expected: '+84987654321'
    },
    {
      name: 'Already E164 format',
      phone: '+84987654321',
      expected: '+84987654321'
    },
    {
      name: 'Invalid format',
      phone: '987654321',
      expected: 'ERROR'
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n   Test: ${testCase.name}`);
    console.log(`   Input: ${testCase.phone}`);
    
    // Format phone to E164 (similar to what app does)
    let formattedPhone;
    try {
      if (testCase.phone.startsWith('+84')) {
        formattedPhone = testCase.phone;
      } else if (testCase.phone.startsWith('0')) {
        formattedPhone = '+84' + testCase.phone.slice(1);
      } else {
        formattedPhone = 'INVALID';
      }
      
      console.log(`   Formatted: ${formattedPhone}`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   Status: ${formattedPhone === testCase.expected ? '✅ OK' : '❌ MISMATCH'}`);
    } catch (error) {
      console.log(`   ❌ Error formatting: ${error.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 GỢI Ý GIẢI PHÁP:');
  console.log('');
  
  console.log('1. KIỂM TRA SUPABASE LOGS:');
  console.log('   - Vào Supabase Dashboard > Logs');
  console.log('   - Xem "Database" logs trong lúc user đăng ký');
  console.log('   - Tìm lỗi từ trigger handle_new_user');
  console.log('');
  
  console.log('2. KIỂM TRA FORMAT DỮ LIỆU:');
  console.log('   - Phone number phải là E164 format (+84...)');
  console.log('   - Full name không được null hoặc empty');
  console.log('   - User ID phải là valid UUID');
  console.log('');
  
  console.log('3. KIỂM TRA RLS POLICIES:');
  console.log('   - Đảm bảo trigger có SECURITY DEFINER');
  console.log('   - RLS policies không chặn INSERT từ trigger');
  console.log('');
  
  console.log('4. CẬP NHẬT HANDLE_NEW_USER FUNCTION:');
  console.log('   - Thêm logging để debug');
  console.log('   - Handle các exception tốt hơn');
  console.log('   - Validate dữ liệu trước khi insert');
  console.log('');
  
  console.log('5. TEST MANUAL:');
  console.log('   - Thử tạo user qua Supabase Dashboard');
  console.log('   - Xem trigger có chạy không');
  console.log('   - Debug từng step của registration flow');
}

diagnoseDatabaseError().catch(console.error);
