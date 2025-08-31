# 📊 **COMPREHENSIVE BUSINESS LOGIC INVENTORY & MODIFICATION GUIDE**
## **SABO Pool Arena V12 - Toàn Bộ Business Logic & Cách Thay Đổi**

---

## 🎯 **TỔNG QUAN CÁC BUSINESS LOGIC HIỆN TẠI**

### **📍 VỊ TRÍ CÁC SERVICES:**

```
packages/shared-business/src/
├── tournament/              # Tournament Logic
│   ├── tournament-core-logic.ts
│   ├── tournament-service.ts
│   ├── registration-service.ts
│   ├── bracket-service.ts
│   └── participant-service.ts
├── ranking/                 # ELO & Ranking
│   ├── elo-calculation-service.ts
│   ├── SPAPointsService.ts
│   └── ranking-types.ts
├── validation/              # Business Validation
│   └── business-validation-service.ts
├── rewards/                 # Rewards & Prizes
│   └── rewards-calculation-service.ts
└── index.ts                 # Export tập trung
```

---

## 💰 **REWARDS & PRIZES BUSINESS LOGIC**

### **🏆 ELO REWARDS (Base Values):**
**File:** `packages/shared-business/src/rewards/rewards-calculation-service.ts` (Lines 108-119)

```typescript
BASE_ELO_REWARDS: Record<TournamentPosition, number> = {
  CHAMPION: 200,      // Vô địch
  RUNNER_UP: 150,     // Á quân  
  THIRD_PLACE: 100,   // Hạng 3
  FOURTH_PLACE: 75,   // Hạng 4
  TOP_8: 50,          // Top 8
  TOP_16: 30,         // Top 16
  PARTICIPATION: 25,  // Tham gia
}
```

### **💎 SPA REWARDS (Base Values):**
**File:** `packages/shared-business/src/rewards/rewards-calculation-service.ts` (Lines 121-132)

```typescript
BASE_SPA_REWARDS: Record<TournamentPosition, number> = {
  CHAMPION: 900,      // Vô địch
  RUNNER_UP: 700,     // Á quân
  THIRD_PLACE: 500,   // Hạng 3
  FOURTH_PLACE: 350,  // Hạng 4
  TOP_8: 120,         // Top 8
  TOP_16: 80,         // Top 16
  PARTICIPATION: 100, // Tham gia
}
```

### **⚖️ RANK MULTIPLIERS:**
**File:** `packages/shared-business/src/rewards/rewards-calculation-service.ts` (Lines 134-149)

```typescript
RANK_MULTIPLIERS: Record<RankCode, RankMultipliers> = {
  K:   { elo_multiplier: 1.0,  spa_multiplier: 1.0  },
  'K+': { elo_multiplier: 1.05, spa_multiplier: 1.06 },
  I:   { elo_multiplier: 0.9,  spa_multiplier: 1.11 },
  'I+': { elo_multiplier: 0.95, spa_multiplier: 1.17 },
  H:   { elo_multiplier: 0.8,  spa_multiplier: 1.22 },
  'H+': { elo_multiplier: 0.85, spa_multiplier: 1.28 },
  G:   { elo_multiplier: 0.7,  spa_multiplier: 1.33 },
  'G+': { elo_multiplier: 0.75, spa_multiplier: 1.42 },
  F:   { elo_multiplier: 0.6,  spa_multiplier: 1.5  },
  'F+': { elo_multiplier: 0.65, spa_multiplier: 1.58 },
  E:   { elo_multiplier: 0.5,  spa_multiplier: 1.67 },
  'E+': { elo_multiplier: 0.55, spa_multiplier: 1.78 },
}
```

### **💵 PRIZE DISTRIBUTION:**
**File:** `packages/shared-business/src/rewards/rewards-calculation-service.ts` (Lines 152-159)

```typescript
PRIZE_DISTRIBUTION: Record<string, number> = {
  champion: 0.50,      // 50% cho vô địch
  runner_up: 0.30,     // 30% cho á quân
  third_place: 0.15,   // 15% cho hạng 3
  fourth_place: 0.05,  // 5% cho hạng 4
  organization_fee: 0.00, // 0% phí tổ chức
}
```

---

## 📊 **ELO RATING BUSINESS LOGIC**

### **🎖️ RANK THRESHOLDS:**
**File:** `packages/shared-utils/src/elo-constants.ts` (Lines 3-16)

```typescript
RANK_ELO = {
  K: 1000,     // Rank K
  'K+': 1100,  // Rank K+
  I: 1200,     // Rank I
  'I+': 1300,  // Rank I+
  H: 1400,     // Rank H
  'H+': 1500,  // Rank H+
  G: 1600,     // Rank G
  'G+': 1700,  // Rank G+
  F: 1800,     // Rank F
  'F+': 1900,  // Rank F+
  E: 2000,     // Rank E
  'E+': 2100,  // Rank E+
}
```

