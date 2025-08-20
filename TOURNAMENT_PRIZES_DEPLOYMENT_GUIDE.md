# TOURNAMENT PRIZES SYSTEM DEPLOYMENT GUIDE

## Overview
Hệ thống giải thưởng tournament đã được tích hợp hoàn chỉnh với bảng `tournament_prizes` để lưu trữ chi tiết giải thưởng cho 16 vị trí trong giải đấu SABO Double Elimination.

## Các thành phần đã được cập nhật

### 1. Database Schema
- ✅ Bảng `tournament_prizes` đã được tạo với đầy đủ các trường cần thiết
- ✅ Các constraints và indexes đã được thiết lập
- ✅ Foreign key relationships đã được tạo

### 2. SQL Functions
- ✅ `calculate_tournament_rewards()` đã được cập nhật để query từ `tournament_prizes`
- ✅ Fallback logic cho trường hợp không có prize data
- ✅ Trigger functions cho tournament results đã tích hợp với prize system

### 3. Frontend Integration
- ✅ `TournamentContext.tsx`: Added `saveTournamentPrizes` function với REST API calls
- ✅ `useTournamentResults.ts`: Enhanced để fetch prize details từ tournament_prizes table
- ✅ Prize data được tự động lưu khi tournament được tạo
- ✅ Error handling cho non-critical prize operations

### 4. API Integration
- ✅ REST API calls đến `/rest/v1/tournament_prizes` endpoint
- ✅ Batch insert cho 16 prize positions
- ✅ Proper authentication headers

## Deployment Steps

### Step 1: Deploy SQL Script
```bash
# Apply the tournament-results-auto-trigger.sql script to database
psql -f tournament-results-auto-trigger.sql
```

### Step 2: Verify Database Schema
```sql
-- Check if tournament_prizes table exists
SELECT * FROM information_schema.tables WHERE table_name = 'tournament_prizes';

-- Check constraints
SELECT * FROM information_schema.table_constraints WHERE table_name = 'tournament_prizes';

-- Verify function exists
SELECT * FROM information_schema.routines WHERE routine_name = 'calculate_tournament_rewards';
```

### Step 3: Test Tournament Creation
1. Create a new tournament through the frontend
2. Verify that 16 prize records are created in `tournament_prizes` table
3. Check tournament results tab displays prize information correctly

### Step 4: Test Prize Display in Results
1. Create a test tournament with matches
2. Complete matches to generate tournament results
3. Verify that results display shows correct prize information from `tournament_prizes`

## Key Features

### Tournament Creation Flow
1. User creates tournament với prize information
2. `generatePrizeTemplate()` tạo 16 positions với detailed prize breakdown
3. Tournament được insert vào `tournaments` table
4. `saveTournamentPrizes()` được gọi để save prize details vào `tournament_prizes`
5. Non-critical error handling nếu prize save fails

### Tournament Results Display
1. `useTournamentResults` hook fetch tournament results
2. Hook also queries `tournament_prizes` để get detailed prize information
3. Results hiển thị với full prize breakdown cho mỗi position
4. Fallback to default values nếu không có prize data

### SQL Function Integration
1. `calculate_tournament_rewards()` queries `tournament_prizes` first
2. Nếu có data thì dùng từ tournament_prizes
3. Nếu không có thì dùng default SPA/ELO values
4. Cash amount mặc định = 0 nếu không có trong tournament_prizes

## Data Structure

### Tournament Prizes Record
```typescript
{
  tournament_id: uuid,
  prize_position: integer (1-16),
  position_name: string ('Vô địch', 'Á quân', 'Hạng 3', etc.),
  cash_amount: numeric (VND),
  elo_points: integer,
  spa_points: integer,
  physical_items: string[],
  color_theme: string ('gold', 'silver'),
  is_visible: boolean,
  is_guaranteed: boolean
}
```

### Prize Distribution Pattern
- Vị trí 1: 40% prize pool, 1500 SPA, 100 ELO
- Vị trí 2: 24% prize pool, 1100 SPA, 50 ELO  
- Vị trí 3: 16% prize pool, 900 SPA, 25 ELO
- Vị trí 4-16: 1% prize pool each, 320 SPA, 5 ELO

## Testing Checklist

- [ ] Tournament creation saves 16 prize records
- [ ] Prize records có correct values cho cash_amount, spa_points, elo_points
- [ ] Tournament results tab hiển thị prize information
- [ ] SQL function returns correct rewards from tournament_prizes
- [ ] Fallback works khi không có prize data
- [ ] Error handling works for prize save failures

## Rollback Plan

Nếu có issues, có thể:
1. Revert `tournament-results-auto-trigger.sql` để dùng old logic
2. Remove `saveTournamentPrizes` calls từ tournament creation
3. Use fallback prize calculation trong `useTournamentResults`

## Notes

- Prize system là non-critical, tournament creation vẫn thành công nếu prize save fails
- REST API được dùng thay vì typed supabase client do limitations
- All prize data được validate trước khi save
- System supports 16 positions cho SABO Double Elimination format
