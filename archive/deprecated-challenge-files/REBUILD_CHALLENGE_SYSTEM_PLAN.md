# 🎯 REBUILD CHALLENGE SYSTEM - MASTER PLAN

## 📋 **PHASE 1: ANALYSIS & CLEANUP**

### **Step 1: Identify All Existing Functions**
```sql
-- Get all challenge-related functions
SELECT 
    routine_name,
    routine_type,
    routine_schema,
    specific_name
FROM information_schema.routines 
WHERE routine_name ILIKE '%challenge%'
   OR routine_name ILIKE '%spa%'
   OR routine_name ILIKE '%accept%'
   OR routine_name ILIKE '%complete%'
ORDER BY routine_name;
```

### **Step 2: Identify All Triggers**
```sql
-- Get all triggers on challenge-related tables
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table IN ('challenges', 'matches', 'player_rankings', 'spa_transactions')
   OR action_statement ILIKE '%challenge%'
   OR action_statement ILIKE '%spa%'
ORDER BY event_object_table, trigger_name;
```

### **Step 3: Create Backup Script**
```sql
-- Backup existing functions before drop
SELECT 
    'CREATE OR REPLACE ' || routine_definition as backup_sql
FROM information_schema.routines 
WHERE routine_name ILIKE '%challenge%' OR routine_name ILIKE '%spa%';
```

---

## 📋 **PHASE 2: CLEAN DROP STRATEGY**

### **Step 1: Drop All Functions (Safe Order)**
```sql
-- Drop in dependency order to avoid cascade issues

-- 1. Drop triggers first
DROP TRIGGER IF EXISTS club_confirmation_trigger ON challenges;
DROP TRIGGER IF EXISTS spa_transfer_trigger ON challenges;
DROP TRIGGER IF EXISTS challenge_status_update ON challenges;
DROP TRIGGER IF EXISTS challenge_created_notification ON challenges;

-- 2. Drop trigger functions
DROP FUNCTION IF EXISTS process_club_confirmation() CASCADE;
DROP FUNCTION IF EXISTS process_spa_on_completion() CASCADE;
DROP FUNCTION IF EXISTS update_challenge_status() CASCADE;
DROP FUNCTION IF EXISTS notify_challenge_created() CASCADE;

-- 3. Drop challenge management functions
DROP FUNCTION IF EXISTS accept_open_challenge(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS admin_create_challenge CASCADE;
DROP FUNCTION IF EXISTS create_challenge_safe CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match_with_bonuses CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match_from_club_confirmation CASCADE;

-- 4. Drop SPA management functions  
DROP FUNCTION IF EXISTS update_spa_points CASCADE;
DROP FUNCTION IF EXISTS subtract_spa_points CASCADE;
DROP FUNCTION IF EXISTS transfer_spa_points CASCADE;
DROP FUNCTION IF EXISTS process_spa_transfer CASCADE;

-- 5. Drop notification functions
DROP FUNCTION IF EXISTS create_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS send_challenge_notification CASCADE;

-- 6. Drop utility functions
DROP FUNCTION IF EXISTS validate_challenge_spa_balance CASCADE;
DROP FUNCTION IF EXISTS calculate_challenge_spa CASCADE;
DROP FUNCTION IF EXISTS get_challenge_winner CASCADE;
```

---

## 📋 **PHASE 3: INTELLIGENT REBUILD STRATEGY**

### **Architecture Principles:**
1. **Single Responsibility** - Mỗi function có 1 nhiệm vụ cụ thể
2. **Event-Driven** - Triggers tự động xử lý workflows
3. **Atomic Operations** - Transactions đảm bảo data consistency
4. **Comprehensive Validation** - Validate ở mọi level
5. **Error Recovery** - Graceful error handling
6. **Performance Optimized** - Efficient queries và indexing

### **New Function Architecture:**

#### **1. Core Challenge Functions**
```sql
-- 1.1 Challenge Creation
CREATE FUNCTION create_challenge(
  p_challenger_id UUID,
  p_opponent_id UUID DEFAULT NULL,
  p_bet_points INTEGER DEFAULT 100,
  p_race_to INTEGER DEFAULT 8,
  p_club_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_scheduled_time TIMESTAMPTZ DEFAULT NULL,
  p_is_sabo BOOLEAN DEFAULT TRUE
) RETURNS JSONB;

-- 1.2 Challenge Acceptance (Open Challenges)
CREATE FUNCTION accept_open_challenge(
  p_challenge_id UUID,
  p_user_id UUID
) RETURNS JSONB;

-- 1.3 Challenge Status Updates
CREATE FUNCTION update_challenge_status(
  p_challenge_id UUID,
  p_new_status VARCHAR(20),
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB;

-- 1.4 Challenge Completion
CREATE FUNCTION complete_challenge(
  p_challenge_id UUID,
  p_challenger_score INTEGER,
  p_opponent_score INTEGER,
  p_completing_user_id UUID
) RETURNS JSONB;
```

