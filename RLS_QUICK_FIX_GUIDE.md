## 🛠️ **QUICK RLS FIX FOR DEVELOPMENT**

### **Vấn đề**: RLS policies chặn bracket generation

### **Solution 1: Manual SQL (Recommended)**
Vào **Supabase Dashboard** → **SQL Editor** và chạy:

```sql
-- Temporary policy for development
CREATE POLICY IF NOT EXISTS "temp_dev_allow_all_matches" ON public.tournament_matches
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### **Solution 2: Disable RLS (Quick but not secure)**
```sql
-- Temporarily disable RLS for tournament_matches
ALTER TABLE public.tournament_matches DISABLE ROW LEVEL SECURITY;
```

### **Solution 3: Fix existing policy**
```sql
-- Update existing policy to be more permissive
DROP POLICY IF EXISTS "tournament_organizers_manage_matches" ON public.tournament_matches;

CREATE POLICY "tournament_organizers_manage_matches" ON public.tournament_matches
  FOR ALL 
  TO authenticated
  USING (
    -- Allow if user is admin
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true) OR
    -- Allow if user has club access  
    EXISTS(SELECT 1 FROM club_profiles WHERE user_id = auth.uid()) OR
    -- Allow if tournament belongs to user
    tournament_id IN (
      SELECT t.id FROM tournaments t 
      WHERE t.created_by = auth.uid()
    )
  );
```

---

### **🧪 Test after applying:**
1. Apply one of the SQL solutions above
2. Test SABO bracket generation
3. Should see "✅ Successfully saved X/X matches"

**Chọn Solution 1 (temp policy) để test nhanh!** 🚀
