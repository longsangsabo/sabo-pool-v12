console.log('🎯 Debug Tournament Creation - Inspect each step...');

// Simulate the exact flow in TournamentContext.createTournament()
const mockTournament = {
  name: "Debug Test Tournament",
  description: "Testing data persistence issue",
  tournament_type: "double_elimination",
  tournament_start: "2025-01-15 10:00:00",
  tournament_end: "2025-01-15 18:00:00", 
  registration_start: "2025-01-10 00:00:00",
  registration_end: "2025-01-14 23:59:59",
  max_participants: 16,
  prize_pool: 1000000,
  first_prize: 400000,
  second_prize: 240000,
  third_prize: 160000,
  entry_fee: 50000,
  is_public: true,
  requires_approval: false,
  allow_all_ranks: false,
  eligible_ranks: ["H", "H+", "G", "G+"],
  venue_name: "Test Venue"
};

console.log('📋 Input tournament object:', JSON.stringify(mockTournament, null, 2));

// Step 1: Generate prize template (same as in TournamentContext)
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
  mockTournament.prize_pool || 1000000,
  mockTournament.first_prize || 0,
  mockTournament.second_prize || 0,
  mockTournament.third_prize || 0
);

console.log('🎯 Step 1 - Prize template generated:', prizeTemplate.length, 'positions');

// Step 2: Create tournament data object (same structure as TournamentContext)
const now = new Date().toISOString();
const tournamentData = {
  // ===== THÔNG TIN CƠ BẢN =====
  name: mockTournament.name,
  description: mockTournament.description || '',
  tournament_type: mockTournament.tournament_type || 'double_elimination',
  
  // ===== THỜI GIAN =====
  tournament_start: mockTournament.tournament_start ? new Date(mockTournament.tournament_start).toISOString() : null,
  tournament_end: mockTournament.tournament_end ? new Date(mockTournament.tournament_end).toISOString() : null,
  registration_start: mockTournament.registration_start ? new Date(mockTournament.registration_start).toISOString() : null,
  registration_end: mockTournament.registration_end ? new Date(mockTournament.registration_end).toISOString() : null,
  
  // ===== NGƯỜI CHƠI =====
  max_participants: mockTournament.max_participants || 16,
  current_participants: mockTournament.current_participants || 0,
  
  // ===== THÔNG TIN TÀI CHÍNH =====
  prize_pool: mockTournament.prize_pool || 0,
  entry_fee: mockTournament.entry_fee || 0,
  registration_fee: mockTournament.registration_fee || 0,
  
  // ===== RANK & ĐIỀU KIỆN =====
  min_rank_requirement: mockTournament.min_rank_requirement || null,
  max_rank_requirement: mockTournament.max_rank_requirement || null,
  eligible_ranks: mockTournament.eligible_ranks || [],
  allow_all_ranks: mockTournament.allow_all_ranks !== undefined ? mockTournament.allow_all_ranks : true,
  
  // ===== CẤU HÌNH GIẢI ĐẤU =====
  is_public: mockTournament.is_public !== undefined ? mockTournament.is_public : true,
  requires_approval: mockTournament.requires_approval !== undefined ? mockTournament.requires_approval : false,
  
  // ===== ĐỊA ĐIỂM & LIÊN HỆ =====
  venue_name: mockTournament.venue_name || null,
  venue_address: mockTournament.venue_address || null,
  contact_person: mockTournament.contact_person || null,
  contact_phone: mockTournament.contact_phone || null,
  
  // ===== TRẠNG THÁI & METADATA =====
  status: 'upcoming',
  tier_level: mockTournament.tier_level || null,
  tournament_format_details: mockTournament.tournament_format_details || null,
  special_rules: mockTournament.special_rules || null,
  organizer_id: mockTournament.organizer_id || null,
  banner_image: mockTournament.banner_image || null,
  live_stream_url: mockTournament.live_stream_url || null,
  sponsor_info: mockTournament.sponsor_info || null,
  
  // ===== JSONB CONFIGURATIONS =====
  spa_points_config: mockTournament.spa_points_config || {},
  elo_points_config: mockTournament.elo_points_config || {},
  
  // 🏆 TRƯỜNG PRIZE_DISTRIBUTION CHỦ YẾU - ĐẦY ĐỦ 16 VỊ TRÍ
  prize_distribution: {
    total_positions: 16,
    total_prize_pool: mockTournament.prize_pool || 1000000,
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
    created_at: now,
    prize_summary: {
      position_1: prizeTemplate.find(p => p.prize_position === 1)?.cash_amount || 0,
      position_2: prizeTemplate.find(p => p.prize_position === 2)?.cash_amount || 0,
      position_3: prizeTemplate.find(p => p.prize_position === 3)?.cash_amount || 0,
      position_4: prizeTemplate.find(p => p.prize_position === 4)?.cash_amount || 0,
      total_distributed: prizeTemplate.reduce((sum, p) => sum + p.cash_amount, 0)
    }
  },
  
  // ===== TIMESTAMPS =====
  created_at: now,
  updated_at: now,
};

