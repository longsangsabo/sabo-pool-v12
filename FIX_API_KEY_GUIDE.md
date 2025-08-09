🔧 **HƯỚNG DẪN KHẮC PHỤC API KEY INVALID**

## ⚡ QUICK FIX - Lấy API Key mới từ Supabase:

### **Bước 1: Truy cập Supabase Dashboard**
1. Mở: https://supabase.com/dashboard/project/exlqvlbawytbglioqfbc/settings/api
2. Đăng nhập tài khoản Supabase của bạn

### **Bước 2: Copy API Keys**
Trong trang Settings > API, copy 2 keys sau:

```
🔗 Project URL: 
https://exlqvlbawytbglioqfbc.supabase.co

🗝️ anon public key:
eyJ... (copy toàn bộ key này)
```

### **Bước 3: Cập nhật .env file**
```bash
# Mở file .env và thay thế:
VITE_SUPABASE_URL=https://exlqvlbawytbglioqfbc.supabase.co
VITE_SUPABASE_ANON_KEY=<KEY_MỚI_VỪA_COPY>
```

### **Bước 4: Cập nhật client.ts**
```bash
# Chạy script auto-update:
cd /workspaces/sabo-pool-v12
./fix-env.sh
```

### **Bước 5: Restart Dev Server**
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 🔍 **TẠI SAO KEY BỊ INVALID?**

1. **🔄 Project Reset**: Supabase project có thể đã được reset
2. **🔒 Security Rotation**: API keys được rotate định kỳ  
3. **⚠️ Project Suspension**: Project tạm thời bị suspend
4. **🏗️ Database Migration**: Database structure thay đổi

---

## ✅ **SAU KHI FIX XONG:**

1. **Test đăng nhập** - should work ngay
2. **Check console** - không còn 401 errors
3. **Authentication flow** - hoạt động bình thường
4. **Production comparison** - dev environment giống production

---

**🚨 LƯU Ý:** Nếu bạn không thể truy cập Supabase dashboard, có thể:
- Tài khoản Supabase hết hạn
- Project bị delete hoặc suspend  
- Cần contact admin để restore access

**📞 CONTACT:** Liên hệ team admin nếu không thể access Supabase dashboard.
