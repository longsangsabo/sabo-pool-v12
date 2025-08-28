// =============================================
// CREATE 32-PLAYER TOURNAMENT FOR TESTING
// Tạo tournament với 32 người để test nút "Tạo bảng đấu"
// =============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vtrrfpttqhqcjkqzqgei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnJmcHR0cWhxY2prcXpxZ2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0OTY1NDksImV4cCI6MjA0NzA3MjU0OX0.IUJGrmZGZSqTJEdhOLtb1KdgGW7-m7_FGYIRm-8rIzY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTournament32() {
  console.log('🎯 Tạo tournament với 32 người chơi...');
  
  try {
    // 1. Tạo tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Test Tournament 32 Players',
        tournament_type: 'double_elimination',
        max_participants: 32,
        status: 'registration',
        description: 'Tournament test với 32 người chơi cho SABO double elimination'
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('❌ Lỗi tạo tournament:', tournamentError);
      return;
    }

    console.log('✅ Tournament created:', tournament.id);
    console.log('📝 Name:', tournament.name);

    // 2. Tạo 32 fake users
    const fakeUsers = [];
    for (let i = 1; i <= 32; i++) {
      fakeUsers.push({
        tournament_id: tournament.id,
        user_id: `fake-user-${String(i).padStart(2, '0')}`,
        registration_status: 'confirmed',
        payment_status: 'paid',
        registration_date: new Date().toISOString()
      });
    }

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert(fakeUsers);

    if (regError) {
      console.error('❌ Lỗi tạo registrations:', regError);
      return;
    }

    console.log('✅ 32 người chơi đã đăng ký');

    // 3. Hiển thị thông tin
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TOURNAMENT SẴN SÀNG!');
    console.log('='.repeat(50));
    console.log(`📋 Tournament ID: ${tournament.id}`);
    console.log(`👥 Số người chơi: 32`);
    console.log(`🎮 Loại tournament: double_elimination`);
    console.log(`📱 Truy cập: http://localhost:8000`);
    console.log('');
    console.log('📍 HƯỚNG DẪN TEST:');
    console.log('1. Vào trang http://localhost:8000');
    console.log('2. Tìm tournament "Test Tournament 32 Players"');
    console.log('3. Click nút "Tạo bảng đấu" (hoặc "Tạo SABO Bracket")');
    console.log('4. Kiểm tra xem có tạo được 53 trận đấu không');
    console.log('5. Xem bảng đấu có hiển thị 2 groups A & B không');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Chạy
createTournament32();
