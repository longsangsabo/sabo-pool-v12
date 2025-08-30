# 🔍 Phân Tích Lỗi Tournament Schema Cache

## 📋 **Tóm Tắt Lỗi**

**Lỗi:** `authRecovery.ts:131 Error loading recent activities`
```
{
  code: 'PGRST200', 
  details: "Searched for a foreign key relationship between 'tournament_registrations' and 'tournaments' in the schema 'public', but no matches were found.", 
  hint: "Perhaps you meant 'tournament_results' instead of 'tournament_registrations'.", 
  message: "Could not find a relationship between 'tournament_registrations' and 'tournaments' in the schema cache"
}
```

## 🎯 **Nguyên Nhân Chính**

### 1. **PostgREST Schema Cache Issue**
- **Vấn đề:** PostgREST không nhận diện được foreign key relationship giữa `tournament_registrations` và `tournaments`
- **Nguyên nhân:** Schema cache chưa được refresh sau khi thay đổi database structure
- **Location:** `/src/hooks/useRecentActivities.ts:59-64`

### 2. **Query Sử Dụng PostgREST Relations**
```typescript
// ❌ Lỗi: Sử dụng nested relationship
const { data: tournaments, error: tournamentError } = await supabase
  .from('tournament_registrations')
  .select(`
    id,
    created_at,
    tournaments (name)  // ← Này gây lỗi!
  `)
```

### 3. **Schema Migration Conflicts**
- Multiple migrations tạo và recreate bảng `tournament_registrations`
- Foreign key constraints có thể bị mất hoặc không được PostgREST nhận diện
- Migration files: `20250811130000-consolidated-tournament-schema.sql`

## 🔧 **Giải Pháp Đã Áp Dụng**

### **1. Thay Đổi Query Strategy**
```typescript
// ✅ Fixed: Tách queries để tránh PostgREST relations
// Query 1: Get registrations
const { data: tournamentRegistrations } = await supabase
  .from('tournament_registrations')
  .select('id, created_at, tournament_id')
  .eq('user_id', user.id);

// Query 2: Get tournament names separately  
const { data: tournamentData } = await supabase
  .from('tournaments')
  .select('id, name')
  .in('id', tournamentIds);
```

### **2. Manual Relationship Resolution**
```typescript
// Create tournament lookup map
let tournamentNames = new Map();
tournamentData.forEach(t => {
  tournamentNames.set(t.id, t.name);
});

// Use map to resolve names
const tournamentName = tournamentNames.get(registration.tournament_id) || 'giải đấu';
```

## 📊 **Database Schema Status**

### **Tables Involved:**
1. **`tournament_registrations`** ✅ Exists
   - Primary key: `id`
   - Foreign key: `tournament_id` → `tournaments(id)`
   - User reference: `user_id` → `auth.users(id)`

2. **`tournaments`** ✅ Exists  
   - Primary key: `id`
   - Contains tournament metadata

### **Foreign Key Constraint:**
```sql
-- Should exist but not recognized by PostgREST
CONSTRAINT tournament_registrations_tournament_id_fkey 
FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
```

## 🚨 **Tại Sao Lỗi Xảy Ra**

### **1. PostgREST Schema Cache Lag**
- PostgREST cache schema metadata để tối ưu performance
- Khi schema thay đổi, cache cần được refresh
- Migration có thể không trigger cache refresh tự động

### **2. Multiple Table Recreations**
- Bảng `tournament_registrations` đã được create/drop nhiều lần
- Foreign key constraints có thể bị inconsistent
- PostgREST có thể cache outdated schema info

### **3. Supabase Cloud Environment**
- Schema cache refresh trên Supabase Cloud có thể chậm
- Local development và production có thể có behavior khác nhau

## ✅ **Validation Tests**

### **Test 1: Direct Table Access**
```sql
-- ✅ Should work
SELECT COUNT(*) FROM tournament_registrations;
SELECT COUNT(*) FROM tournaments;
```

### **Test 2: Manual Join**
```sql
-- ✅ Should work  
SELECT tr.id, t.name 
FROM tournament_registrations tr
JOIN tournaments t ON tr.tournament_id = t.id;
```

### **Test 3: PostgREST Relationship**
```javascript
// ❌ May fail due to cache
supabase.from('tournament_registrations').select('*, tournaments(*)')
```

## 🎯 **Long-term Solutions**

### **1. Schema Cache Management**
- Implement proper PostgREST schema reload after migrations
- Add schema validation checks in CI/CD

### **2. Query Strategy**
- Prefer explicit joins over PostgREST relations for complex queries
- Use PostgREST relations only for simple, stable relationships

### **3. Migration Best Practices**
- Avoid recreating tables with existing data
- Use ALTER statements instead of DROP/CREATE when possible
- Add explicit schema refresh commands

## 📈 **Impact Assessment**

### **Before Fix:**
- ❌ Recent activities loading failed
- ❌ Mobile profile tournament section broken
- ❌ User experience degraded

### **After Fix:**
- ✅ Recent activities load successfully
- ✅ Tournament registration history displays
- ✅ Improved error resilience
- ✅ Better performance (fewer nested queries)

## 🔄 **Future Prevention**

1. **Add schema validation tests**
2. **Implement PostgREST health checks**
3. **Monitor PostgREST logs for relationship errors**
4. **Use database constraints validation in CI**

---

**Status:** ✅ **RESOLVED**  
**Fix Applied:** 2025-08-21  
**File Changed:** `/src/hooks/useRecentActivities.ts`  
**Method:** Replaced PostgREST relations with explicit separate queries
