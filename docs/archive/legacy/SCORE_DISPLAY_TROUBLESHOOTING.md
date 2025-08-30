🔍 HƯỚNG DẪN KIỂM TRA VẤN ĐỀ TỶ SỐ KHÔNG HIỂN THỊ TRÊN CARD
================================================================

## 1. NGUYÊN NHÂN CHÍNH
❌ Bạn chưa đăng nhập vào hệ thống!

## 2. CÁCH GIẢI QUYẾT

### Bước 1: Đăng nhập vào ứng dụng
1. Mở ứng dụng tại: http://localhost:8000
2. Click vào nút "Đăng nhập" hoặc "Login"
3. Đăng nhập với tài khoản Club Owner của bạn

### Bước 2: Kiểm tra quyền
- Đảm bảo tài khoản của bạn có role "club_owner"
- Đảm bảo bạn có quyền quản lý tournament

### Bước 3: Sau khi đăng nhập, kiểm tra:
1. Vào phần Tournament Management
2. Chọn giải đấu cần nhập tỷ số
3. Click vào trận đấu cần cập nhật tỷ số
4. Nhập tỷ số cho cả hai người chơi
5. Click "Lưu tỷ số" hoặc "Submit Score"

## 3. CÁC ĐIỂM CẦN KIỂM TRA KHI NHẬP TỶ SỐ

### Frontend (Giao diện):
✅ Component EnhancedMatchCard.tsx hiển thị tỷ số qua function getDisplayScore()
✅ Component SABOMatchCard.tsx có UI để nhập và hiển thị tỷ số
✅ Form submission sử dụng useSABOScoreSubmission hook

### Backend (Xử lý dữ liệu):
✅ Hook useSABOScoreSubmission sẽ:
   - Gửi tỷ số lên Supabase
   - Cập nhật trạng thái trận đấu
   - Xác định người thắng/thua
   - Refresh UI tự động

### Database (Lưu trữ):
✅ Tỷ số được lưu trong bảng tournament_matches:
   - score_player1: Tỷ số người chơi 1
   - score_player2: Tỷ số người chơi 2
   - winner_id: ID người thắng
   - status: 'completed' khi có kết quả

## 4. TÍNH NĂNG HIỂN THỊ TỶ SỐ

### Các component hiển thị tỷ số:
1. **EnhancedMatchCard.tsx**: 
   - Hiển thị "Kết quả: X - Y"
   - Màu sắc khác nhau theo trạng thái trận đấu

2. **SABOMatchCard.tsx**:
   - Hiển thị tỷ số trong score display
   - Form nhập tỷ số cho club owner

3. **TournamentBracketDisplay.tsx**:
   - Badge hiển thị tỷ số trong bracket

## 5. LƯU Ý QUAN TRỌNG

🔐 **Quyền truy cập**: Chỉ Club Owner mới có thể nhập/sửa tỷ số
📊 **Tự động cập nhật**: Sau khi lưu tỷ số, UI sẽ tự động refresh
🎯 **Xác định thắng thua**: Hệ thống tự động xác định winner dựa trên tỷ số
🔄 **Real-time**: Thay đổi được hiển thị ngay lập tức

## 6. KIỂM TRA SAU KHI ĐĂNG NHẬP

Chạy lệnh sau để kiểm tra trạng thái:
```bash
cd /workspaces/sabo-pool-v12 && node debug-score-issue.cjs
```

## 7. CÁC BƯỚC TROUBLESHOOTING

Nếu vẫn không hiển thị tỷ số sau khi đăng nhập:

1. **Kiểm tra console log**:
   - Mở Developer Tools (F12)
   - Xem tab Console có lỗi gì không

2. **Kiểm tra network requests**:
   - Tab Network trong Developer Tools
   - Xem request gửi lên Supabase có thành công không

3. **Refresh trang**:
   - Ctrl+F5 để hard refresh
   - Clear cache nếu cần

4. **Kiểm tra database**:
   - Chạy script debug để xem dữ liệu trong DB
   - Kiểm tra xem tỷ số có được lưu không

## KẾT LUẬN
Vấn đề chính là BẠN CHƯA ĐĂNG NHẬP. Hãy đăng nhập vào ứng dụng trước, sau đó nhập tỷ số sẽ hoạt động bình thường!
