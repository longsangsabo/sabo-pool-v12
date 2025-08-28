## 🛠️ **FIXED SQL FOR RLS POLICY**

### **❌ Lỗi**: `CREATE POLICY IF NOT EXISTS` không supported

### **✅ SQL đúng** (Supabase Dashboard → SQL Editor):

```sql
-- Drop existing policy if exists, then create new one
DROP POLICY IF EXISTS "temp_dev_allow_all_matches" ON public.tournament_matches;

CREATE POLICY "temp_dev_allow_all_matches" ON public.tournament_matches
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### **🚨 Hoặc đơn giản hơn - Tắt RLS:**

```sql
-- Temporarily disable RLS for development
ALTER TABLE public.tournament_matches DISABLE ROW LEVEL SECURITY;
```

### **🧪 Sau khi chạy SQL:**

1. **Refresh browser** tại `http://localhost:8081/`
2. **Test SABO bracket generation**
3. **Xem console** → "✅ Successfully saved X/X matches"

---

**Copy SQL trên vào Supabase SQL Editor và chạy!** 🚀
