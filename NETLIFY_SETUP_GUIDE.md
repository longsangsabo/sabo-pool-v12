# 🚀 HƯỚNG DẪN DEPLOY NETLIFY CHO SABO POOL V12

## ✅ SẴN SÀNG DEPLOY!
Build test đã thành công! Dự án của bạn đã ready để deploy lên Netlify.

## 📋 CHECKLIST SETUP NETLIFY (5 phút)

### **Bước 1: Truy cập Netlify**
- Vào [https://netlify.com](https://netlify.com)
- Đăng nhập bằng GitHub account

### **Bước 2: Tạo Site Mới**
- Click **"Add new site"** → **"Import an existing project"**
- Chọn **"Deploy with GitHub"**
- Chọn repository: **`longsangsabo/sabo-pool-v12`**

### **Bước 3: Cấu hình Build Settings**
```
Build command: pnpm build:user
Publish directory: apps/sabo-user/dist
```

### **Bước 4: Environment Variables**
Vào **Site settings** → **Environment variables** → **Add variable**:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
VITE_APP_ENV=production
NODE_VERSION=18
PNPM_VERSION=8.15.0
```

### **Bước 5: Deploy!**
- Click **"Deploy site"**
- Netlify sẽ auto build và deploy

## 🔄 AUTO DEPLOY ĐÃ ACTIVE!

Sau khi setup xong, mọi lần bạn:
```bash
git push origin main
```

→ Netlify sẽ tự động:
1. ✅ Detect code changes
2. ✅ Run `pnpm build:user`
3. ✅ Deploy to live site
4. ✅ Update URL

## 📱 KẾT QUẢ:
- **Live URL**: https://your-site-name.netlify.app
- **Admin Panel**: Netlify dashboard để monitor
- **Deploy History**: Xem tất cả deployments
- **Rollback**: 1-click rollback nếu cần

## 🆘 NẾU CÓ VẤN ĐỀ:
1. Kiểm tra **Deploy logs** trong Netlify dashboard
2. Verify environment variables đã đúng
3. Check build command và publish directory

## 🎉 DONE!
Sau 5 phút setup → Auto deploy forever!
