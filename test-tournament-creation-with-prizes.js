console.log('🎯 Testing Tournament Creation with Full Prize Distribution...');

// Mock tournament data with comprehensive fields
const mockTournament = {
  // Basic info
  name: "Test Tournament Full Prizes",
  description: "Testing full prize distribution and field mapping",
  tournament_type: "double_elimination",
  
  // Timing
  tournament_start: "2025-01-15 10:00:00",
  tournament_end: "2025-01-15 18:00:00", 
  registration_start: "2025-01-10 00:00:00",
  registration_end: "2025-01-14 23:59:59",
  
  // Participants
  max_participants: 16,
  current_participants: 0,
  total_players: 16,
  
  // Prize information
  prize_pool: 5000000, // 5M VND
  first_prize: 2000000, // 2M VND  
  second_prize: 1200000, // 1.2M VND
  third_prize: 800000, // 800K VND
  entry_fee: 100000, // 100K VND
  
  // Configuration
  is_public: true,
  requires_approval: false,
  allow_all_ranks: false,
  eligible_ranks: ["I", "I+", "H", "H+"],
  min_rank_requirement: "I",
  max_rank_requirement: "H+",
  
  // Tournament details
  venue_name: "SABO Pool Center", 
  contact_person: "Lê Văn Tèo",
  contact_phone: "0901234567",
  tier_level: "A",
  tournament_format_details: "Double elimination bracket",
  special_rules: "Standard 8-ball rules apply",
  
  // Additional info
  organizer_id: "550e8400-e29b-41d4-a716-446655440000",
  banner_image: "/images/tournaments/test-banner.jpg",
  registration_fee: 50000,
  live_stream_url: "https://youtube.com/live/test123",
  sponsor_info: "Sponsored by SABO Pool"
};

console.log('📊 Mock tournament data:', JSON.stringify(mockTournament, null, 2));

// Test prize distribution generation logic
const generatePrizeTemplate = (prizePool, firstPrize, secondPrize, thirdPrize) => {
  const positions = [];
  
  for (let i = 1; i <= 16; i++) {
    let cashAmount = 0;
    let positionName = '';
    
    if (i === 1) {
      cashAmount = firstPrize || Math.floor(prizePool * 0.4);
      positionName = 'Vô địch';
    } else if (i === 2) {
      cashAmount = secondPrize || Math.floor(prizePool * 0.24);
      positionName = 'Á quân';
    } else if (i === 3) {
      cashAmount = thirdPrize || Math.floor(prizePool * 0.16);
      positionName = 'Hạng 3';
    } else if (i === 4) {
      cashAmount = Math.floor(prizePool * 0.08);
      positionName = 'Hạng 4';
    } else if (i <= 6) {
      cashAmount = Math.floor(prizePool * 0.04);
      positionName = `Hạng 5-6`;
    } else if (i <= 8) {
      cashAmount = Math.floor(prizePool * 0.02);
      positionName = `Hạng 7-8`;
    } else if (i <= 12) {
      cashAmount = Math.floor(prizePool * 0.01125);
      positionName = `Hạng 9-12`;
    } else {
      cashAmount = Math.floor(prizePool * 0.005625);
      positionName = `Hạng 13-16`;
    }
    
    positions.push({
      prize_position: i,
      position_name: positionName,
      cash_amount: cashAmount,
      elo_points: i === 1 ? 100 : i === 2 ? 50 : i === 3 ? 25 : i === 4 ? 12 : 5,
      spa_points: i === 1 ? 1500 : i === 2 ? 1100 : i === 3 ? 900 : i === 4 ? 650 : 320,
      physical_items: [],
      color_theme: i <= 3 ? 'gold' : i <= 8 ? 'silver' : 'bronze',
      is_visible: true,
      is_guaranteed: true
    });
  }
  
  return positions;
};

const prizeTemplate = generatePrizeTemplate(
  mockTournament.prize_pool,
  mockTournament.first_prize,
  mockTournament.second_prize,
  mockTournament.third_prize
);

console.log('🏆 Generated Prize Template:');
console.log('- Total positions:', prizeTemplate.length);
console.log('- Prize summary:');
prizeTemplate.slice(0, 8).forEach(p => {
  console.log(`  Position ${p.prize_position}: ${p.position_name} - ${p.cash_amount.toLocaleString()} VND`);
});

// Test prize_distribution JSONB structure
const prizeDistribution = {
  total_positions: 16,
  total_prize_pool: mockTournament.prize_pool,
  positions: prizeTemplate.map(prize => ({
    position: prize.prize_position,
    name: prize.position_name,
    cash_amount: prize.cash_amount,
    elo_points: prize.elo_points,
    spa_points: prize.spa_points,
    physical_items: prize.physical_items || [],
    color_theme: prize.color_theme,
    is_visible: prize.is_visible,
    is_guaranteed: prize.is_guaranteed
  })),
  created_at: new Date().toISOString(),
  prize_summary: {
    position_1: prizeTemplate.find(p => p.prize_position === 1)?.cash_amount || 0,
    position_2: prizeTemplate.find(p => p.prize_position === 2)?.cash_amount || 0,
    position_3: prizeTemplate.find(p => p.prize_position === 3)?.cash_amount || 0,
    position_4: prizeTemplate.find(p => p.prize_position === 4)?.cash_amount || 0,
    total_distributed: prizeTemplate.reduce((sum, p) => sum + p.cash_amount, 0)
  }
};

console.log('🎯 Prize Distribution JSONB Structure:');
console.log('- Total positions:', prizeDistribution.total_positions);
console.log('- Total prize pool:', prizeDistribution.total_prize_pool.toLocaleString(), 'VND');
console.log('- Positions array length:', prizeDistribution.positions.length);
console.log('- Prize summary:', prizeDistribution.prize_summary);

// Validate completeness
const totalDistributed = prizeDistribution.prize_summary.total_distributed;
const prizePool = prizeDistribution.total_prize_pool;
const distributionPercentage = ((totalDistributed / prizePool) * 100).toFixed(1);

console.log('📈 Distribution Analysis:');
console.log('- Prize pool:', prizePool.toLocaleString(), 'VND');
console.log('- Total distributed:', totalDistributed.toLocaleString(), 'VND');  
console.log('- Distribution percentage:', distributionPercentage + '%');

// Test that all 16 positions have valid data
const validPositions = prizeDistribution.positions.filter(p => 
  p.position && p.name && p.cash_amount >= 0 && p.elo_points >= 0 && p.spa_points >= 0
);

console.log('✅ Data Validation:');
console.log('- Valid positions:', validPositions.length, '/ 16');
console.log('- All positions valid:', validPositions.length === 16 ? 'YES' : 'NO');

if (validPositions.length === 16) {
  console.log('🎉 Prize distribution structure is COMPLETE and ready for database!');
} else {
  console.log('❌ Prize distribution has missing or invalid data');
}

console.log('🔍 Sample of final prize_distribution JSONB:');
console.log(JSON.stringify(prizeDistribution, null, 2));
