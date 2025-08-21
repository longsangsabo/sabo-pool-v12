# 🗃️ HƯỚNG DẪN SỬ DỤNG CÁC SCRIPTS SQL CHO TOURNAMENTS TABLE

## 📋 TỔNG QUAN

Tôi đã tạo 4 scripts SQL để tối ưu hóa bảng `tournaments` trên Supabase:

1. **`01-add-additional-columns.sql`** - Thêm các trường bổ sung
2. **`02-cleanup-duplicate-columns.sql`** - Dọn dẹp cột trùng lặp  
3. **`03-schema-updates-validation.sql`** - Cập nhật schema và validation
4. **`04-rollback-script.sql`** - Script rollback (chỉ dùng khi cần)

---

## 🚀 THỨ TỰ THỰC HIỆN

### **BƯỚC 1: Chạy Script 1 - Thêm cột bổ sung**
```sql
-- Copy và paste nội dung 01-add-additional-columns.sql vào Supabase SQL Editor
-- Script này sẽ thêm 15 cột mới để form đầy đủ hơn
```

**Các cột được thêm:**
- `venue_name` - Tên địa điểm
- `is_public` - Giải đấu công khai  
- `requires_approval` - Cần phê duyệt đăng ký
- `tier_level` - Cấp độ giải đấu
- `allow_all_ranks` - Cho phép tất cả rank
- `eligible_ranks` - Danh sách rank được phép (JSONB)
- `organizer_id` - ID người tổ chức
- `banner_image` - URL ảnh banner
- `registration_fee` - Phí đăng ký
- `tournament_format_details` - Chi tiết format (JSONB)
- `special_rules` - Quy định đặc biệt (JSONB)
- `contact_person` - Người liên hệ
- `contact_phone` - SĐT liên hệ
- `live_stream_url` - URL live stream
- `sponsor_info` - Thông tin nhà tài trợ (JSONB)

### **BƯỚC 2: Chạy Script 2 - Dọn dẹp cột trùng lặp**
```sql
-- Copy và paste nội dung 02-cleanup-duplicate-columns.sql vào Supabase SQL Editor
-- Script này sẽ backup data và xóa các cột trùng lặp
```

**Các cột bị xóa:**
- `first_prize, second_prize, third_prize` → Thay bằng `prize_distribution`
- `start_date, end_date` → Thay bằng `tournament_start, tournament_end`  
- `comprehensive_rewards` → Thay bằng `prize_distribution`

### **BƯỚC 3: Chạy Script 3 - Cập nhật schema**
```sql
-- Copy và paste nội dung 03-schema-updates-validation.sql vào Supabase SQL Editor
-- Script này thêm constraints, functions và views
```

**Được thêm:**
- Constraints kiểm tra dates, participants, prize_pool
- Functions: `get_tournament_champion_prize`, `create_default_prize_distribution`
- View: `tournaments_with_prize_info`
- Trigger tự động cập nhật `updated_at`

---

## 🔧 CÁCH SỬ DỤNG

### **Trên Supabase Dashboard:**

1. **Mở SQL Editor**: Dashboard → SQL Editor
2. **Chạy từng script theo thứ tự**: 1 → 2 → 3
3. **Sử dụng service_role token** để có đủ quyền
4. **Kiểm tra kết quả** sau mỗi script

### **Kiểm tra kết quả:**
```sql
-- Xem tất cả cột sau khi thêm
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Kiểm tra tournaments có prize_distribution
SELECT COUNT(*) FROM tournaments WHERE prize_distribution IS NOT NULL;

-- Sử dụng view mới
SELECT * FROM tournaments_with_prize_info LIMIT 5;
```

---

## 📊 KẾT QUẢ SAU KHI HOÀN TẤT

### **Database Structure:**
- ✅ **57+ cột** thay vì 42 cột cũ
- ✅ **Không còn cột trùng lặp** 
- ✅ **prize_distribution JSONB** thay thế các cột prize riêng lẻ
- ✅ **Constraints đầy đủ** cho data integrity
- ✅ **Indexes tối ưu** cho performance

### **New Capabilities:**
- 🎯 Tạo tournament với full prize data trong 1 operation
- 📊 Query prize data dễ dàng với JSONB
- 🔍 View `tournaments_with_prize_info` cho reporting
- 🔧 Functions hỗ trợ prize calculation
- 📝 Form có thể sử dụng tất cả fields mới

---

## 🆘 ROLLBACK NẾU CẦN

**Nếu có vấn đề, chạy Script 4:**
```sql
-- Copy và paste nội dung 04-rollback-script.sql vào Supabase SQL Editor
-- WARNING: Script này sẽ hoàn tác TẤT CẢ thay đổi!
```

**Script rollback sẽ:**
- Khôi phục lại các cột đã xóa (từ backup)
- Xóa các cột mới đã thêm
- Xóa functions, views, constraints mới
- Reset về trạng thái ban đầu

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Backup trước khi chạy**: Supabase tự động backup nhưng nên tạo snapshot manual
2. **Test trên staging trước**: Nếu có env staging
3. **Chạy từng script một**: Không chạy tất cả cùng lúc
4. **Kiểm tra kết quả**: Sau mỗi script
5. **Service role required**: Cần quyền admin để ALTER TABLE

---

## 🎯 IMPACT LÊN CODE

Sau khi chạy scripts, bạn có thể:

### **Cập nhật Form:**
```typescript
// Thêm các field mới vào form
venue_name: string;
is_public: boolean;  
requires_approval: boolean;
tier_level: 'tier_1' | 'tier_2' | 'tier_3';
banner_image: string;
// ...
```

### **Sử dụng prize_distribution:**
```typescript
// Thay vì first_prize, second_prize, third_prize
const tournament = {
  prize_distribution: {
    total_positions: 16,
    positions: [
      {
        position: 1,
        position_name: "Vô địch", 
        cash_amount: 800000,
        elo_points: 100
      }
      // ...
    ]
  }
}
```

### **Query dữ liệu:**
```sql
-- Lấy thông tin giải thưởng
SELECT * FROM tournaments_with_prize_info WHERE id = 'tournament-id';

-- Lấy giải vô địch
SELECT get_tournament_champion_prize('tournament-id');
```

---

## 🎉 KẾT LUẬN

Scripts này sẽ:
- ✅ **Làm form đầy đủ hơn** với 15+ field mới
- ✅ **Database gọn gàng hơn** bằng cách xóa cột trùng lặp  
- ✅ **Cải thiện performance** với prize_distribution JSONB
- ✅ **Tăng data integrity** với constraints và validation
- ✅ **Dễ maintain** với functions và views hỗ trợ

**🚀 Sẵn sàng để deploy và sử dụng!**
