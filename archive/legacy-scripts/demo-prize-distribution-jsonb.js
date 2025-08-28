// Demo cách sử dụng prize_distribution JSONB thay vì bảng tournament_prizes

console.log('🏆 DEMO: prize_distribution JSONB vs tournament_prizes table');
console.log('='.repeat(70));

// 1. CẤU TRÚC DỮ LIỆU MỚI - JSONB trong tournaments table
console.log('\n1️⃣ CẤU TRÚC prize_distribution JSONB:');
const prizeDistributionStructure = {
  total_positions: 16,
  total_prize_amount: 2000000,
  positions: [
    {
      position: 1,
      position_name: "Vô địch",
      cash_amount: 800000,
      elo_points: 100,
      spa_points: 50,
      physical_items: ["Cup vàng", "Giấy chứng nhận"],
      is_visible: true,
      color_theme: "#FFD700"
    },
    {
      position: 2,
      position_name: "Á quân",
      cash_amount: 500000,
      elo_points: 80,
      spa_points: 30,
      physical_items: ["Cup bạc"],
      is_visible: true,
      color_theme: "#C0C0C0"
    },
    {
      position: 3,
      position_name: "Hạng 3",
      cash_amount: 300000,
      elo_points: 60,
      spa_points: 20,
      physical_items: ["Cup đồng"],
      is_visible: true,
      color_theme: "#CD7F32"
    }
    // ... 13 positions khác
  ],
  prize_summary: {
    position_1: 800000,
    position_2: 500000,
    position_3: 300000,
    position_4: 200000,
    // ... positions khác
  },
  metadata: {
    created_at: "2025-08-15T04:11:07.694942Z",
    template_type: "standard",
    auto_generated: true
  }
};

console.log(JSON.stringify(prizeDistributionStructure, null, 2));

// 2. SO SÁNH 2 CÁCH TIẾP CẬN
console.log('\n2️⃣ SO SÁNH 2 CÁCH:');

console.log('\n📋 CÁCH CŨ - Bảng tournament_prizes riêng biệt:');
console.log('   ✅ Ưu điểm:');
console.log('      - Cấu trúc rõ ràng, dễ query riêng lẻ');
console.log('      - Dễ thêm/sửa/xóa từng prize position');
console.log('      - Có thể index riêng cho performance');
console.log('   ❌ Nhược điểm:');
console.log('      - Cần JOIN để lấy full data');
console.log('      - Nhiều rows cho 1 tournament');
console.log('      - Phức tạp khi update batch');
console.log('      - Timing issues khi tạo tournament + prizes');

console.log('\n🎯 CÁCH MỚI - JSONB prize_distribution trong tournaments:');
console.log('   ✅ Ưu điểm:');
console.log('      - Tất cả data trong 1 row, không cần JOIN');
console.log('      - Atomic operations (tạo tournament + prizes cùng lúc)');
console.log('      - Flexible structure, dễ mở rộng');
console.log('      - Query đơn giản hơn');
console.log('      - PostgreSQL JSONB performance tốt');
console.log('   ❌ Nhược điểm:');
console.log('      - Khó query riêng từng position');
console.log('      - JSON structure phức tạp hơn');

// 3. CÁCH MIGRATE DỮ LIỆU
console.log('\n3️⃣ MIGRATION PROCESS:');

console.log('\n📤 Bước 1: Export data từ tournament_prizes');
const oldPrizesExample = [
  {
    tournament_id: 'tournament-123',
    prize_position: 1,
    position_name: 'Vô địch',
    cash_amount: 800000,
    elo_points: 100,
    spa_points: 50,
    physical_items: ['Cup vàng'],
    is_visible: true
  },
  {
    tournament_id: 'tournament-123', 
    prize_position: 2,
    position_name: 'Á quân',
    cash_amount: 500000,
    elo_points: 80,
    spa_points: 30,
    physical_items: ['Cup bạc'],
    is_visible: true
  }
];

console.log('   Old structure:', JSON.stringify(oldPrizesExample, null, 2));

