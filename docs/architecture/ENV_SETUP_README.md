# 🔧 Environment Setup Guide

## Vấn đề
File `.env` không được commit vào git (do bảo mật), nên mỗi lần mở codespace mới bạn phải tạo lại.

## Giải pháp tự động
Bây giờ khi bạn chạy `npm run dev`, script sẽ tự động:
1. Kiểm tra xem file `.env` đã tồn tại chưa
2. Nếu chưa có, tự động copy từ `.env.template` 
3. Khởi động dev server

## Các cách sử dụng

### 1. Tự động (Khuyến nghị)
```bash
npm run dev  # Tự động setup và start server
```

### 2. Thủ công
```bash
npm run setup  # Chỉ setup .env
```

### 3. PowerShell script
```powershell
.\setup-env.ps1
```

### 4. Bash script
```bash
./setup-env.sh
```

## Thông tin môi trường hiện tại
- **Supabase URL**: `https://exlqvlbawytbglioqfbc.supabase.co`
- **ANON Key**: Đã được cập nhật phiên bản mới nhất
- **VNPay**: Cấu hình sandbox

## Files liên quan
- `.env.template` - Template chính thức (có thể commit)
- `.env.backup.20250809_110350` - Backup cũ (đã cập nhật)
- `.env.example` - Template mẫu
- `setup-env.ps1` - Script PowerShell
- `setup-env.sh` - Script Bash

## Lưu ý
✅ Bây giờ bạn không cần tạo lại `.env` mỗi lần mở codespace mới!
