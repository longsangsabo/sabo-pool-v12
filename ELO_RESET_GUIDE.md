# 🎯 HƯỚNG DẪN RESET ĐIỂM ELO THEO HẠNG

## 📋 Tổng Quan

Script này sẽ reset tất cả điểm ELO của players về giá trị chuẩn tương ứng với hạng đã verify của họ trong system.

## 🏆 Bảng Mapping Hạng - ELO

### SABO Pool Arena Ranking System
| Hạng | ELO Points | Mô tả |
|------|------------|-------|
| **E+** | 2800 | Expert Plus - Cao thủ |
| **E** | 2600 | Expert - Chuyên gia |
| **F+** | 2400 | Advanced Plus - Nâng cao+ |
| **F** | 2200 | Advanced - Nâng cao |
| **G+** | 2000 | Intermediate Plus - Trung cấp+ |
| **G** | 1800 | Intermediate - Trung cấp |
| **H+** | 1600 | Amateur Plus - Nghiệp dư+ |
| **H** | 1400 | Amateur - Nghiệp dư |
| **I+** | 1200 | Beginner Plus - Mới bắt đầu+ |
| **I** | 1000 | Beginner - Mới bắt đầu |
| **K+** | 800 | Novice Plus - Tập sự+ |
| **K** | 600 | Novice - Tập sự |

### Traditional Dan/Kyu System (Legacy Support)
| Hạng | ELO Points |
|------|------------|
| Dan7 | 2400 |
| Dan6 | 2300 |
| Dan5 | 2200 |
| Dan4 | 2100 |
| Dan3 | 2000 |
| Dan2 | 1900 |
| Dan1 | 1800 |
| Kyu1 | 1700 |
| Kyu2-10 | 1600-800 |

## 🚀 Cách Thực Hiện

### Bước 1: Backup Dữ Liệu
```sql
-- Tự động tạo backup trong migration
-- Hoặc chạy manual:
CREATE TABLE elo_backup_manual AS 
SELECT * FROM player_rankings;
```

### Bước 2: Chạy Migration
1. Vào **Supabase Dashboard** > **SQL Editor**
2. Chạy file: `supabase/migrations/20250810000426_reset_elo_points_by_rank.sql`

### Bước 3: Hoặc Chạy Admin Script
- Chạy file: `admin-elo-reset.sql` (nếu muốn control manual)

### Bước 4: Verification
- Chạy file: `elo-verification-check.sql` để kiểm tra kết quả

## 📊 Kết Quả Mong Đợi

### ✅ Sau khi reset thành công:

1. **Tất cả players** sẽ có ELO tương ứng với `verified_rank`
2. **Players chưa có rank** sẽ được set ELO = 1000 (Beginner)
3. **Players chưa có record** sẽ được tạo mới với ELO phù hợp
4. **Backup data** được tạo tự động
5. **Transaction log** ghi lại toàn bộ changes

### 📈 Statistics mẫu:
```
- Total Players Reset: 1,247
- Average ELO: 1,385
- Highest ELO: 2800 (E+ rank)
- Lowest ELO: 600 (K rank)
- Advanced Players (2000+): 156 (12.5%)
- Intermediate Players (1400-1999): 423 (33.9%)
- Beginner Players (<1400): 668 (53.6%)
```

## 🔧 Tính Năng Đặc Biệt

### 1. Smart Functions
```sql
-- Convert rank to ELO
SELECT get_elo_from_rank('G+'); -- Returns 2000

-- Convert ELO to rank  
SELECT get_rank_from_elo(1850); -- Returns 'G'
```

### 2. Real-time View
```sql
-- Xem tổng quan sau reset
SELECT * FROM elo_reset_summary 
ORDER BY elo_points DESC;
```

### 3. Consistency Check
```sql
-- Kiểm tra tính nhất quán
SELECT 
  verified_rank,
  elo_points,
  rank_elo_consistency
FROM elo_reset_summary 
WHERE rank_elo_consistency = 'MISMATCH';
```

## ⚠️ Lưu Ý Quan Trọng

### 🔒 An Toàn
- ✅ Tự động backup trước khi reset
- ✅ Transaction log đầy đủ
- ✅ Rollback được nếu cần
- ✅ Không ảnh hưởng SPA points

### 🎮 Gameplay Impact
- ✅ Players sẽ có ELO chuẩn theo skill thực tế
- ✅ Matchmaking sẽ fair hơn
- ✅ Tournament seeding chính xác hơn
- ✅ Ranking leaderboard realistic hơn

### 🔄 Sau Reset
- Cần **rebalance tournament** brackets nếu đang diễn ra
- **Leaderboard** sẽ thay đổi ngay lập tức
- **Challenge system** sẽ work với ELO mới
- **UI components** tự động update

## 📋 Checklist Triển Khai

### Trước Reset:
- [ ] Backup database
- [ ] Thông báo users về maintenance
- [ ] Check running tournaments
- [ ] Verify migration syntax

### Sau Reset:
- [ ] Chạy verification check
- [ ] Test ELO calculation functions
- [ ] Check leaderboard display
- [ ] Test challenge system
- [ ] Monitor for issues

## 🛠️ Troubleshooting

### Issue: Players có ELO NULL
```sql
-- Fix: Set default ELO
UPDATE player_rankings 
SET elo_points = 1000 
WHERE elo_points IS NULL;
```

### Issue: Verified rank không match ELO
```sql
-- Check inconsistencies
SELECT * FROM elo_reset_summary 
WHERE rank_elo_consistency = 'MISMATCH';
```

### Issue: Missing player_rankings records
```sql
-- Tạo records thiếu
INSERT INTO player_rankings (player_id, elo_points, spa_points)
SELECT user_id, 1000, 0 FROM profiles 
WHERE user_id NOT IN (SELECT player_id FROM player_rankings);
```

## 🎯 Kết Luận

Sau khi reset ELO thành công:
- ✅ **Fair gameplay** với ELO chuẩn theo rank
- ✅ **Accurate matchmaking** system  
- ✅ **Realistic leaderboards** and rankings
- ✅ **Better tournament** seeding
- ✅ **Consistent data** across all systems

Hệ thống sẽ hoạt động tối ưu với ELO points chuẩn theo skill level thực tế của từng player! 🚀