#### **2. SPA Management Functions**
```sql
-- 2.1 SPA Balance Operations
CREATE FUNCTION update_spa_balance(
  p_user_id UUID,
  p_points_change INTEGER, -- Can be positive or negative
  p_transaction_type VARCHAR(50),
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL
) RETURNS JSONB;

-- 2.2 SPA Validation
CREATE FUNCTION validate_spa_requirement(
  p_user_id UUID,
  p_required_points INTEGER
) RETURNS JSONB;

-- 2.3 SPA Transfer Between Users
CREATE FUNCTION transfer_spa_points(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR(50),
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS JSONB;
```

#### **3. Match Management Functions**
```sql
-- 3.1 Match Creation
CREATE FUNCTION create_match_from_challenge(
  p_challenge_id UUID
) RETURNS JSONB;

-- 3.2 Match Completion
CREATE FUNCTION complete_match(
  p_match_id UUID,
  p_player1_score INTEGER,
  p_player2_score INTEGER
) RETURNS JSONB;
```

#### **4. Club Approval Functions**
```sql
-- 4.1 Club Approval Processing
CREATE FUNCTION process_club_approval(
  p_challenge_id UUID,
  p_club_admin_id UUID,
  p_approved BOOLEAN,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS JSONB;

-- 4.2 Auto Club Approval (for trusted scenarios)
CREATE FUNCTION auto_approve_challenge(
  p_challenge_id UUID,
  p_reason TEXT DEFAULT 'Automatic approval'
) RETURNS JSONB;
```

#### **5. Notification Functions**
```sql
-- 5.1 Universal Notification Creator
CREATE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(200),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_action_label VARCHAR(100) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS JSONB;

-- 5.2 Challenge-specific Notifications
CREATE FUNCTION notify_challenge_event(
  p_event_type VARCHAR(50),
  p_challenge_id UUID,
  p_additional_data JSONB DEFAULT NULL
) RETURNS VOID;
```

#### **6. Trigger Functions (Event-Driven)**
```sql
-- 6.1 Challenge Status Change Trigger
CREATE FUNCTION on_challenge_status_change() RETURNS TRIGGER;

-- 6.2 Club Approval Trigger  
CREATE FUNCTION on_club_approval() RETURNS TRIGGER;

-- 6.3 SPA Transaction Trigger
CREATE FUNCTION on_spa_transaction() RETURNS TRIGGER;

-- 6.4 Match Completion Trigger
CREATE FUNCTION on_match_completion() RETURNS TRIGGER;
```

---

## 📋 **PHASE 4: IMPLEMENTATION SEQUENCE**

### **Day 1: Cleanup & Foundation**
1. ✅ Backup existing functions
2. ✅ Drop all old functions and triggers
3. ✅ Create utility functions first
4. ✅ Create SPA management functions

### **Day 2: Core Challenge Functions**
1. ✅ Challenge creation function
2. ✅ Challenge acceptance function  
3. ✅ Challenge completion function
4. ✅ Challenge status management

### **Day 3: Match & Approval System**
1. ✅ Match management functions
2. ✅ Club approval functions
3. ✅ Notification system functions

### **Day 4: Triggers & Automation**
1. ✅ Create all trigger functions
2. ✅ Set up triggers on tables
3. ✅ Test trigger chains
4. ✅ Validate event-driven workflows

### **Day 5: Testing & Optimization**
1. ✅ Unit test each function
2. ✅ Integration test full workflows
3. ✅ Performance optimization
4. ✅ Error handling validation

---

## 📋 **PHASE 5: VALIDATION STRATEGY**

### **Test Scenarios:**
1. **Happy Path Testing**
   - Create challenge → Accept → Complete → Club approve → SPA transfer
   
2. **Edge Case Testing**  
   - Insufficient SPA balance
   - Expired challenges
   - Concurrent access
   - Invalid user permissions
   
3. **Error Recovery Testing**
   - Database transaction failures
   - Network interruptions
   - Invalid input data
   - System overload scenarios

4. **Performance Testing**
   - High concurrent challenge creation
   - Bulk SPA transactions
   - Real-time notification delivery
   - Database query optimization

### **Success Metrics:**
- ✅ All old functions successfully dropped
- ✅ New functions pass all test scenarios
- ✅ Performance meets requirements (< 500ms response)
- ✅ Zero data loss during transition
- ✅ All notifications working correctly
- ✅ SPA transfers 100% accurate

---

## 📋 **ROLLBACK PLAN**

### **Emergency Rollback Steps:**
1. **Immediate:** Restore from backup functions
2. **Data Recovery:** Restore any corrupted data from backup
3. **Function Restoration:** Deploy backed-up function definitions
4. **Trigger Restoration:** Recreate original triggers
5. **Validation:** Verify system functionality
6. **Communication:** Notify stakeholders of rollback

### **Risk Mitigation:**
- ✅ Complete backup before any changes
- ✅ Test in staging environment first
- ✅ Gradual deployment with feature flags
- ✅ Real-time monitoring during deployment
- ✅ Quick rollback procedures documented

---

*🎯 This plan ensures a systematic, safe, and intelligent rebuild of the entire Challenge System database layer.*
