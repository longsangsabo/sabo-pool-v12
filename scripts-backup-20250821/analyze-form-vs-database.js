// Phân tích form EnhancedTournamentForm vs bảng tournaments

console.log('🔍 PHÂN TÍCH FORM VS DATABASE TOURNAMENTS TABLE');
console.log('='.repeat(60));

// Các cột hiện có trong bảng tournaments (từ câu INSERT)
const databaseColumns = [
  'id',
  'name', 
  'description',
  'tournament_type',
  'game_format',
  'tier_level',
  'max_participants',
  'current_participants',
  'entry_fee',
  'prize_pool',
  'first_prize',
  'second_prize', 
  'third_prize',
  'registration_start',
  'registration_end',
  'start_date',
  'end_date',
  'club_id',
  'venue_address',
  'created_by',
  'organizer_id',
  'status',
  'is_public',
  'requires_approval',
  'rules',
  'contact_info',
  'created_at',
  'updated_at',
  'tournament_start',
  'tournament_end',
  'min_rank_requirement',
  'max_rank_requirement',
  'eligible_ranks',
  'allow_all_ranks',
  'has_third_place_match',
  'comprehensive_rewards',
  'prize_distribution',
  'physical_prizes',
  'spa_points_config',
  'elo_points_config',
  'banner_image',
  'venue_name'
];

// Các trường trong form EnhancedTournamentForm (từ register() và setValue())
const formFields = [
  'name',
  'venue_address',
  'tournament_start',
  'tournament_end', 
  'registration_start',
  'registration_end',
  'description',
  'entry_fee',
  'prize_pool',
  // Từ schema và types
  'max_participants',
  'tournament_type',
  'game_format',
  'has_third_place_match',
  'rules',
  'contact_info',
  'min_rank_requirement',
  'max_rank_requirement',
  'rewards' // Đây là object phức tạp trong form
];

// Các trường tự động hoặc system fields
const systemFields = [
  'id',
  'created_at',
  'updated_at',
  'created_by',
  'club_id',
  'current_participants',
  'status'
];

console.log('1️⃣ CÁC CỘT HIỆN CÓ TRONG BẢNG TOURNAMENTS:');
console.log(`   Tổng: ${databaseColumns.length} cột`);
databaseColumns.forEach((col, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${col}`);
});

console.log('\n2️⃣ CÁC TRƯỜNG TRONG FORM ENHANCEDTOURNAMENTFORM:');
console.log(`   Tổng: ${formFields.length} trường`);
formFields.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field}`);
});

console.log('\n3️⃣ PHÂN TÍCH MAPPING:');

console.log('\n   ✅ CÁC TRƯỜNG FORM ĐÃ CÓ TRONG DATABASE:');
const matchedFields = formFields.filter(field => {
  // Special mappings
  if (field === 'rewards') return databaseColumns.includes('prize_distribution');
  return databaseColumns.includes(field);
});
matchedFields.forEach(field => {
  const dbField = field === 'rewards' ? 'prize_distribution' : field;
  console.log(`      ${field} -> ${dbField}`);
});

console.log('\n   ❌ CÁC TRƯỜNG FORM CHƯA CÓ TRONG DATABASE:');
const missingInDb = formFields.filter(field => {
  if (field === 'rewards') return !databaseColumns.includes('prize_distribution');
  return !databaseColumns.includes(field);
});
missingInDb.forEach(field => {
  console.log(`      ${field} (cần thêm vào database)`);
});

console.log('\n   📋 CÁC CỘT DATABASE CHƯA SỬ DỤNG TRONG FORM:');
const unusedInForm = databaseColumns.filter(col => {
  return !formFields.includes(col) && !systemFields.includes(col);
});
unusedInForm.forEach(col => {
  console.log(`      ${col} (có thể cần form field)`);
});

console.log('\n4️⃣ KHUYẾN NGHỊ:');

console.log('\n   🎯 CÁC CỘT CẦN THÊM VÀO DATABASE:');
if (missingInDb.length === 0) {
  console.log('      ✅ Tất cả trường form đều đã có mapping trong database');
} else {
  missingInDb.forEach(field => {
    console.log(`      - ADD COLUMN ${field}`);
  });
}

console.log('\n   🔧 CÁC TRƯỜNG CÓ THỂ THÊM VÀO FORM:');
const suggestedFormFields = [
  'venue_name', // Tên địa điểm (khác với address)
  'banner_image', // Ảnh banner giải đấu
  'is_public', // Công khai hay riêng tư
  'requires_approval', // Cần phê duyệt đăng ký
  'tier_level', // Cấp độ giải đấu
  'allow_all_ranks', // Cho phép mọi rank
  'eligible_ranks', // Các rank được phép tham gia
  'organizer_id', // ID người tổ chức (khác created_by)
];

suggestedFormFields.forEach(field => {
  if (databaseColumns.includes(field) && !formFields.includes(field)) {
    console.log(`      - ADD FORM FIELD: ${field}`);
  }
});

console.log('\n   💡 CÁC CỘT CÓ THỂ LOẠI BỎ KHỎI DATABASE:');
const possiblyUnused = [
  'first_prize', // Thay bằng prize_distribution
  'second_prize', // Thay bằng prize_distribution  
  'third_prize', // Thay bằng prize_distribution
  'comprehensive_rewards', // Trùng với prize_distribution
  'start_date', // Trùng với tournament_start
  'end_date', // Trùng với tournament_end
];

possiblyUnused.forEach(col => {
  if (databaseColumns.includes(col)) {
    console.log(`      - CONSIDER REMOVING: ${col} (có thể trùng lặp)`);
  }
});

console.log('\n5️⃣ TỔNG KẾT:');
console.log(`   📊 Database có: ${databaseColumns.length} cột`);
console.log(`   📝 Form có: ${formFields.length} trường`);
console.log(`   ✅ Mapping thành công: ${matchedFields.length} trường`);
console.log(`   ❌ Thiếu trong DB: ${missingInDb.length} trường`);
console.log(`   📋 Chưa dùng trong form: ${unusedInForm.length} cột`);

console.log('\n' + '='.repeat(60));
console.log('✅ PHÂN TÍCH HOÀN TẤT');
