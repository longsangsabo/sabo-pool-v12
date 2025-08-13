# HƯỚNG DẪN FIX HIỂN THỊ RANK REQUEST

## Vấn đề hiện tại:
- Trong database: `requested_rank` đang lưu số ELO (1000, 1100, 1200...)
- Trong UI: Hiển thị số thay vì chữ (K, I, H, G, F, E)

## Giải pháp:
1. **Thêm cột `elo_points`** để lưu số ELO riêng biệt
2. **Update `requested_rank`** thành text format (K, I, H, G...)
3. **Update component** để hiển thị rank text thay vì số

## Các bước thực hiện:

### 1. Chạy Database Migration
```sql
-- Chạy file: add-elo-points-column.sql trên Supabase Dashboard
```

### 2. Test Migration
```sql
-- Chạy file: test-elo-points-column.sql để kiểm tra
```

### 3. Update Component (nếu cần)
Tìm component hiển thị rank request và đảm bảo nó hiển thị:
- `requested_rank` (text): "H", "G", "F" thay vì số
- `elo_points` (number): 1400, 1600, 1800 nếu cần hiển thị ELO

### 4. Kết quả mong đợi:
- Rank request hiển thị: "H hạng" thay vì "1400"
- ELO có thể hiển thị riêng: "H hạng (1400 ELO)"

## Files đã tạo:
- `add-elo-points-column.sql` - Script migration chính
- `test-elo-points-column.sql` - Script test sau migration
- `ELO_RANK_FIX_GUIDE.md` - File hướng dẫn này

## ELO to Rank Mapping:
- 1000-1099: K
- 1100-1199: K+
- 1200-1299: I
- 1300-1399: I+
- 1400-1499: H
- 1500-1599: H+
- 1600-1699: G
- 1700-1799: G+
- 1800-1899: F
- 1900-1999: F+
- 2000-2099: E
- 2100+: E+
