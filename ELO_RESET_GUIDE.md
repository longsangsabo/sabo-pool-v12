# 🎯 HƯỚNG DẪN RESET ĐIỂM ELO THEO HẠNG

## 📋 Tổng Quan

Script này sẽ reset tất cả điểm ELO của players về giá trị chuẩn tương ứng với hạng đã verify của họ trong system.

## 🏆 Bảng Mapping Hạng - ELO

### SABO Pool Arena Ranking System
| Hạng | ELO Points | Skill Level & Mô tả |
|------|------------|---------------------|
| **E+** | 2100 | **Expert Plus** - 90-100% clear 1 chấm, 70% phá 2 chấm • Điều bi phức tạp, safety chủ động • Sát ngưỡng lên D (chưa mở) |
| **E** | 2000 | **Expert** - 90-100% clear 1 chấm, 70% phá 2 chấm • Điều bi phức tạp, safety chủ động |
| **F+** | 1900 | **Advanced Plus** - 60-80% clear 1 chấm, đôi khi phá 2 chấm • Safety & spin control khá chắc • Sát ngưỡng lên E |
| **F** | 1800 | **Advanced** - 60-80% clear 1 chấm, đôi khi phá 2 chấm • Safety & spin control khá chắc |
| **G+** | 1700 | **Intermediate Plus** - Clear 1 chấm + 3-7 bi kế; bắt đầu điều bi 3 băng • Trình phong trào "ngon" • Sát ngưỡng lên F |
| **G** | 1600 | **Intermediate** - Clear 1 chấm + 3-7 bi kế; bắt đầu điều bi 3 băng • Trình phong trào "ngon" |
| **H+** | 1500 | **Amateur Plus** - Đi 5-8 bi; có thể "rùa" 1 chấm hình dễ • Chuẩn bị lên G |
| **H** | 1400 | **Amateur** - Đi 5-8 bi; có thể "rùa" 1 chấm hình dễ |
| **I+** | 1300 | **Beginner Plus** - 3-5 bi; chưa điều được chấm • Sát ngưỡng lên H |
| **I** | 1200 | **Beginner** - 3-5 bi; chưa điều được chấm ✅ |
| **K+** | 1100 | **Novice Plus** - 2-4 bi khi hình dễ; mới tập • Sát ngưỡng lên I ✅ |
| **K** | 1000 | **Novice** - 2-4 bi khi hình dễ; mới tập ✅ |

**Chú ý**: SABO Pool chỉ sử dụng hệ thống ranking K→E+ (12 hạng), không có Dan/Kyu system.

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

1. **Tất cả players** sẽ có ELO tương ứng với `verified_rank` theo skill level thực tế
2. **Players chưa có rank** sẽ được set ELO = 1000 (K rank - Novice: 2-4 bi khi hình dễ)
3. **Players chưa có record** sẽ được tạo mới với ELO phù hợp theo hạng
4. **Backup data** được tạo tự động cho rollback
5. **Transaction log** ghi lại toàn bộ changes

### 📈 Statistics mẫu:
```
- Total Players Reset: 1,247
- Average ELO: 1,450
- Highest ELO: 2100 (E+ rank)
- Lowest ELO: 1000 (K rank)
- Expert Players (2000+): 89 (7.1%)
- Advanced Players (1800-1999): 156 (12.5%)
- Intermediate Players (1400-1799): 423 (33.9%)
- Beginner/Novice Players (<1400): 579 (46.4%)
```

## 🔧 Tính Năng Đặc Biệt

### 1. Smart Functions
```sql
-- Convert rank to ELO
SELECT get_elo_from_rank('G+'); -- Returns 1700

-- Convert ELO to rank  
SELECT get_rank_from_elo(1850); -- Returns 'F'
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
- ✅ Players sẽ có ELO chuẩn theo skill level thực tế (clear chấm, điều bi, safety)
- ✅ Matchmaking sẽ fair hơn với đối thủ cùng trình độ
- ✅ Tournament seeding chính xác theo khả năng thực tế
- ✅ Ranking leaderboard phản ánh đúng skill progression K→E+

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

Sau khi reset ELO thành công với skill-based mapping:
- ✅ **Fair gameplay** với ELO phản ánh đúng khả năng clear chấm, điều bi của player
- ✅ **Accurate matchmaking** dựa trên skill level thực tế (K: 2-4 bi → E+: 90-100% clear chấm)
- ✅ **Realistic rankings** theo progression tự nhiên từ Novice đến Expert
- ✅ **Better tournaments** với seeding chuẩn theo trình độ billiard thực tế
- ✅ **Consistent system** đồng bộ ELO-rank-skill across toàn platform

Hệ thống sẽ hoạt động tối ưu với ELO points phản ánh chính xác skill level billiard của từng player! 🎱🚀
