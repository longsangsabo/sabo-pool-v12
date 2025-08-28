# 🚨 **DISABLE ALL RLS FOR DEVELOPMENT**

## **Quick & Simple Solution**

### **Copy vào Supabase Dashboard → SQL Editor:**

```sql
-- Disable RLS for all tournament tables
ALTER TABLE public.tournament_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results DISABLE ROW LEVEL SECURITY;

-- Optional: Disable for other tables if needed
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_profiles DISABLE ROW LEVEL SECURITY;
```

### **✅ Lợi ích:**
- **No more RLS errors** 🎉
- **Full database access** cho development
- **SABO bracket works** instantly
- **No complex policies** needed

### **⚠️ Note:**
- **Development only** - không dùng production
- **Single user** như bạn thì perfect
- **Can re-enable later** nếu cần

---

**Copy SQL trên → Paste vào Supabase → Run → Done! 🚀**

**Sau đó test SABO bracket → Should work perfectly!**
