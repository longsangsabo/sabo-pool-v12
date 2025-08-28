import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function listClubOwners() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  console.log('🔍 Tìm kiếm Club Owners có sẵn...');
  console.log('=====================================\n');

  try {
    // 1. Tìm tất cả club profiles đã được approve
    const { data: clubProfiles, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('verification_status', 'approved');

    if (clubError) {
      console.error('❌ Lỗi khi lấy club profiles:', clubError.message);
      return;
    }

    console.log(`🏢 Tìm thấy ${clubProfiles.length} club đã được approve:`);
    
    for (const club of clubProfiles) {
      console.log(`\n🏆 Club: ${club.club_name}`);
      console.log(`   ID: ${club.id}`);
      console.log(`   Owner User ID: ${club.user_id}`);
      
      // Lấy thông tin owner
      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('display_name, email, role')
        .eq('user_id', club.user_id)
        .single();
        
      if (!ownerError && ownerProfile) {
        console.log(`   👤 Owner: ${ownerProfile.display_name}`);
        console.log(`   📧 Email: ${ownerProfile.email}`);
        console.log(`   🔑 Role: ${ownerProfile.role}`);
        
        // Kiểm tra auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(club.user_id);
        
        if (!authError && authUser.user) {
          console.log(`   ✅ Auth Status: Active`);
          console.log(`   📅 Last Sign In: ${authUser.user.last_sign_in_at || 'Never'}`);
        } else {
          console.log(`   ❌ Auth Status: ${authError?.message || 'Unknown error'}`);
        }
      } else {
        console.log(`   ❌ Profile Error: ${ownerError?.message || 'Unknown error'}`);
      }
    }

    if (clubProfiles.length === 0) {
      console.log('\n❌ Không có club nào được approve');
      console.log('💡 Hành động cần thiết:');
      console.log('   1. Tạo tài khoản mới');
      console.log('   2. Đăng ký club');
      console.log('   3. Admin approve club');
    } else {
      console.log('\n💡 Để test club management:');
      console.log('   1. Đăng nhập bằng một trong các email ở trên');
      console.log('   2. Truy cập: http://localhost:8080/club-management');
    }

    // 2. Kiểm tra club registrations đang chờ approve
    const { data: pendingRegs, error: pendingError } = await supabase
      .from('club_registrations')
      .select('*')
      .eq('status', 'pending');

    if (!pendingError && pendingRegs.length > 0) {
      console.log(`\n📋 ${pendingRegs.length} club registrations đang chờ approve:`);
      for (const reg of pendingRegs) {
        console.log(`   - ${reg.club_name} (User ID: ${reg.user_id})`);
      }
    }

  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

listClubOwners();
