// Phân tích câu INSERT để tìm vấn đề

console.log('🔍 PHÂN TÍCH CÂU INSERT - TÌM VẤN ĐỀ');
console.log('='.repeat(60));

// Parse the INSERT statement
const insertData = {
  id: '50d52b2d-f75a-4521-8794-5902189df345',
  name: 'SABO OPEN - Pool 9 Ball - Rank H - I - K',
  description: 'Test Description',
  tournament_type: 'double_elimination',
  game_format: '9_ball',
  tier_level: null, // ❌ NULL
  max_participants: '16',
  current_participants: '0',
  entry_fee: '150000',
  prize_pool: '2000000',
  registration_start: '2025-08-15 05:00:00+00',
  registration_end: '2025-08-15 16:11:06.681+00',
  club_id: 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa',
  venue_address: '601A Nguyễn An Ninh - TP Vũng Tàu',
  created_by: '18f49e79-f402-46d1-90be-889006e9761c',
  organizer_id: null, // ❌ NULL  
  status: 'upcoming',
  is_public: null, // ❌ NULL
  requires_approval: null, // ❌ NULL
  rules: null, // ❌ NULL
  contact_info: '{}',
  created_at: '2025-08-15 04:11:07.694942+00',
  updated_at: '2025-08-15 04:48:37.174247+00',
  tournament_start: '2025-08-17 05:00:00+00',
  tournament_end: '2025-08-18 05:00:00+00',
  min_rank_requirement: null, // ❌ NULL
  max_rank_requirement: null, // ❌ NULL
  eligible_ranks: null, // ❌ NULL
  allow_all_ranks: null, // ❌ NULL
  has_third_place_match: 'false',
  prize_distribution: '{}', // ❌ EMPTY OBJECT
  physical_prizes: '[]',
  spa_points_config: '{}',
  elo_points_config: '{}',
  banner_image: null, // ❌ NULL
  first_prize: '0.00', // ❌ ZERO
  second_prize: '0.00', // ❌ ZERO
  third_prize: '0.00', // ❌ ZERO
  start_date: '2025-08-17 05:00:00+00',
  end_date: '2025-08-18 05:00:00+00',
  comprehensive_rewards: '{}' // ❌ EMPTY
};

console.log('✅ CÁC TRƯỜNG CÓ DỮ LIỆU:');
const fieldsWithData = [];
const fieldsWithNull = [];
const fieldsWithEmptyJson = [];

Object.entries(insertData).forEach(([key, value]) => {
  if (value === null) {
    fieldsWithNull.push(key);
  } else if (value === '{}' || value === '[]') {
    fieldsWithEmptyJson.push(key);
  } else if (value === '0.00' || value === '0') {
    // Có thể là giá trị hợp lệ hoặc mặc định
    if (['current_participants', 'first_prize', 'second_prize', 'third_prize'].includes(key)) {
      fieldsWithData.push(`${key}: ${value} (có thể hợp lệ)`);
    }
  } else {
    fieldsWithData.push(`${key}: ${value}`);
  }
});

fieldsWithData.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field}`);
});

console.log('\n❌ CÁC TRƯỜNG NULL (THIẾU DỮ LIỆU):');
fieldsWithNull.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field} ⚠️`);
});

console.log('\n⚠️ CÁC TRƯỜNG EMPTY JSON/ARRAY:');
fieldsWithEmptyJson.forEach((field, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${field} ⚠️`);
});

console.log('\n🔍 PHÂN TÍCH VẤN ĐỀ:');

console.log('\n1️⃣ PRIZE DISTRIBUTION RỖNG:');
console.log('   - prize_distribution: {} (nên có 16 positions)');
console.log('   - first_prize: 0.00 (nên > 0)');
console.log('   - second_prize: 0.00 (nên > 0)');
console.log('   - comprehensive_rewards: {} (rỗng)');
console.log('   ❌ TournamentPrizesService.createDefaultPrizeTemplate() KHÔNG HOẠT ĐỘNG');

console.log('\n2️⃣ CÁC TRƯỜNG SETTINGS NULL:');
fieldsWithNull.forEach(field => {
  if (!['organizer_id', 'tier_level', 'banner_image'].includes(field)) {
    console.log(`   - ${field}: null (nên có giá trị mặc định)`);
  }
});

console.log('\n3️⃣ VẤN ĐỀ TRONG CODE:');
console.log('   ❌ tournament object trong form có thể null/undefined cho nhiều fields');
console.log('   ❌ TournamentContext.createTournament() không set default values đúng');
console.log('   ❌ Form validation có thể không đầy đủ');

console.log('\n🔧 CÁC VƯỚNG MẮC CẦN KHẮC PHỤC:');
console.log('   1. prize_distribution phải có 16 positions, không được rỗng');
console.log('   2. is_public nên mặc định true, không được null');
console.log('   3. requires_approval nên mặc định false, không được null');
console.log('   4. allow_all_ranks nên mặc định true, không được null');
console.log('   5. eligible_ranks nên mặc định [], không được null');
console.log('   6. rules nên mặc định "", không được null');
console.log('   7. min/max_rank_requirement có thể null nhưng cần check logic');

console.log('\n📊 THỐNG KÊ:');
console.log(`   ✅ Có data: ${fieldsWithData.length} fields`);
console.log(`   ❌ NULL: ${fieldsWithNull.length} fields`);
console.log(`   ⚠️ Empty JSON: ${fieldsWithEmptyJson.length} fields`);

const totalFields = fieldsWithData.length + fieldsWithNull.length + fieldsWithEmptyJson.length;
const healthScore = Math.round(((fieldsWithData.length) / totalFields) * 100);
console.log(`   📊 Data Health Score: ${healthScore}%`);

console.log('\n🎯 HÀNH ĐỘNG KHẮC PHỤC:');
console.log('   1. Fix TournamentContext.createTournament() - set đúng default values');
console.log('   2. Ensure TournamentPrizesService.createDefaultPrizeTemplate() works');  
console.log('   3. Add form validation để prevent null fields');
console.log('   4. Test lại với form đầy đủ thông tin');

console.log('\n' + '='.repeat(60));
console.log('❌ PHÁT HIỆN NHIỀU VẤN ĐỀ - CẦN KHẮC PHỤC NGAY');
