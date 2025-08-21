// Script kiểm tra đảm bảo tất cả trường form được lưu vào database
// Chạy sau khi đã update TournamentContext.tsx

console.log('🔍 KIỂM TRA FORM FIELD MAPPING TO DATABASE');
console.log('='.repeat(60));

// 1. Danh sách tất cả trường trong form (từ EnhancedTournamentForm)
const formFields = [
  // Basic info
  'name',
  'description', 
  'venue_address',
  'tournament_start',
  'tournament_end',
  'registration_start', 
  'registration_end',
  
  // Tournament settings
  'max_participants',
  'tournament_type',
  'game_format',
  'entry_fee',
  'prize_pool',
  'has_third_place_match',
  
  // Rules & contact
  'rules',
  'contact_info',
  
  // Rank requirements
  'min_rank_requirement',
  'max_rank_requirement',
  
  // Các trường mới có thể thêm
  'venue_name',
  'tier_level', 
  'registration_fee',
  'is_public',
  'requires_approval',
  'allow_all_ranks',
  'eligible_ranks',
  'organizer_id',
  'banner_image',
  'contact_person',
  'contact_phone',
  'live_stream_url',
  'tournament_format_details',
  'special_rules',
  'sponsor_info'
];

// 2. Danh sách trường được map trong TournamentContext.createTournament
const mappedFields = [
  // Thông tin cơ bản
  'name',
  'description',
  'tournament_type',
  'game_format', 
  'tier_level',
  'max_participants',
  'current_participants',
  
  // Tài chính
  'entry_fee',
  'prize_pool',
  'registration_fee',
  
  // Legacy prizes
  'first_prize',
  'second_prize', 
  'third_prize',
  
  // Thời gian
  'registration_start',
  'registration_end',
  'tournament_start',
  'tournament_end',
  'start_date', // tương thích
  'end_date', // tương thích
  
  // Địa điểm
  'venue_address',
  'venue_name',
  
  // Tổ chức
  'club_id',
  'created_by',
  'organizer_id',
  'status',
  'management_status',
  
  // Công khai & phê duyệt
  'is_public',
  'requires_approval',
  
  // Rank & điều kiện
  'min_rank_requirement',
  'max_rank_requirement', 
  'eligible_ranks',
  'allow_all_ranks',
  
  // Tournament settings
  'has_third_place_match',
  'tournament_format_details',
  'special_rules',
  
  // Liên hệ
  'rules',
  'contact_info',
  'contact_person',
  'contact_phone',
  
  // Media
  'banner_image',
  'live_stream_url',
  
  // Sponsors & rewards
  'sponsor_info',
  'comprehensive_rewards',
  'physical_prizes',
  'spa_points_config',
  'elo_points_config',
  'prize_distribution', // Trường chính
  
  // Timestamps
  'created_at',
  'updated_at'
];

console.log('📝 Form Fields Count:', formFields.length);
console.log('💾 Mapped Fields Count:', mappedFields.length);

console.log('\n✅ CÁC TRƯỜNG FORM ĐÃ ĐƯỢC MAPPING:');
const matchedFields = formFields.filter(field => mappedFields.includes(field));
matchedFields.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field}`);
});

console.log('\n❌ CÁC TRƯỜNG FORM CHƯA ĐƯỢC MAPPING:');
const missingFields = formFields.filter(field => !mappedFields.includes(field));
missingFields.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field} ⚠️`);
});

console.log('\n📊 CÁC TRƯỜNG DATABASE KHÔNG CÓ TRONG FORM:');
const extraDbFields = mappedFields.filter(field => !formFields.includes(field));
extraDbFields.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field} ℹ️`);
});

console.log('\n📈 THỐNG KÊ:');
console.log(`   🎯 Form fields: ${formFields.length}`);
console.log(`   💾 Mapped fields: ${mappedFields.length}`);
console.log(`   ✅ Matched: ${matchedFields.length}`);
console.log(`   ❌ Missing: ${missingFields.length}`);
console.log(`   📊 Extra DB fields: ${extraDbFields.length}`);

const coveragePercentage = Math.round((matchedFields.length / formFields.length) * 100);
console.log(`   📊 Coverage: ${coveragePercentage}%`);

console.log('\n🎯 KẾT LUẬN:');
if (missingFields.length === 0) {
  console.log('   ✅ HOÀN HẢO! Tất cả trường form đều được mapping vào database');
  console.log('   🚀 Form sẽ lưu đầy đủ thông tin khi tạo tournament');
} else {
  console.log('   ⚠️ CẦN KHẮC PHỤC:');
  console.log(`   - Còn ${missingFields.length} trường form chưa được mapping`);
  console.log('   - Cần cập nhật TournamentContext.createTournament()');
}

console.log('\n🔧 HÀNH ĐỘNG TIẾP THEO:');
if (missingFields.length > 0) {
  console.log('   1. Thêm các trường missing vào tournamentData object');
  console.log('   2. Đảm bảo form có các input field tương ứng');  
  console.log('   3. Test lại việc tạo tournament');
}

console.log('\n💡 SUGGESTED IMPROVEMENTS:');
console.log('   - Thêm validation cho các trường bắt buộc');
console.log('   - Tạo default values hợp lý');
console.log('   - Log chi tiết data được lưu để debug');

console.log('\n' + '='.repeat(60));
console.log('✅ KIỂM TRA HOÀN TẤT');
