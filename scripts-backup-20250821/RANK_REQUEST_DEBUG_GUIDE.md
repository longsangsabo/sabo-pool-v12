# RANK REQUEST DEBUG GUIDE

## 🐛 Vấn đề đã phát hiện và fix:

### 1. Hook useRankRequests.tsx - FIXED ✅
**Vấn đề:** Dòng 163 đang convert `requested_rank` thành integer
```tsx
// ❌ TRƯỚC - Convert thành số
requested_rank: parseInt(data.requested_rank, 10),

// ✅ SAU - Giữ nguyên text
requested_rank: data.requested_rank,
```

### 2. Các component khác - ĐÃ ĐÚNG ✅
- `RankVerificationForm.tsx` - Đã đúng
- `RankRegistration.tsx` - Đã đúng  
- `RankRegistrationClean.tsx` - Đã đúng

## 🧪 Để test rank request:

### 1. Mở browser console (F12)
Xem logs khi gửi rank request:
```
[createRankRequest] payload {requested_rank: "H", club_id: "...", user_id: "..."}
```

### 2. Chạy SQL debug script
File: `debug-rank-requests.sql` trên Supabase Dashboard

### 3. Test steps:
1. Mở http://localhost:8080
2. Đi tới trang rank registration
3. Chọn rank "H - 1400 ELO (Trung bình)"
4. Chọn club
5. Submit form
6. Kiểm tra console logs
7. Kiểm tra database

## 🎯 Kết quả mong đợi:
- Console log: `requested_rank: "H"`
- Database: `requested_rank` column = "H"
- UI hiển thị: "H hạng" thay vì "1400"

## 🚨 Nếu vẫn lỗi:
1. Restart dev server: `npm run dev`
2. Hard refresh browser: Ctrl+Shift+R
3. Kiểm tra Supabase RLS policies
4. Kiểm tra database schema có column `requested_rank` type TEXT

## 📋 Files liên quan:
- `src/hooks/useRankRequests.tsx` - Main hook (đã fix)
- `src/components/RankRegistration*.tsx` - Form components (đã đúng)
- `debug-rank-requests.sql` - Debug script mới tạo
