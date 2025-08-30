# 🚨 DEBUG GUIDE: RANK REGISTRATION ERROR

## Bước 1: Kiểm tra Browser Console

**Mở Developer Tools (F12) và làm theo:**

1. **Mở Console tab**
2. **Clear console** (Ctrl + L)
3. **Thử đăng ký rank** 
4. **Xem lỗi gì xuất hiện**

## Bước 2: Kiểm tra Network Tab

1. **Mở Network tab** 
2. **Filter: XHR/Fetch**
3. **Thử đăng ký rank**
4. **Xem request nào fail** (màu đỏ)
5. **Click vào request fail** → xem Response

## Bước 3: Kiểm tra Authentication

**Trong Console, chạy lệnh:**

```javascript
// Check auth status
const { data: { user }, error } = await supabase.auth.getUser();
console.log('Auth User:', user);
console.log('Auth Error:', error);

// Check profile
if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  console.log('Profile:', profile);
}
```

## Bước 4: Các lỗi thường gặp

### ❌ "User not authenticated"
- **Nguyên nhân**: Chưa login hoặc session expired
- **Fix**: Login lại

### ❌ "Row-level security policy violated"  
- **Nguyên nhân**: User ID mismatch hoặc RLS policy chặn
- **Fix**: Check user.id matches profile.id

### ❌ "Column does not exist"
- **Nguyên nhân**: Field mismatch trong request
- **Fix**: Check useRankRequests hook

### ❌ "Profile not found"
- **Nguyên nhân**: Profile trigger không chạy khi sign up
- **Fix**: Manual tạo profile

## Bước 5: Manual Fix Profile (nếu cần)

**Nếu profile chưa được tạo, thử:**

```javascript
// Tạo profile manual
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      current_rank: 'K',
      created_at: new Date().toISOString()
    });
  console.log('Profile created:', data, error);
}
```

---

**🔍 Hãy làm theo các bước trên và report lại lỗi cụ thể!**