### **🏅 TOURNAMENT ELO REWARDS:**
**File:** `packages/shared-utils/src/elo-constants.ts` (Lines 18-26)

```typescript
TOURNAMENT_ELO_REWARDS = {
  CHAMPION: 100,     // Vô địch
  RUNNER_UP: 50,     // Á quân
  THIRD_PLACE: 25,   // Hạng 3
  FOURTH_PLACE: 12,  // Hạng 4
  TOP_8: 6,          // Top 8
  TOP_16: 3,         // Top 16
  PARTICIPATION: 1,  // Tham gia
}
```

---

## 💎 **SPA POINTS BUSINESS LOGIC**

### **🏆 SPA TOURNAMENT REWARDS BY RANK:**
**File:** `packages/shared-utils/src/elo-constants.ts` (Lines 29-122)

```typescript
SPA_TOURNAMENT_REWARDS = {
  'E+': {
    CHAMPION: 1600,      RUNNER_UP: 1200,
    THIRD_PLACE: 1000,   FOURTH_PLACE: 700,
    TOP_8: 350,          PARTICIPATION: 130,
  },
  E: {
    CHAMPION: 1500,      RUNNER_UP: 1100,
    THIRD_PLACE: 900,    FOURTH_PLACE: 650,
    TOP_8: 320,          PARTICIPATION: 120,
  },
  // ... continuing for all ranks down to K
}
```

### **⚡ SPA TOURNAMENT STRUCTURE REWARDS:**
**File:** `packages/shared-business/src/ranking/SPAPointsService.ts` (Lines 43-84)

```typescript
tournamentPrizeStructure = {
  DE16: {
    1: 2000,  // Champion
    2: 1200,  // Runner-up  
    3: 800,   // Semi-finalist
    5: 400,   // Quarter-finalist
    9: 200,   // Round of 16
  },
  DE8: {
    1: 1000,  // Champion
    2: 600,   // Runner-up
    3: 400,   // Semi-finalist
    5: 200,   // Quarter-finalist
  },
  SE16: {
    1: 1500,  // Champion
    2: 900,   // Runner-up
    3: 600,   // Third place
    5: 300,   // Top 8
    9: 150,   // Top 16
  },
}
```

---

## 🏛️ **TOURNAMENT BUSINESS LOGIC**

### **⚙️ TOURNAMENT CONFIGURATION:**
**File:** `packages/shared-business/src/index.ts` (Lines 282-290)

```typescript
TOURNAMENT: {
  MIN_PARTICIPANTS: 4,
  MAX_PARTICIPANTS: 256,
  REGISTRATION_DEADLINE_HOURS: 24,
  PAYMENT_DEADLINE_HOURS: 2,
  DEFAULT_ENTRY_FEE: 50000, // VND
  SUPPORTED_FORMATS: ['DE8', 'DE16', 'SE8', 'SE16', 'ROUND_ROBIN'],
}
```

### **🏁 ELO SYSTEM CONFIGURATION:**
**File:** `packages/shared-business/src/index.ts` (Lines 292-300)

```typescript
ELO: {
  STARTING_RATING: 1000,
  MIN_RATING: 800,
  MAX_RATING: 3000,
  PROVISIONAL_GAMES: 10,
  DECAY_THRESHOLD_DAYS: 90,
  DECAY_AMOUNT: 50,
}
```

### **💰 SPA POINTS CONFIGURATION:**
**File:** `packages/shared-business/src/index.ts` (Lines 302-310)

```typescript
SPA_POINTS: {
  BASE_MATCH_POINTS: 10,
  WIN_MULTIPLIER: 1.5,
  TOURNAMENT_MULTIPLIER: 2.0,
  CHALLENGE_MULTIPLIER: 1.25,
  DECAY_PERCENTAGE_SEASON: 0.1,
}
```

---

## 🗃️ **DATABASE BUSINESS LOGIC**

### **💾 DEFAULT SPA POINTS (Database):**
**File:** `supabase/migrations/20250718073715-*.sql` (Lines 1-20)

```sql
spa_points_config JSONB DEFAULT '{
  "1": 1000, "2": 700, "3": 500, "4": 400, 
  "5": 300, "6": 300, "7": 300, "8": 300,
  "9": 200, "10": 200, "11": 200, "12": 200,
  "default": 100
}'
```

### **🏅 DEFAULT ELO POINTS (Database):**
**File:** `supabase/migrations/20250718073715-*.sql` (Lines 15-25)

