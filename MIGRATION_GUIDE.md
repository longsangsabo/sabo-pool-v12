# HƯỚNG DẪN THỰC HIỆN THÊM LOCATION VÀ REQUIRED_RANK CHO CHALLENGES

## Bước 1: Chạy Migration Script
1. Mở Supabase Dashboard
2. Vào tab SQL Editor
3. Copy và chạy nội dung file: `migrate-location-required-rank.sql`

## Bước 2: Kiểm tra kết quả
1. Chạy script: `test-after-migration.sql`
2. Xem có lỗi gì không

## Bước 3: Nếu có lỗi RLS Policies
1. Chạy script: `fix-rls-policies.sql`
2. Test lại

## Bước 4: Test trên ứng dụng
1. Restart dev server: `npm run dev`
2. Tạo challenge mới với location và required_rank
3. Kiểm tra console logs
4. Xem challenge card có hiển thị location và required_rank không

## Các file script đã tạo:
- `migrate-location-required-rank.sql` - Script chính để thêm columns
- `test-after-migration.sql` - Script test sau migration  
- `fix-rls-policies.sql` - Script fix policies nếu cần

## Lưu ý:
- Đảm bảo có quyền admin trên Supabase
- Backup database trước khi chạy migration
- Kiểm tra logs trong console khi test

## Các trường sẽ hiển thị trên card:
- 📍 Location: "CLB thi đấu" 
- ⭐ Required Rank: "Yêu cầu hạng" với emoji tương ứng

## Debug logs sẽ hiển thị:
- 🚀 Form data being sent
- 💾 Data being inserted to DB  
- ✅ Challenge inserted successfully
