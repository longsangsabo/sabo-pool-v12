-- Giải thích cách sử dụng prize_distribution JSONB thay vì bảng tournament_prizes

-- 🎯 CÁCH HOẠT ĐỘNG MỚI: prize_distribution JSONB trong bảng tournaments
-- =====================================================================

-- 1. CẤU TRÚC JSONB prize_distribution:
/*
{
  "total_positions": 16,
  "total_prize_amount": 2000000,
  "positions": [
    {
      "position": 1,
      "position_name": "Vô địch",
      "cash_amount": 800000,
      "elo_points": 100,
      "spa_points": 50,
      "physical_items": ["Cup vàng", "Giấy chứng nhận"],
      "is_visible": true,
      "color_theme": "#FFD700"
    },
    {
      "position": 2,
      "position_name": "Á quân", 
      "cash_amount": 500000,
      "elo_points": 80,
      "spa_points": 30,
      "physical_items": ["Cup bạc"],
      "is_visible": true,
      "color_theme": "#C0C0C0"
    }
    // ... 14 positions khác
  ],
  "prize_summary": {
    "position_1": 800000,
    "position_2": 500000,
    "position_3": 300000,
    // ... các vị trí khác
  },
  "metadata": {
    "created_at": "2025-08-15T04:11:07.694942Z",
    "template_type": "standard",
    "auto_generated": true
  }
}
*/

-- 2. CÁCH CẬP NHẬT prize_distribution:
-- ===================================

-- Tạo mới tournament với prize_distribution:
INSERT INTO tournaments (
  name,
  prize_pool,
  prize_distribution
) VALUES (
  'Test Tournament',
  2000000,
  '{
    "total_positions": 16,
    "total_prize_amount": 2000000,
    "positions": [
      {
        "position": 1,
        "position_name": "Vô địch",
        "cash_amount": 800000,
        "elo_points": 100,
        "spa_points": 50,
        "is_visible": true
      }
    ]
  }'::jsonb
);

-- Cập nhật prize_distribution cho tournament có sẵn:
UPDATE tournaments 
SET prize_distribution = '{
  "total_positions": 16,
  "positions": [
    {
      "position": 1,
      "position_name": "Vô địch", 
      "cash_amount": 1000000,
      "elo_points": 100
    }
  ]
}'::jsonb
WHERE id = 'tournament-id-here';

-- 3. QUERY DỮ LIỆU TỪ prize_distribution:
-- ======================================

-- Lấy tất cả thông tin prize:
SELECT 
  id,
  name,
  prize_pool,
  prize_distribution
FROM tournaments 
WHERE id = 'tournament-id';

-- Lấy thông tin vị trí cụ thể:
SELECT 
  id,
  name,
  prize_distribution -> 'positions' -> 0 ->> 'position_name' as champion_name,
  (prize_distribution -> 'positions' -> 0 ->> 'cash_amount')::int as champion_prize
FROM tournaments 
WHERE id = 'tournament-id';

-- Lấy tổng số vị trí có giải:
SELECT 
  id,
  name,
  (prize_distribution ->> 'total_positions')::int as total_positions
FROM tournaments 
WHERE prize_distribution IS NOT NULL;

-- Tìm tournaments có giải thưởng > 500k cho vô địch:
SELECT id, name
FROM tournaments 
WHERE (prize_distribution -> 'positions' -> 0 ->> 'cash_amount')::int > 500000;

-- 4. SO SÁNH VỚI CÁCH CŨ (tournament_prizes table):
-- =================================================

-- CÁCH CŨ - Dùng bảng riêng:
/*
tournament_prizes table:
- tournament_id
- position
- position_name  
- cash_amount
- elo_points
- spa_points
- physical_items (array)
- is_visible

➜ Cần JOIN để lấy dữ liệu
➜ Nhiều rows cho 1 tournament
➜ Phức tạp khi update
*/

-- CÁCH MỚI - Dùng JSONB:
/*
tournaments table:
- prize_distribution (jsonb) - chứa tất cả thông tin prize

➜ Tất cả data trong 1 row
➜ Query đơn giản hơn
➜ Update dễ dàng
➜ Flexible structure
*/

-- 5. MIGRATION TỪ tournament_prizes SANG prize_distribution:
-- =========================================================

-- Tạo function để migrate data:
CREATE OR REPLACE FUNCTION migrate_prizes_to_jsonb()
RETURNS void AS $$
DECLARE
  tournament_record RECORD;
  prize_data JSONB := '{}';
  positions_array JSONB := '[]';
  prize_record RECORD;
BEGIN
  -- Lặp qua tất cả tournaments
  FOR tournament_record IN 
    SELECT DISTINCT tournament_id FROM tournament_prizes
  LOOP
    -- Reset arrays
    positions_array := '[]';
    
    -- Lấy tất cả prizes cho tournament này
    FOR prize_record IN 
      SELECT * FROM tournament_prizes 
      WHERE tournament_id = tournament_record.tournament_id 
      ORDER BY prize_position
    LOOP
      -- Thêm position vào array
      positions_array := positions_array || jsonb_build_object(
        'position', prize_record.prize_position,
        'position_name', prize_record.position_name,
        'cash_amount', prize_record.cash_amount,
        'elo_points', prize_record.elo_points,
        'spa_points', prize_record.spa_points,
        'physical_items', prize_record.physical_items,
        'is_visible', prize_record.is_visible
      );
    END LOOP;
    
    -- Tạo complete prize_distribution object
    prize_data := jsonb_build_object(
      'total_positions', jsonb_array_length(positions_array),
      'positions', positions_array,
      'metadata', jsonb_build_object(
        'migrated_at', NOW(),
        'source', 'tournament_prizes_table'
      )
    );
    
    -- Update vào tournaments table
    UPDATE tournaments 
    SET prize_distribution = prize_data
    WHERE id = tournament_record.tournament_id;
    
    RAISE NOTICE 'Migrated prizes for tournament: %', tournament_record.tournament_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Chạy migration:
-- SELECT migrate_prizes_to_jsonb();

-- 6. CÁCH SỬ DỤNG TRONG CODE:
-- ==========================

-- JavaScript/TypeScript example:
/*
// Tạo prize distribution
const prizeDistribution = {
  total_positions: 16,
  total_prize_amount: 2000000,
  positions: [
    {
      position: 1,
      position_name: "Vô địch",
      cash_amount: 800000,
      elo_points: 100,
      spa_points: 50,
      is_visible: true
    }
    // ... more positions
  ]
};

// Insert tournament với prizes
const { data, error } = await supabase
  .from('tournaments')
  .insert({
    name: 'Tournament Name',
    prize_pool: 2000000,
    prize_distribution: prizeDistribution
  });

// Update prizes
const { error: updateError } = await supabase
  .from('tournaments')
  .update({
    prize_distribution: updatedPrizeDistribution
  })
  .eq('id', tournamentId);

// Query prizes
const { data: tournament } = await supabase
  .from('tournaments')
  .select('id, name, prize_distribution')
  .eq('id', tournamentId)
  .single();

// Access prize data
const positions = tournament.prize_distribution.positions;
const championPrize = positions[0].cash_amount;
*/
