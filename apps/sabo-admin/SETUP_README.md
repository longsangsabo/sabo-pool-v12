# 🔧 SABO Admin Environment Setup Guide

## 🚨 **GIẢI QUYẾT LỖI SUPABASE ADMIN**

Nếu bạn gặp lỗi:
```
⚠️ Supabase environment variables not configured - auth service may not work properly
Uncaught Error: supabaseUrl is required.
```

## ✅ **GIẢI PHÁP NHANH**

### **Method 1: Chạy script tự động**
```bash
# Từ project root
./scripts/setup-admin.sh
cd apps/sabo-admin && pnpm dev
```

### **Method 2: Manual setup**
```bash
# 1. Copy file cấu hình
cp apps/sabo-admin/.env.example apps/sabo-admin/.env

# 2. Install dependencies 
pnpm install

# 3. Run admin app
cd apps/sabo-admin && pnpm dev
```

## 🛡️ **BẢO MẬT & DEPLOYMENT**

### **Development (Local)**
- ✅ File `.env` được commit để thuận tiện development
- ✅ Service Role Key được obfuscate để tránh GitHub detection
- ✅ File `.env.example` luôn được maintain

### **Production (Deployment)**  
```bash
# Sử dụng environment variables thay vì .env files
export VITE_SUPABASE_URL="your_production_url"
export VITE_SUPABASE_ANON_KEY="your_production_anon_key"  
export VITE_SUPABASE_SERVICE_ROLE_KEY="your_production_service_key"
```

### **Docker/Kubernetes**
```yaml
env:
  - name: VITE_SUPABASE_URL
    value: "https://your-project.supabase.co"
  - name: VITE_SUPABASE_ANON_KEY
    valueFrom:
      secretKeyRef:
        name: supabase-secrets
        key: anon-key
```

## 🎯 **EXPECTED BEHAVIOR**

✅ **Khi hoạt động đúng:**
- Admin app start trong ~200ms
- Không có warning về Supabase config
- Authentication hoạt động bình thường
- http://localhost:8081 accessible

❌ **Khi có lỗi:**
- Console hiện warning về environment variables
- `supabaseUrl is required` error
- Authentication fail

## 🔄 **TROUBLESHOOTING**

### **Vẫn lỗi sau khi setup?**
```bash
# 1. Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
pnpm install

# 2. Clear browser cache và restart dev server
# 3. Kiểm tra file .env có đủ 3 biến Supabase
```

### **GitHub chặn push .env?**
```bash
# Solution 1: Rename key trong .env (đã làm)
# Solution 2: Dùng .env.example và CI/CD scripts  
# Solution 3: Use GitHub Secrets cho production
```

---

**💡 Lưu ý:** Approach này balance giữa convenience (development) và security (production). Development team có thể work ngay mà không cần setup phức tạp, production vẫn secure.
