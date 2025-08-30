# Manual Test Guide: Tournament Prize Persistence

## Setup:
1. Server đang chạy: ✅ http://localhost:8081
2. Database tournament_prizes table đã có: ✅ 

## Test Steps:

### 1. Kiểm tra Console Logs
- Mở Developer Tools (F12)
- Đi đến Console tab
- Clear console để dễ theo dõi

### 2. Tạo Tournament Mới
- Navigate to tournament creation page
- Fill basic info:
  - Tournament Name: "Test Prize Persistence"
  - Venue: "Test Location"  
  - Start/End dates
  - Registration dates
  - Max participants: 16
  - Tournament type: Double elimination
  - Entry fee: 100000
  - Prize pool: 1000000

### 3. Kiểm tra Prize Tab
- Switch to Financial/Prize tab
- Verify có hiển thị 16 positions
- Console sẽ show: "🏆 [EnhancedTournamentForm] Prizes updated: Array(16)"

### 4. Submit Tournament
- Click "Tạo giải đấu" 
- Console logs expected:
```
🏆 Tournament prizes in state: 16 prizes
🏆 Saving tournament prizes to database: Array(16)
🔄 Converted prize inputs: 16 items  
✅ Tournament prizes saved successfully
```
- Success toast: "🏆 Giải thưởng đã được lưu vào cơ sở dữ liệu!"

### 5. Verify Database
- Trên Supabase Dashboard, run query:
```sql
SELECT COUNT(*) FROM tournament_prizes 
WHERE tournament_id = [new_tournament_id];
```
- Expected: 16 rows

## Expected Results:
- ✅ No TypeScript compile errors
- ✅ Console shows prize data flow 
- ✅ Tournament creation success
- ✅ 16 prize records in database
- ✅ Success toast message

## Troubleshooting:
- If 0 prizes in state → check TournamentPrizesManager onPrizesChange
- If conversion error → check TournamentPrize to CreateTournamentPrizeInput mapping
- If database error → check supabase connection and table structure
