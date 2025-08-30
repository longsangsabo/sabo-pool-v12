# 🏆 SABO TOURNAMENT MATCHES TABLE SETUP

## Bước 1: Tạo bảng trong Supabase Dashboard

Vào **Supabase Dashboard** → **SQL Editor** và chạy lệnh SQL sau:

```sql
-- Tạo bảng SABO tournament matches
CREATE TABLE sabo_tournament_matches (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL,
  
  -- SABO-specific bracket organization
  bracket_type VARCHAR(20) NOT NULL,
  branch_type VARCHAR(10),
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  
  -- SABO match positioning (unique identifier)
  sabo_match_id VARCHAR(20) NOT NULL,
  
  -- Players and results
  player1_id UUID,
  player2_id UUID,
  player1_name VARCHAR(100),
  player2_name VARCHAR(100),
  
  -- Match outcome
  winner_id UUID,
  loser_id UUID,
  
  -- Scores
  score_player1 INTEGER DEFAULT 0,
  score_player2 INTEGER DEFAULT 0,
  
  -- Match status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- SABO-specific match flow
  advances_to_match_id VARCHAR(20),
  feeds_loser_to_match_id VARCHAR(20),
  
  -- Timing
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Table assignment
  assigned_table_id UUID,
  table_released_at TIMESTAMPTZ,
  
  -- Metadata
  is_bye_match BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Bước 2: Tạo indexes

```sql
-- Indexes for performance
CREATE INDEX idx_sabo_matches_tournament ON sabo_tournament_matches(tournament_id);
CREATE INDEX idx_sabo_matches_bracket ON sabo_tournament_matches(tournament_id, bracket_type, round_number);
CREATE INDEX idx_sabo_matches_status ON sabo_tournament_matches(status);
CREATE INDEX idx_sabo_matches_players ON sabo_tournament_matches(player1_id, player2_id);
```

## Bước 3: Tạo constraints

```sql
-- Unique constraints
ALTER TABLE sabo_tournament_matches 
ADD CONSTRAINT unique_tournament_sabo_match 
UNIQUE(tournament_id, sabo_match_id);

ALTER TABLE sabo_tournament_matches 
ADD CONSTRAINT unique_tournament_bracket_match 
UNIQUE(tournament_id, bracket_type, round_number, match_number);
```

## Bước 4: Thiết lập RLS (Row Level Security)

```sql
-- Enable RLS
ALTER TABLE sabo_tournament_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view sabo tournament matches" ON sabo_tournament_matches;
DROP POLICY IF EXISTS "Tournament organizers can manage their sabo matches" ON sabo_tournament_matches;
DROP POLICY IF EXISTS "Club owners can manage club sabo matches" ON sabo_tournament_matches;
DROP POLICY IF EXISTS "Admins can manage all sabo matches" ON sabo_tournament_matches;
DROP POLICY IF EXISTS "Service role can manage sabo matches" ON sabo_tournament_matches;

-- Policy for reading (all authenticated users can view public tournament matches)
CREATE POLICY "Users can view sabo tournament matches" ON sabo_tournament_matches
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM tournaments t 
            WHERE t.id = tournament_id 
            AND t.is_public = true
        )
    );

-- Policy for tournament organizers (can manage their own tournament matches)
CREATE POLICY "Tournament organizers can manage their sabo matches" ON sabo_tournament_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tournaments t 
            WHERE t.id = tournament_id 
            AND t.organizer_id = auth.uid()
        )
    );

-- Policy for club owners (can manage matches in their club's tournaments)
CREATE POLICY "Club owners can manage club sabo matches" ON sabo_tournament_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tournaments t 
            JOIN club_profiles cp ON t.club_id = cp.id
            WHERE t.id = tournament_id 
            AND cp.user_id = auth.uid()
        )
    );

-- Policy for admins (full access)
CREATE POLICY "Admins can manage all sabo matches" ON sabo_tournament_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Policy for service role (system operations)
CREATE POLICY "Service role can manage sabo matches" ON sabo_tournament_matches
    FOR ALL USING (auth.role() = 'service_role');
```

## Bước 5: Trigger cho updated_at

```sql
-- Update trigger
CREATE OR REPLACE FUNCTION update_sabo_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sabo_matches_updated_at
    BEFORE UPDATE ON sabo_tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_sabo_matches_updated_at();
```

## 🎯 Cấu trúc SABO Match IDs

| Bracket Type | Branch | Round | Match | SABO ID |
|--------------|---------|--------|-------|---------|
| Winner | - | 1 | 1-8 | WR1M1, WR1M2, ..., WR1M8 |
| Winner | - | 2 | 1-4 | WR2M1, WR2M2, WR2M3, WR2M4 |
| Winner | - | 3 | 1-2 | WR3M1, WR3M2 |
| Loser | A | 101 | 1-4 | LAR101M1, LAR101M2, LAR101M3, LAR101M4 |
| Loser | A | 102 | 1-2 | LAR102M1, LAR102M2 |
| Loser | A | 103 | 1 | LAR103M1 |
| Loser | B | 201 | 1-2 | LBR201M1, LBR201M2 |
| Loser | B | 202 | 1 | LBR202M1 |
| Finals | - | 301 | 1-2 | FR301M1, FR301M2 |
| Finals | - | 401 | 1 | FR401M1 |

## ✅ Kiểm tra sau khi tạo

Chạy lệnh này để kiểm tra bảng đã được tạo:

```sql
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'sabo_tournament_matches';
```

Nếu kết quả trả về `1`, bảng đã được tạo thành công!

## 🚀 Sau khi tạo bảng

1. Chạy lại bracket generation trong browser
2. Kiểm tra console logs để xem SABO match handler hoạt động
3. Verify 27 matches được lưu với đúng structure: 14 winner + 10 loser + 3 finals

## 📊 Advantages của SABO table riêng:

✅ **Bracket-specific fields**: `bracket_type`, `branch_type`, `sabo_match_id`  
✅ **Clear match flow**: `advances_to_match_id`, `feeds_loser_to_match_id`  
✅ **SABO validation**: Built-in structure validation  
✅ **Performance**: Optimized indexes cho SABO queries  
✅ **Maintainability**: Tách biệt với tournament_matches chung
