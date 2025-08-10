# 🏆 Hướng Dẫn Claim SPA Legacy Points - SABO Arena

## 📋 Tổng Quan
Hệ thống Legacy SPA Points cho phép 45 người chơi từ BXH SPA cũ claim lại điểm số của mình vào tài khoản mới trên SABO Arena.

### 💡 Thông Tin Quan Trọng
- **Tổng cộng**: 45 legacy players có thể claim
- **Phương thức xác thực**: Facebook URL
- **Chỉ claim 1 lần**: Mỗi legacy player chỉ có thể claim 1 lần duy nhất
- **Không chuyển nhượng**: SPA points không thể chuyển cho người khác

---

## 👤 HƯỚNG DẪN CHO USER

### Bước 1: Tạo Tài Khoản
1. **Truy cập website**: http://localhost:8080
2. **Đăng ký tài khoản mới**:
   - Click nút "Đăng ký" hoặc "Sign Up"
   - Nhập email và mật khẩu
   - Xác nhận email (nếu cần)
   - Hoàn tất đăng ký

### Bước 2: Kiểm Tra Danh Sách Legacy
1. **Xem BXH Legacy**: 
   - Vào `/leaderboard`
   - Chọn tab "SPA Leaderboard"
   - Tìm tên của bạn trong danh sách 45 players

2. **Top Legacy Players**:
   ```
   1.  ĐĂNG RT - 3,600 SPA
   2.  KHÁNH HOÀNG - 3,500 SPA  
   3.  THÙY LINH - 3,450 SPA
   4.  BEN HUYNH - 2,300 SPA
   5.  TRƯỜNG PHÚC - 2,300 SPA
   ... và 40 players khác
   ```

### Bước 3: Claim SPA Points
1. **Vào Profile**:
   - Click vào avatar/tên của bạn
   - Hoặc vào `/profile`

2. **Tìm phần Legacy SPA**:
   - Scroll xuống tìm tab "Legacy SPA Claim"
   - Hoặc tìm section "Claim SPA Legacy"

3. **Nhập thông tin**:
   - **Tên đầy đủ**: Nhập chính xác tên trong BXH (VD: "ĐĂNG RT")
   - **Facebook URL**: Nhập link Facebook của bạn
   - Hệ thống sẽ tự động gợi ý khi bạn gõ

4. **Xác nhận và Submit**:
   - Kiểm tra thông tin chính xác
   - Click "Claim Legacy SPA Points"
   - Đợi xác nhận từ admin

### Bước 4: Theo Dõi Trạng Thái
- **Chờ duyệt**: Admin sẽ kiểm tra và phê duyệt trong 24-48h
- **Thông báo**: Bạn sẽ nhận thông báo khi được approve
- **SPA Points**: Điểm sẽ được cộng vào tài khoản ngay sau khi approve

---

## 🛡️ HƯỚNG DẪN CHO ADMIN

### Bước 1: Truy Cập Admin Dashboard
1. **Đăng nhập với tài khoản admin**
2. **Vào Admin Dashboard**: `/admin`
3. **Chọn tab "Legacy SPA Management"**

### Bước 2: Quản Lý Claim Requests
1. **Xem danh sách requests**:
   - Tất cả claim requests sẽ hiển thị với trạng thái "Pending"
   - Thông tin: Tên, Facebook URL, SPA Points, User ID

2. **Xác thực thông tin**:
   ```
   ✅ Kiểm tra:
   - Tên có đúng trong database legacy không?
   - Facebook URL có khớp với thông tin gốc?
   - User có phải chính chủ tài khoản Facebook?
   - Legacy player này đã được claim chưa?
   ```

### Bước 3: Approve/Reject Claims
1. **Approve (Phê duyệt)**:
   - Click nút "Approve" màu xanh
   - SPA points sẽ tự động được cộng vào tài khoản user
   - Trạng thái legacy player chuyển thành "Claimed"

2. **Reject (Từ chối)**:
   - Click nút "Reject" màu đỏ
   - Nhập lý do từ chối (VD: "Sai thông tin Facebook")
   - User có thể claim lại với thông tin đúng

### Bước 4: Theo Dõi và Báo Cáo
1. **Thống kê real-time**:
   - Tổng claims: X/45
   - Pending: X requests
   - Approved: X claims
   - Rejected: X claims

2. **Xuất báo cáo**:
   - Danh sách đã claim
   - Danh sách chưa claim
   - Log activities

---

## 🔧 TROUBLESHOOTING

### Lỗi Thường Gặp - USER
1. **"Không tìm thấy tên trong database"**:
   - Kiểm tra chính tả tên (có thể có dấu, viết hoa/thường)
   - Tên phải khớp 100% với BXH legacy

2. **"Legacy player đã được claim"**:
   - Người khác đã claim trước
   - Liên hệ admin để kiểm tra

3. **"Facebook URL không hợp lệ"**:
   - URL phải có format: `https://www.facebook.com/username`
   - Không dùng link mobile (m.facebook.com)

### Lỗi Thường Gặp - ADMIN
1. **Không thể approve claim**:
   - Kiểm tra database connection
   - Refresh page và thử lại

2. **Legacy data không hiển thị**:
   - Kiểm tra migration đã chạy đúng chưa
   - Verify 45 records trong `legacy_spa_points` table

---

## 📊 DATABASE QUERIES HỮU ÍCH (CHO ADMIN)

### Kiểm tra Legacy Data
```sql
-- Xem tất cả legacy players
SELECT full_name, spa_points, claimed, claimed_at 
FROM legacy_spa_points 
ORDER BY spa_points DESC;

-- Đếm số claims
SELECT 
  COUNT(*) as total_players,
  SUM(CASE WHEN claimed THEN 1 ELSE 0 END) as claimed_count,
  SUM(CASE WHEN NOT claimed THEN 1 ELSE 0 END) as unclaimed_count
FROM legacy_spa_points;
```

### Kiểm tra User Claims
```sql
-- Xem user nào có SPA points
SELECT p.display_name, pr.spa_points, p.email
FROM profiles p
JOIN player_rankings pr ON p.user_id = pr.player_id
WHERE pr.spa_points > 0
ORDER BY pr.spa_points DESC;
```

---

## 🚨 LƯU Ý QUAN TRỌNG

### Cho User:
- ⚠️ **Chỉ claim 1 lần**: Không thể claim lại sau khi đã thành công
- ⚠️ **Thông tin chính xác**: Sai thông tin sẽ bị từ chối
- ⚠️ **Facebook công khai**: Đảm bảo Facebook profile có thể truy cập được

### Cho Admin:
- ⚠️ **Kiểm tra kỹ**: Một khi approve thì không thể hoàn tác
- ⚠️ **Backup dữ liệu**: Thường xuyên backup database
- ⚠️ **Log activities**: Ghi lại mọi thao tác approve/reject

---

## 📞 SUPPORT

### Cho User:
- **Technical Issues**: Liên hệ admin qua website
- **Claim Problems**: Submit request và đợi admin review
- **Facebook Issues**: Đảm bảo profile public và URL đúng

### Cho Admin:
- **Database Issues**: Check Supabase dashboard
- **Migration Problems**: Re-run migration scripts
- **Performance Issues**: Monitor server logs

---

*Hướng dẫn này được cập nhật vào ngày 10/08/2025. Mọi thay đổi sẽ được thông báo qua website.*
