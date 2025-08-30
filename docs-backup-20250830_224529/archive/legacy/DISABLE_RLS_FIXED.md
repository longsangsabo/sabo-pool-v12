# 🚨 **DISABLE RLS - FIXED VERSION**

## **❌ Lỗi**: `tournament_results` table không tồn tại

## **✅ SQL đúng** - Copy vào Supabase:

```sql
-- Disable RLS for existing tournament tables only
ALTER TABLE public.tournament_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations DISABLE ROW LEVEL SECURITY;

-- Optional: Other common tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_profiles DISABLE ROW LEVEL SECURITY;
```

## **🎯 Chỉ disable tables có thật:**
- ✅ `tournament_matches` 
- ✅ `tournaments`
- ✅ `tournament_registrations`
- ✅ `profiles`
- ✅ `club_profiles`
- ❌ `tournament_results` (không tồn tại)

---

**Copy SQL trên → Paste → Run → SABO bracket sẽ work! 🚀**
