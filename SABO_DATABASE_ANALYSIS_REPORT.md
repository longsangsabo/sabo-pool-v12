# 📋 **SABO DOUBLE ELIMINATION SYSTEM - DATABASE ANALYSIS REPORT**

## 🎯 **EXECUTIVE SUMMARY**
Hệ thống SABO Double Elimination sử dụng **3 bảng chính** để lưu trữ và quản lý data tournament. Sau khi phân tích, đã phát hiện **một số vấn đề trùng lặp và conflicts** cần được giải quyết.

---

## 📊 **1. CÁC BẢNG CORE ĐƯỢC SỬ DỤNG**

### 🏆 **TOURNAMENTS Table (Bảng chính)**
```sql
Columns sử dụng bởi SABO:
- id (UUID) - Primary key
- name (TEXT) - Tên tournament
- tournament_type (TEXT) - 'double_elimination' 
- format (TEXT) - 'double_elimination'
- status (TEXT) - 'registration_open' | 'ongoing' | 'completed'
- max_participants (INTEGER) - Luôn = 16 cho SABO
- winner_id (UUID) - Người thắng cuối cùng
- completed_at (TIMESTAMP) - Thời điểm hoàn thành
- bracket_generated (BOOLEAN) - Đã tạo bracket chưa
```

### ⚔️ **TOURNAMENT_MATCHES Table (Bảng matches)**
```sql  
Columns core cho SABO:
- id (UUID) - Primary key
- tournament_id (UUID) - FK to tournaments
- round_number (INTEGER) - SABO rounds: 1,2,3,101,102,103,201,202,250,300
- match_number (INTEGER) - Số thứ tự trong round
- bracket_type (TEXT) - 'winners'|'losers'|'semifinals'|'finals'
- branch_type (TEXT) - 'A'|'B' cho losers bracket
- player1_id (UUID) - FK to auth.users
- player2_id (UUID) - FK to auth.users  
- score_player1 (INTEGER) - Điểm player 1
- score_player2 (INTEGER) - Điểm player 2
- winner_id (UUID) - FK to auth.users
- status (TEXT) - 'pending'|'ready'|'completed'
```

### 🏅 **TOURNAMENT_RESULTS Table (Bảng kết quả)**
```sql
Columns cho SABO results:
- id (UUID) - Primary key
- tournament_id (UUID) - FK to tournaments
- user_id (UUID) - FK to auth.users
- final_position (INTEGER) - Vị trí cuối cùng (1-16)
- total_matches (INTEGER) - Tổng số trận đã chơi
- wins (INTEGER) - Số trận thắng
- losses (INTEGER) - Số trận thua
- spa_points_awarded (INTEGER) - SPA points nhận được
- elo_points_awarded (INTEGER) - ELO points thay đổi
```

---

## 🔄 **2. SABO FUNCTIONS DATA FLOW**

### 🏗️ **generate_sabo_tournament_bracket()**
```sql
WRITES TO: tournament_matches
Operations:
1. DELETE FROM tournament_matches WHERE tournament_id = p_tournament_id
2. INSERT 27 matches với structure:
   - Winners: Round 1(8 matches), 2(4 matches), 3(2 matches)  
   - Losers A: Round 101(4 matches), 102(2 matches), 103(1 match)
   - Losers B: Round 201(2 matches), 202(1 match)
   - Semifinals: Round 250(2 matches)
   - Finals: Round 300(1 match)
3. UPDATE tournaments SET status='ongoing'
```

### ▶️ **advance_sabo_tournament()**
```sql
WRITES TO: tournament_matches  
Operations:
1. Finds next matches cho winner/loser
2. UPDATE tournament_matches SET player1_id/player2_id (advancement)
3. UPDATE tournaments SET status='completed' (nếu final)
```

### ⚽ **submit_sabo_match_score()**
```sql
WRITES TO: 
- tournament_matches (scores & completion)
- match_results (logging)
Operations:
1. UPDATE tournament_matches SET score_player1, score_player2, winner_id, status='completed'
2. CALL advance_sabo_tournament() for progression
3. INSERT INTO match_results for both players
```

---

## ⚠️ **3. PHÁT HIỆN CONFLICTS & DUPLICATES**

### 🚨 **Migration Files Conflicts**
```bash
FOUND: 57+ migration files tạo tournament tables
RISK: Multiple schema versions causing confusion
FILES:
- 20250720095132-49da172b-00ac-4c9b-8781-63af99ade717.sql (Latest?)
- 20250730014052-912dfb55-74c7-4845-9b4e-e9474c108caa.sql (SABO functions)
- Multiple older versions creating same tables
```

### 🔍 **Schema Inconsistencies Detected**
```sql
ISSUES FOUND:
1. tournament_matches có thể có columns khác nhau tùy migration
2. tournaments table có thể missing SABO-specific columns
3. RLS policies có thể bị overwrite bởi multiple migrations
4. Indexes có thể bị duplicate hoặc missing
```

### 📈 **Function Version Conflicts**
```sql
CLEANED UP: (đã fix trong migration 20250811120000)
- Removed: generate_double_elimination_bracket_v2 through v7
- Removed: advance_double_elimination_v2 through v7  
- Kept: generate_sabo_tournament_bracket, advance_sabo_tournament (clean)
```

---

## 🔧 **4. RECOMMENDED ACTIONS**

### ✅ **IMMEDIATE FIXES NEEDED**
1. **Schema Validation**: Chạy query kiểm tra columns của 3 tables core
2. **Data Integrity Check**: Kiểm tra orphaned matches, duplicate rounds
3. **Function Verification**: Confirm SABO functions đang sử dụng correct tables
4. **RLS Policy Audit**: Verify security policies không bị conflict

### 🎯 **OPTIMIZATION OPPORTUNITIES**  
1. **Performance Indexes**: tournament_matches cần indexes on (tournament_id, round_number, bracket_type)
2. **Data Cleanup**: Remove old tournament data không phải SABO format
3. **Migration Consolidation**: Tạo clean migration script cho production
4. **Monitoring Setup**: Real-time tracking cho SABO operations

---

## 📋 **5. VERIFICATION QUERIES**

Đã tạo 3 files để test:
- `sabo-database-check-part1.sql` - Schema analysis
- `sabo-database-check-part2.sql` - Data conflicts detection  
- `sabo-database-check-part3.sql` - Function operations audit

### 🔍 **Run These Queries in Supabase Dashboard:**
```sql
-- Quick conflict check
SELECT COUNT(*) as total_tournaments,
       COUNT(CASE WHEN tournament_type='double_elimination' THEN 1 END) as sabo_tournaments
FROM tournaments;

SELECT COUNT(*) as total_matches,
       COUNT(DISTINCT tournament_id) as tournaments_with_matches,  
       COUNT(CASE WHEN round_number IN (1,2,3,101,102,103,201,202,250,300) THEN 1 END) as valid_sabo_matches
FROM tournament_matches;
```

---

## 🎯 **CONCLUSION**

SABO system **architecture is solid** but có **migration conflicts** cần cleanup. Core functionality hoạt động đúng với 27-match structure, nhưng cần verify schema consistency across environments.

**NEXT STEPS:** Chạy verification queries để confirm exact state của production database.