```sql
elo_points_config JSONB DEFAULT '{
  "1": 100, "2": 50, "3": 25, "4": 12,
  "5": 6, "6": 6, "7": 6, "8": 6,
  "default": 1
}'
```

---

## 🔧 **CÁCH THAY ĐỔI BUSINESS LOGIC**

### **1. 🏆 THAY ĐỔI ELO REWARDS:**

#### **Bước 1: Cập nhật Constants**
```bash
# File: packages/shared-business/src/rewards/rewards-calculation-service.ts
# Line: 108-119
```

#### **Bước 2: Cập nhật Utility Constants**
```bash
# File: packages/shared-utils/src/elo-constants.ts
# Line: 18-26
```

#### **Bước 3: Cập nhật User App**
```bash
# File: apps/sabo-user/src/utils/eloConstants.ts
# Line: 18-26
```

### **2. 💎 THAY ĐỔI SPA REWARDS:**

#### **Bước 1: Cập nhật Base Rewards**
```bash
# File: packages/shared-business/src/rewards/rewards-calculation-service.ts
# Line: 121-132
```

#### **Bước 2: Cập nhật Rank-based Rewards**
```bash
# File: packages/shared-utils/src/elo-constants.ts
# Line: 29-122
```

#### **Bước 3: Cập nhật Tournament Structure**
```bash
# File: packages/shared-business/src/ranking/SPAPointsService.ts
# Line: 43-84
```

### **3. ⚖️ THAY ĐỔI RANK MULTIPLIERS:**

#### **File duy nhất cần sửa:**
```bash
# File: packages/shared-business/src/rewards/rewards-calculation-service.ts
# Line: 134-149
```

### **4. 💵 THAY ĐỔI PRIZE DISTRIBUTION:**

#### **File duy nhất cần sửa:**
```bash
# File: packages/shared-business/src/rewards/rewards-calculation-service.ts
# Line: 152-159
```

### **5. 🎖️ THAY ĐỔI RANK THRESHOLDS:**

#### **Bước 1: Cập nhật Main Constants**
```bash
# File: packages/shared-utils/src/elo-constants.ts
# Line: 3-16
```

#### **Bước 2: Cập nhật User App**
```bash
# File: apps/sabo-user/src/utils/eloConstants.ts
# Line: 3-16
```

### **6. ⚙️ THAY ĐỔI TOURNAMENT CONFIG:**

#### **File duy nhất cần sửa:**
```bash
# File: packages/shared-business/src/index.ts
# Line: 282-310
```

### **7. 🗃️ THAY ĐỔI DATABASE DEFAULTS:**

#### **Tạo migration mới:**
```sql
-- Tạo file migration mới trong supabase/migrations/
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS spa_points_config JSONB DEFAULT '{
  "1": [GIÁ_TRỊ_MỚI], "2": [GIÁ_TRỊ_MỚI], ...
}';
```

---

## 🚨 **ĐIỂM CẦN CHÚ Ý KHI THAY ĐỔI**

### **❌ THÔNG TIN KHÔNG CHÍNH XÁC CÓ THỂ GẶP:**

1. **Duplicated Constants:** Một số constants được định nghĩa ở nhiều nơi
2. **Inconsistent Values:** Giá trị khác nhau giữa các files
3. **Database vs Code:** Database defaults khác với code constants
4. **Legacy Values:** Một số giá trị cũ chưa được update

### **✅ QUY TRÌNH THAY ĐỔI AN TOÀN:**

1. **Identify All Files:** Tìm tất cả files chứa giá trị cần đổi
2. **Update Consistently:** Thay đổi tất cả files cùng lúc
3. **Test Thoroughly:** Test toàn bộ flow reward calculation
4. **Update Database:** Tạo migration cho database defaults
5. **Verify Integration:** Kiểm tra frontend/backend nhận giá trị đúng

### **🔍 COMMANDS ĐỂ TÌM DUPLICATES:**

```bash
# Tìm tất cả ELO rewards
grep -r "CHAMPION.*100\|RUNNER_UP.*50" packages/ apps/

# Tìm tất cả SPA rewards  
grep -r "CHAMPION.*900\|CHAMPION.*1500" packages/ apps/

# Tìm rank thresholds
grep -r "K.*1000\|I.*1200" packages/ apps/
```

---

## 🎯 **RECOMMENDATION**

**Để thay đổi business logic an toàn:**

1. **Tạo backup** toàn bộ các constants hiện tại
2. **Update tất cả files** cùng lúc để tránh inconsistency
3. **Test integration** giữa các services
4. **Tạo migration** cho database
5. **Document changes** để team biết

**Bạn muốn thay đổi business logic nào cụ thể?** Tôi sẽ hướng dẫn chi tiết!
