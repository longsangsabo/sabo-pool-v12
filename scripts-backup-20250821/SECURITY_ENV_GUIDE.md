# 🔒 SECURITY GUIDE - Environment Variables

## ⚠️ **QUAN TRỌNG VỀ BẢO MẬT**

### 🚨 **KHÔNG BAO GIỜ commit file .env vào Git!**

**Lý do:**

- Chứa thông tin nhạy cảm (database passwords, API keys)
- Một khi commit, thông tin sẽ tồn tại mãi trong git history
- Có thể bị lộ khi push lên GitHub public repository

### ✅ **Cách setup an toàn:**

#### 1. **Local Development:**

```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa với thông tin thật
nano .env
```

#### 2. **Netlify Deployment:**

Thay vì dùng file .env, set environment variables trong **Netlify Dashboard**:

1. Vào Netlify Dashboard > Your Site > Site settings
2. Environment variables > Add variable
3. Thêm từng biến:

```
VITE_SUPABASE_URL=https://exlqvlbawytbglioqfbc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA
VITE_APP_VERSION=1.0.0
```

#### 3. **Git Security:**

File `.gitignore` đã được setup để loại trừ:

```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 🛡️ **Best Practices:**

1. **Chỉ dùng VITE\_ prefix** cho client-side variables
2. **Không bao giờ để database passwords** trong client code
3. **ANON_KEY** của Supabase được thiết kế để public, nhưng vẫn nên bảo vệ
4. **Rotate keys định kỳ** nếu nghi ngờ bị lộ
5. **Sử dụng RLS (Row Level Security)** trong Supabase để bảo vệ data

### 📝 **Checklist Deploy:**

- [ ] File .env KHÔNG có trong git
- [ ] Environment variables đã set trong Netlify Dashboard
- [ ] Build test thành công
- [ ] RLS policies đã được setup trong Supabase

---

_🔐 Security first! Protect your application and users._