console.log('🎯 Step 2 - Tournament data object created');
console.log('📊 Data health check:');

// Check each critical field
const criticalFields = {
  name: tournamentData.name,
  tournament_type: tournamentData.tournament_type,
  max_participants: tournamentData.max_participants,
  prize_pool: tournamentData.prize_pool,
  is_public: tournamentData.is_public,
  requires_approval: tournamentData.requires_approval,
  allow_all_ranks: tournamentData.allow_all_ranks,
  eligible_ranks: tournamentData.eligible_ranks,
  prize_distribution: tournamentData.prize_distribution,
  venue_name: tournamentData.venue_name,
  status: tournamentData.status
};

console.log('🔍 Critical fields inspection:');
Object.keys(criticalFields).forEach(key => {
  const value = criticalFields[key];
  const type = typeof value;
  const isNull = value === null;
  const isEmpty = (type === 'object' && !isNull) ? Object.keys(value).length === 0 : false;
  
  console.log(`- ${key}: ${type} | null: ${isNull} | empty: ${isEmpty} | value: ${JSON.stringify(value).substring(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`);
});

console.log('🏆 Prize distribution validation:');
console.log('- total_positions:', tournamentData.prize_distribution.total_positions);
console.log('- positions array length:', tournamentData.prize_distribution.positions.length);
console.log('- prize_summary keys:', Object.keys(tournamentData.prize_distribution.prize_summary));
console.log('- total_distributed:', tournamentData.prize_distribution.prize_summary.total_distributed);

// Check for any undefined values
const checkUndefined = (obj, path = '') => {
  const undefinedFields = [];
  
  const traverse = (current, currentPath) => {
    if (current === undefined) {
      undefinedFields.push(currentPath);
      return;
    }
    
    if (typeof current === 'object' && current !== null) {
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          traverse(item, `${currentPath}[${index}]`);
        });
      } else {
        Object.keys(current).forEach(key => {
          traverse(current[key], currentPath ? `${currentPath}.${key}` : key);
        });
      }
    }
  };
  
  traverse(obj, path);
  return undefinedFields;
};

const undefinedFields = checkUndefined(tournamentData);
console.log('⚠️  Undefined fields found:', undefinedFields.length > 0 ? undefinedFields : 'None');

console.log('✅ Step 3 - Data validation complete');
console.log('📈 Tournament data size:', JSON.stringify(tournamentData).length, 'characters');

// Final verification
const expectedFields = [
  'name', 'tournament_type', 'max_participants', 'prize_pool', 
  'is_public', 'requires_approval', 'allow_all_ranks', 'prize_distribution', 'status'
];

console.log('🎯 Final verification:');
const missingFields = expectedFields.filter(field => !(field in tournamentData));
console.log('- Missing required fields:', missingFields.length > 0 ? missingFields : 'None');

console.log('🔥 PROBLEM IDENTIFIED:');
console.log('This tournament data object should have ALL required fields populated.');
console.log('If the database INSERT still shows NULL/empty values, the issue is:');
console.log('1. Data transformation during Supabase INSERT');
console.log('2. Column type mismatches');
console.log('3. RLS policies blocking the INSERT');
console.log('4. Default values in database overriding our data');

// Output final tournament data for debugging
console.log('📋 Final tournament data to be INSERTed:');
console.log(JSON.stringify(tournamentData, null, 2));
