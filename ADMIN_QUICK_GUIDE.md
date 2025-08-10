# 🛡️ Admin Quick Guide - Legacy SPA Management

## 🚀 Quick Start cho Admin

### 1. Truy cập Admin Panel
```
URL: http://localhost:8080/admin
Tab: "Legacy SPA Management"
```

### 2. Kiểm tra Legacy Data
```bash
# Check total legacy players
SELECT COUNT(*) FROM legacy_spa_points; -- Should be 45

# Check claimed status
SELECT 
  COUNT(CASE WHEN claimed THEN 1 END) as claimed,
  COUNT(CASE WHEN NOT claimed THEN 1 END) as unclaimed
FROM legacy_spa_points;
```

### 3. Approve Workflow
```
📋 Check Request:
✅ Tên có trong legacy database?
✅ Facebook URL hợp lệ? 
✅ Chưa bị claim bởi ai khác?
✅ User đã đăng ký tài khoản?

👍 Approve:
- Click "Approve" button
- SPA points auto-added to user account
- Legacy record marked as claimed

👎 Reject:
- Click "Reject" button  
- Add rejection reason
- User can re-submit with correct info
```

### 4. Important Commands

#### Reset a Legacy Claim (if needed)
```sql
-- Reset claim for a specific player
UPDATE legacy_spa_points 
SET claimed = false, claimed_by = null, claimed_at = null
WHERE full_name = 'PLAYER_NAME';
```

#### Check User SPA Balance
```sql
-- See user's current SPA points
SELECT p.display_name, pr.spa_points 
FROM profiles p
JOIN player_rankings pr ON p.user_id = pr.player_id
WHERE p.email = 'user@email.com';
```

#### Daily Report Query
```sql
-- Daily claim report
SELECT 
  DATE(claimed_at) as claim_date,
  COUNT(*) as claims_today,
  SUM(spa_points) as total_spa_claimed
FROM legacy_spa_points 
WHERE claimed = true 
GROUP BY DATE(claimed_at)
ORDER BY claim_date DESC;
```

### 5. Troubleshooting

#### Issue: Can't approve claim
```bash
# Check database connection
# Refresh admin page
# Verify user exists in profiles table
```

#### Issue: Duplicate claims
```sql
-- Find potential duplicates
SELECT claimed_by, COUNT(*) 
FROM legacy_spa_points 
WHERE claimed = true 
GROUP BY claimed_by 
HAVING COUNT(*) > 1;
```

#### Issue: Missing legacy data
```bash
# Re-run migration
cd /workspaces/sabo-pool-v12
./auto-apply-migrations.sh

# Verify data
SELECT COUNT(*) FROM legacy_spa_points; -- Should be 45
```

### 6. Security Checklist

⚠️ **Before Approving:**
- [ ] Verify Facebook profile matches name
- [ ] Check profile is public/accessible
- [ ] Confirm user owns the Facebook account
- [ ] Ensure no previous claims for this legacy player

⚠️ **After Approving:**
- [ ] Verify SPA points added to user account
- [ ] Check legacy record marked as claimed
- [ ] Log the approval in admin notes (optional)

### 7. Emergency Actions

#### Revoke a Claim (DANGER ZONE)
```sql
-- Remove SPA points from user
UPDATE player_rankings 
SET spa_points = spa_points - CLAIMED_AMOUNT
WHERE player_id = 'USER_ID';

-- Reset legacy claim
UPDATE legacy_spa_points 
SET claimed = false, claimed_by = null, claimed_at = null
WHERE id = 'LEGACY_ID';
```

#### Backup Legacy Data
```sql
-- Export current state
COPY legacy_spa_points TO '/tmp/legacy_backup.csv' WITH CSV HEADER;
```

### 8. Monitoring Dashboard

#### Key Metrics to Watch:
- **Total Claims**: X/45 completed
- **Pending Requests**: X waiting for approval
- **Rejection Rate**: Keep under 10%
- **Average Processing Time**: Target < 24 hours

#### Red Flags:
🚨 **High rejection rate** → Review criteria
🚨 **Slow processing** → Increase admin availability  
🚨 **Duplicate claims** → Strengthen verification
🚨 **System errors** → Check database/server health

---

## 📱 Quick Contact Info

**Technical Issues**: Check server logs
**Database Problems**: Supabase dashboard
**User Complaints**: Review rejection reasons
**Performance**: Monitor Vite dev server

*Last updated: August 10, 2025*
