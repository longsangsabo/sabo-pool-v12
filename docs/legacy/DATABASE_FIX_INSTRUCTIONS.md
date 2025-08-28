# Database Fix Instructions - Player Milestones Schema

## Problem Summary
The tournament score submission is failing with error:
```
code: '42P10', message: 'there is no unique or exclusion constraint matching the ON CONFLICT specification'
```

This error occurs because the `player_milestones` table is missing required columns and the unique constraint needed for upsert operations.

## Root Cause
1. Missing columns in `player_milestones` table (user_id, metadata, completed, etc.)
2. Missing unique constraint on `(user_id, milestone_id)` for upsert operations
3. Frontend code expects these database features to exist

## Solution: Execute SQL Scripts in Order

**IMPORTANT**: Run these scripts in the exact order listed below:

### Step 1: Add user_id column
```bash
# Execute: add-user-id-column.sql
```

### Step 2: Add missing columns
```bash
# Execute: add-missing-milestone-columns.sql
```

### Step 3: Add remaining columns and constraints
```bash
# Execute: final-milestone-columns.sql
```

## What Each Script Does

### add-user-id-column.sql
- Adds the `user_id` column to `player_milestones` table
- Creates the foundation for the unique constraint

### add-missing-milestone-columns.sql
- Adds `completed`, `progress`, and other milestone-related columns
- Ensures all columns referenced by triggers exist

### final-milestone-columns.sql
- Adds remaining columns (`metadata`, `date`, `daily_checkin`, etc.)
- **Creates the critical unique constraint**: `UNIQUE (user_id, milestone_id)`
- Uses proper PostgreSQL syntax with DO block for constraint handling

## Verification
After running all scripts, the following should work without errors:

```javascript
// This upsert operation should succeed
await supabase
  .from('player_milestones')
  .upsert(data, { onConflict: 'user_id,milestone_id' })
  .select();
```

## Expected Outcome
- ✅ Tournament score submission will work
- ✅ Player milestone tracking will function correctly  
- ✅ No more "ON CONFLICT specification" errors
- ✅ SABO Pool Arena fully operational

## Files Updated
- ✅ `src/services/milestoneService.ts` - Updated to use `user_id` instead of `player_id`
- ✅ Frontend code ready and waiting for database schema fixes
- ✅ All SQL scripts created and syntax-validated

## Status
🔄 **PENDING**: Backend team needs to execute the 3 SQL scripts in order
🎯 **GOAL**: Complete database schema alignment for milestone system
