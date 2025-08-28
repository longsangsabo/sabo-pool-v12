// Test Supabase Connection và Authentication
// Chạy trong browser console để kiểm tra

console.log('🔍 KIỂM TRA HỆ THỐNG AUTHENTICATION...');

// Test 1: Kiểm tra Supabase client
async function testSupabaseConnection() {
  console.log('\n1️⃣ Kiểm tra kết nối Supabase...');
  
  try {
    // Kiểm tra environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('✅ Supabase URL:', url ? 'Có' : 'Không có');
    console.log('✅ Supabase Key:', key ? 'Có' : 'Không có');
    
    // Test simple query
    if (window.supabase) {
      const { data, error } = await window.supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      if (error) {
        console.log('⚠️ Database query error:', error.message);
        return false;
      } else {
        console.log('✅ Database connection: OK');
        return true;
      }
    } else {
      console.log('❌ Supabase client chưa được load');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error);
    return false;
  }
}

// Test 2: Kiểm tra authentication flow
async function testAuthentication() {
  console.log('\n2️⃣ Kiểm tra authentication flow...');
  
  try {
    if (window.supabase) {
      // Test auth session
      const { data: session, error } = await window.supabase.auth.getSession();
      
      if (error) {
        console.log('⚠️ Auth session error:', error.message);
        return false;
      } else {
        console.log('✅ Auth session check: OK');
        console.log('📊 Current session:', session.session ? 'Đang đăng nhập' : 'Chưa đăng nhập');
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Lỗi authentication:', error);
    return false;
  }
}

// Test 3: Kiểm tra WebSocket real-time
async function testRealtime() {
  console.log('\n3️⃣ Kiểm tra WebSocket real-time...');
  
  try {
    if (window.supabase) {
      const channel = window.supabase.channel('test-channel');
      
      if (channel) {
        console.log('✅ WebSocket channel: OK');
        channel.unsubscribe();
        return true;
      } else {
        console.log('❌ WebSocket channel: Lỗi');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Lỗi WebSocket:', error);
    return false;
  }
}

// Chạy tất cả tests
async function runAllTests() {
  console.log('🚀 BẮT ĐẦU KIỂM TRA AUTHENTICATION...\n');
  
  const results = {
    supabaseConnection: await testSupabaseConnection(),
    authentication: await testAuthentication(),
    realtime: await testRealtime()
  };
  
  console.log('\n📊 KÉT QUỦ KIỂM TRA:');
  console.log('='.repeat(40));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`);
  });
  
  console.log(`\n🎯 TỔNG KẾT: ${passed}/${total} tests đã pass`);
  
  if (passed === total) {
    console.log('🎉 AUTHENTICATION HOẠT ĐỘNG HOÀN HẢO! 🎉');
  } else {
    console.log('⚠️ Còn vấn đề cần khắc phục...');
  }
  
  return results;
}

// Tự động chạy tests sau 2 giây
setTimeout(runAllTests, 2000);
