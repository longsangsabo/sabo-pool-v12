console.log('🧪 THỰC NGHIỆM TẠO GIẢI ĐẤU VỚI PHẦN THƯỞNG');
console.log('=' .repeat(60));

// Test data cho tournament mới
const testTournament = {
  name: "Test Tournament Prize System",
  description: "Testing prize system functionality",
  tournament_type: "double_elimination",
  
  // Timing
  tournament_start: "2025-02-01 10:00:00",
  tournament_end: "2025-02-01 18:00:00",
  registration_start: "2025-01-25 00:00:00", 
  registration_end: "2025-01-31 23:59:59",
  
  // Participants
  max_participants: 16,
  
  // Financial
  entry_fee: 200000, // 200K VND
  prize_pool: 2500000, // 2.5M VND
  
  // Settings
  is_public: true,
  requires_approval: false,
  allow_all_ranks: false,
  eligible_ranks: ["I", "H", "G"],
  
  // Venue
  venue_name: "SABO Test Center",
  venue_address: "123 Test Street",
  contact_person: "Test Organizer",
  contact_phone: "0901234567"
};

console.log('📋 Test Tournament Data:');
console.log(JSON.stringify(testTournament, null, 2));

// Test prize distribution calculations
console.log('\n🏆 PRIZE DISTRIBUTION TEST:');

// Template tiêu chuẩn
const standardTemplate = {
  total_positions: 16,
  total_prize_pool: testTournament.prize_pool,
  distribution_percentages: {
    1: 0.40,    // 40%
    2: 0.24,    // 24% 
    3: 0.16,    // 16%
    4: 0.08,    // 8%
    5: 0.04,    // 4%
    6: 0.04,    // 4%
    7: 0.02,    // 2%
    8: 0.02,    // 2%
    9: 0.01125, // 1.125%
    10: 0.01125, // 1.125%
    11: 0.01125, // 1.125%
    12: 0.01125, // 1.125%
    13: 0.005625, // 0.5625%
    14: 0.005625, // 0.5625%
    15: 0.005625, // 0.5625%
    16: 0.005625  // 0.5625%
  }
};

console.log('📊 Standard Template Distribution:');
let totalDistributed = 0;
for (let position = 1; position <= 16; position++) {
  const percentage = standardTemplate.distribution_percentages[position];
  const amount = Math.floor(testTournament.prize_pool * percentage);
  totalDistributed += amount;
  
  console.log(`Position ${position}: ${(percentage * 100).toFixed(3)}% = ${amount.toLocaleString()} VND`);
}

console.log(`\n💰 Total Distributed: ${totalDistributed.toLocaleString()} VND`);
console.log(`💸 Prize Pool: ${testTournament.prize_pool.toLocaleString()} VND`);
console.log(`📈 Distribution Rate: ${((totalDistributed / testTournament.prize_pool) * 100).toFixed(1)}%`);
console.log(`💵 Remaining: ${(testTournament.prize_pool - totalDistributed).toLocaleString()} VND`);

// Revenue calculation
const totalRevenue = testTournament.entry_fee * testTournament.max_participants;
const profit = totalRevenue - testTournament.prize_pool;

console.log('\n💼 FINANCIAL ANALYSIS:');
console.log(`📊 Entry Fee: ${testTournament.entry_fee.toLocaleString()} VND x ${testTournament.max_participants} players`);
console.log(`💰 Total Revenue: ${totalRevenue.toLocaleString()} VND`);
console.log(`🏆 Prize Pool: ${testTournament.prize_pool.toLocaleString()} VND`);
console.log(`📈 Profit: ${profit.toLocaleString()} VND`);
console.log(`📊 Profit Margin: ${((profit / totalRevenue) * 100).toFixed(1)}%`);

// Test ELO and SPA points
console.log('\n⭐ ELO & SPA POINTS TEST:');

const eloDistribution = {
  1: 100, 2: 75, 3: 50, 4: 40,
  5: 30, 6: 30, 7: 25, 8: 25,
  9: 20, 10: 20, 11: 20, 12: 20,
  13: 15, 14: 15, 15: 15, 16: 15,
  99: 1 // participation
};

const spaDistribution = {
  I: { // I rank
    1: 1000, 2: 800, 3: 600, 4: 400,
    5: 300, 6: 300, 7: 250, 8: 250,
    9: 200, 10: 200, 11: 200, 12: 200,
    13: 150, 14: 150, 15: 150, 16: 150,
    99: 50
  },
  H: { // H rank  
    1: 1200, 2: 900, 3: 700, 4: 500,
    5: 350, 6: 350, 7: 300, 8: 300,
    9: 250, 10: 250, 11: 250, 12: 250,
    13: 200, 14: 200, 15: 200, 16: 200,
    99: 75
  }
};

console.log('🎯 ELO Points Distribution:');
Object.entries(eloDistribution).forEach(([pos, points]) => {
  if (pos === '99') {
    console.log(`Participation: ${points} ELO`);
  } else {
    console.log(`Position ${pos}: ${points} ELO`);
  }
});

console.log('\n🏆 SPA Points Distribution (for I rank):');
Object.entries(spaDistribution.I).forEach(([pos, points]) => {
  if (pos === '99') {
    console.log(`Participation: ${points} SPA`);
  } else {
    console.log(`Position ${pos}: ${points} SPA`);
  }
});

// Test validation
console.log('\n✅ VALIDATION CHECKS:');

const validationChecks = [
  {
    check: 'Prize Pool vs Revenue',
    valid: testTournament.prize_pool <= totalRevenue,
    message: testTournament.prize_pool <= totalRevenue ? 'PASS: Prize pool không vượt quá revenue' : 'FAIL: Prize pool vượt quá revenue'
  },
  {
    check: 'Distribution Completeness', 
    valid: Math.abs(totalDistributed - testTournament.prize_pool) <= 100,
    message: Math.abs(totalDistributed - testTournament.prize_pool) <= 100 ? 'PASS: Distribution hoàn chỉnh' : 'FAIL: Distribution không đủ'
  },
  {
    check: 'Minimum Profit',
    valid: profit >= 0,
    message: profit >= 0 ? 'PASS: Có lợi nhuận' : 'FAIL: Thua lỗ'
  },
  {
    check: 'Tournament Duration',
    valid: new Date(testTournament.tournament_end) > new Date(testTournament.tournament_start),
    message: new Date(testTournament.tournament_end) > new Date(testTournament.tournament_start) ? 'PASS: Thời gian hợp lệ' : 'FAIL: Thời gian không hợp lệ'
  }
];

validationChecks.forEach((check, index) => {
  const status = check.valid ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${check.check}: ${check.message}`);
});

console.log('\n🎯 KẾT QUẢ ĐÁNH GIÁ:');
const passedChecks = validationChecks.filter(c => c.valid).length;
const totalChecks = validationChecks.length;
console.log(`📊 Validation Score: ${passedChecks}/${totalChecks} (${((passedChecks/totalChecks) * 100).toFixed(1)}%)`);

if (passedChecks === totalChecks) {
  console.log('🎉 PASS: Hệ thống phần thưởng hoạt động tốt!');
} else {
  console.log('⚠️ WARNING: Có vấn đề cần xem xét!');
}

console.log('\n🔗 NEXT STEPS:');
console.log('1. Test UI form với data này');
console.log('2. Kiểm tra TournamentPrizesManager component');
console.log('3. Verify database operations');
console.log('4. Test template switching');
console.log('5. Check mobile responsiveness');

console.log('\n' + '=' .repeat(60));
