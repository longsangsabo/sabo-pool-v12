# 🏆 Legacy SPA Claim System - Deployment Guide

## 📋 Tổng quan

Hệ thống Legacy SPA Claim cho phép users claim điểm SPA từ hệ thống cũ với quy trình xác thực và phê duyệt của SABO admin.

## 🔧 Kiến trúc hệ thống

### Database Schema
```sql
legacy_spa_claim_requests:
- id (UUID) - Primary key
- requester_user_id (UUID) - User making claim
- legacy_entry_id (UUID) - Legacy SPA entry being claimed
- verification_phone (TEXT) - Phone for SABO verification
- status (TEXT) - pending/approved/rejected/cancelled
- reviewed_by (UUID) - Admin who reviewed
- admin_notes (TEXT) - Admin notes
- created_at/updated_at (TIMESTAMP)
```

### Functions
1. **`submit_legacy_spa_claim_request()`** - User submits claim
2. **`review_legacy_spa_claim_request()`** - Admin approve/reject
3. **`get_pending_claim_requests()`** - Get pending claims for admin

### RLS Policies
- Users: View own claims only
- SABO Admins & Club Owners: View/manage all claims

## 🚀 Deployment Steps

### Step 1: Apply Database Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Apply migration
supabase migration up
```

**Option B: Manual Deployment**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Navigate to **SQL Editor**
3. Copy content of `supabase/migrations/20250810105444_create_legacy_claim_system.sql`
4. Paste and execute in SQL Editor

### Step 2: Run Deployment Script

```bash
# Run automated deployment and test
./deploy-legacy-claim.sh
```

### Step 3: Frontend Activation

Frontend đã được cập nhật để:
- ✅ Bỏ TEST MODE
- ✅ Kích hoạt real function calls
- ✅ Fallback logic nếu functions chưa deploy
- ✅ Better error handling

### Step 4: Test Complete Flow

1. **User Flow:**
   - Go to `/spa` → Legacy SPA tab
   - Click "Claim" on any entry
   - Enter phone number
   - Submit request

2. **Admin Flow:**
   - Login with admin account or SABO club owner
   - Go to Club Management → Member Management
   - Check "Legacy Claim Requests" section
   - Approve/reject claims

## 🧪 Testing Guide

### Automated Test
```bash
# Run connection and function test
./deploy-legacy-claim.sh
```

### Manual Testing

#### Test User Claim:
```javascript
// In browser console at /spa page
const { data, error } = await supabase.rpc('submit_legacy_spa_claim_request', {
  p_legacy_entry_id: 'valid-legacy-uuid',
  p_verification_phone: '0961167717'
});
console.log({ data, error });
```

#### Test Admin Panel:
```javascript
// Check authorization
const { data } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('user_id', user.id)
  .single();
console.log('Is admin:', data?.is_admin);
```

## 📱 User Interface

### User Claim Interface
**Location:** `src/components/legacy/CombinedSPALeaderboard.tsx`

Features:
- ✅ Display legacy SPA entries
- ✅ Claim button for each entry
- ✅ Phone verification modal
- ✅ Success/error result modal
- ✅ Real-time status updates

### Admin Panel
**Location:** `src/components/legacy/LegacyClaimAdminPanel.tsx`

Features:
- ✅ View all pending claims
- ✅ User details with verification info
- ✅ Approve/reject with notes
- ✅ Bulk actions
- ✅ Activity history

**Access Points:**
1. Club Management → Member Management tab
2. Legacy SPA Dashboard → Admin section

## 🔐 Authorization

### Admin Access
- ✅ SABO system admins (`profiles.is_admin = true`)
- ✅ SABO/SBO/POOL ARENA club owners

### User Permissions
- ✅ Submit claims for own account
- ✅ View own claim history
- ❌ Cannot view other users' claims

## 🔔 Notifications (Future Enhancement)

Planned notification system:
```sql
-- Auto notification on claim approval/rejection
INSERT INTO notifications (
  user_id, type, title, message, 
  action_url, priority, metadata
) VALUES (
  claim_user_id, 
  'legacy_claim_approved',
  'Legacy SPA Claim Approved!',
  'You received X SPA points from legacy account',
  '/spa',
  'high',
  '{"spa_points": X, "legacy_name": "..."}'
);
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
1. **Claim Volume:** Total claims submitted daily/weekly
2. **Approval Rate:** % of claims approved vs rejected
3. **Processing Time:** Average time from submission to decision
4. **User Adoption:** % of legacy users who claimed their points

### Monitoring Queries
```sql
-- Daily claim statistics
SELECT 
  DATE(created_at) as date,
  status,
  COUNT(*) as count,
  SUM(legacy_spa_points) as total_points
FROM legacy_spa_claim_requests 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), status
ORDER BY date DESC;

-- Top claimed legacy accounts
SELECT 
  legacy_full_name,
  legacy_nick_name,
  COUNT(*) as claim_count,
  SUM(legacy_spa_points) as total_points_claimed
FROM legacy_spa_claim_requests
WHERE status = 'approved'
GROUP BY legacy_full_name, legacy_nick_name
ORDER BY total_points_claimed DESC
LIMIT 10;
```

## 🛠️ Troubleshooting

### Common Issues

**1. "Function does not exist" Error**
```
Solution: Apply migration first
Check: Go to Supabase Dashboard → Database → Functions
Expected: submit_legacy_spa_claim_request, review_legacy_spa_claim_request
```

**2. "Insufficient privileges" Error**
```
Solution: Check RLS policies are applied
Check: User has correct role (admin or SABO club owner)
```

**3. Admin Panel Not Showing**
```
Solution: Check user authorization
Debug: Console.log in LegacyClaimAdminPanel.tsx checkAuthorization()
```

**4. Claims Not Appearing**
```
Solution: Check get_pending_claim_requests function
Debug: Test function manually in SQL Editor
```

### Debug Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'legacy_spa_claim_requests';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%legacy%claim%';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'legacy_spa_claim_requests';

-- View all claims (admin only)
SELECT * FROM legacy_spa_claim_requests 
ORDER BY created_at DESC;
```

## 🔄 Maintenance

### Regular Tasks
1. **Weekly:** Review pending claims
2. **Monthly:** Analyze claim patterns and fraud detection
3. **Quarterly:** Update legacy data sources

### Data Cleanup
```sql
-- Archive old completed claims (keep for audit)
UPDATE legacy_spa_claim_requests 
SET archived = true 
WHERE status IN ('approved', 'rejected') 
AND created_at < NOW() - INTERVAL '1 year';
```

## 📈 Future Enhancements

### Phase 2 Features
1. **Batch Processing:** Bulk approve/reject
2. **Enhanced Verification:** SMS/Email verification
3. **Audit Trail:** Detailed action history
4. **Reporting Dashboard:** Analytics for admins
5. **Auto-matching:** AI-powered claim validation

### Integration Points
1. **SMS Service:** For phone verification
2. **Email Service:** Notification delivery
3. **Analytics:** User behavior tracking
4. **Audit System:** Compliance logging

## 📞 Support

**Technical Issues:**
- Check logs in browser console
- Review Supabase function logs
- Contact: technical@sabo.vn

**Business Logic:**
- Legacy data verification
- Claim disputes
- Contact: admin@sabo.vn / 0961167717

---

*Last Updated: August 10, 2025*
*Version: 1.0.0*