console.log('\n🔄 Bước 2: Transform thành JSONB');
function transformToJsonb(tournamentPrizes) {
  const positions = tournamentPrizes.map(prize => ({
    position: prize.prize_position,
    position_name: prize.position_name,
    cash_amount: prize.cash_amount,
    elo_points: prize.elo_points,
    spa_points: prize.spa_points,
    physical_items: prize.physical_items,
    is_visible: prize.is_visible
  }));

  const totalAmount = positions.reduce((sum, pos) => sum + pos.cash_amount, 0);

  return {
    total_positions: positions.length,
    total_prize_amount: totalAmount,
    positions: positions,
    prize_summary: positions.reduce((summary, pos) => {
      summary[`position_${pos.position}`] = pos.cash_amount;
      return summary;
    }, {}),
    metadata: {
      migrated_at: new Date().toISOString(),
      source: 'tournament_prizes_table'
    }
  };
}

const transformedData = transformToJsonb(oldPrizesExample);
console.log('   New JSONB structure:', JSON.stringify(transformedData, null, 2));

// 4. CÁC QUERY PATTERNS THƯỜNG DÙNG
console.log('\n4️⃣ QUERY PATTERNS:');

console.log('\n🔍 Lấy thông tin giải thưởng cho tournament:');
console.log(`
SELECT 
  id,
  name,
  prize_pool,
  prize_distribution
FROM tournaments 
WHERE id = 'tournament-id';
`);

console.log('\n🏆 Lấy thông tin vô địch:');
console.log(`
SELECT 
  id,
  name,
  prize_distribution -> 'positions' -> 0 ->> 'position_name' as champion_name,
  (prize_distribution -> 'positions' -> 0 ->> 'cash_amount')::int as champion_prize,
  (prize_distribution -> 'positions' -> 0 ->> 'elo_points')::int as champion_elo
FROM tournaments 
WHERE id = 'tournament-id';
`);

console.log('\n💰 Tìm tournaments có giải thưởng cao:');
console.log(`
SELECT id, name, prize_pool
FROM tournaments 
WHERE (prize_distribution -> 'positions' -> 0 ->> 'cash_amount')::int > 500000
AND prize_distribution IS NOT NULL;
`);

console.log('\n📊 Thống kê số lượng vị trí có giải:');
console.log(`
SELECT 
  id,
  name,
  (prize_distribution ->> 'total_positions')::int as positions_count,
  (prize_distribution ->> 'total_prize_amount')::int as total_amount
FROM tournaments 
WHERE prize_distribution IS NOT NULL;
`);

// 5. IMPLEMENTATION VỚI SUPABASE
console.log('\n5️⃣ SUPABASE IMPLEMENTATION:');

console.log('\n💾 Insert tournament với prizes:');
console.log(`
const { data, error } = await supabase
  .from('tournaments')
  .insert({
    name: 'SABO Open 2024',
    prize_pool: 2000000,
    prize_distribution: {
      total_positions: 16,
      positions: [
        {
          position: 1,
          position_name: "Vô địch",
          cash_amount: 800000,
          elo_points: 100,
          spa_points: 50
        }
        // ... more positions
      ]
    }
  });
`);

console.log('\n📝 Update prizes:');
console.log(`
const { error } = await supabase
  .from('tournaments')
  .update({
    prize_distribution: updatedPrizeData
  })
  .eq('id', tournamentId);
`);

console.log('\n🎯 Query và sử dụng:');
console.log(`
const { data: tournament } = await supabase
  .from('tournaments')
  .select('id, name, prize_distribution')
  .eq('id', tournamentId)
  .single();

// Sử dụng data
const positions = tournament.prize_distribution.positions;
const championPrize = positions[0].cash_amount;
const totalPositions = tournament.prize_distribution.total_positions;
`);

console.log('\n6️⃣ KẾT LUẬN:');
console.log('   🎯 prize_distribution JSONB phù hợp hơn cho use case này');
console.log('   ⚡ Atomic operations, không có timing issues');
console.log('   📦 Tất cả prize data trong 1 place');
console.log('   🔧 Dễ maintenance và development');
console.log('   💡 Có thể giữ tournament_prizes table để backup/audit');

console.log('\n' + '='.repeat(70));
console.log('✅ DEMO HOÀN TẤT');
