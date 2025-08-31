# 🎯 SERVICE LAYER MIGRATION ROADMAP & CHECKLIST
**Mục tiêu**: Migrate 158 files từ direct supabase calls → Service Layer
**Timeline**: 3-4 tuần
**Validation**: Mỗi task có metrics cụ thể để verify

## 📊 BASELINE METRICS (Hiện Tại)
```bash
# Command để check progress
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
# Kết quả hiện tại: 158 files
```

---

## 🗓️ WEEK 1: AUTHENTICATION & USER MIGRATION

### Day 1-2: User Authentication Migration
**Target**: Migrate 25-30 auth-related files

#### Tasks:
- [ ] **1.1** Migrate `/utils/authHelpers.ts` → UserService
- [ ] **1.2** Migrate `/utils/authRecovery.ts` → UserService  
- [ ] **1.3** Migrate `/utils/authStateCleanup.ts` → UserService
- [ ] **1.4** Update components using auth utilities

#### Verification Commands:
```bash
# Check auth files still using supabase
find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*auth*.ts" | xargs grep -l "supabase\." | wc -l
# Target: 0 files

# Check components importing auth utilities
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*.tsx" | xargs grep -l "authHelpers\|authRecovery" | wc -l
# Track reduction
```

#### Success Criteria:
- [ ] All auth utilities migrated to UserService
- [ ] Components use UserService instead of direct calls
- [ ] Auth flow still works (manual test)
- [ ] No console errors on login/logout

### Day 3-4: User Profile & Settings Migration
**Target**: Migrate 20-25 profile-related files

#### Tasks:
- [ ] **1.5** Migrate profile management components
- [ ] **1.6** Migrate user settings components  
- [ ] **1.7** Update profile forms to use UserService
- [ ] **1.8** Migrate avatar upload functionality

#### Verification Commands:
```bash
# Check profile components using supabase
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*profile*" -o -name "*Profile*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files

# Check settings components
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*setting*" -o -name "*Setting*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files
```

#### Success Criteria:
- [ ] Profile view/edit works via UserService
- [ ] Settings save/load works via UserService
- [ ] Avatar upload works via UserService
- [ ] No direct supabase calls in profile components

### Day 5: Week 1 Validation
**Checkpoint**: Verify auth & user migration

#### Verification Commands:
```bash
# Overall progress check
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 130 files (down from 158)

# Auth-specific verification
find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*/auth*" -o -path "*user*" -o -path "*profile*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files
```

#### Week 1 Success Criteria:
- [ ] **Quantitative**: Reduced from 158 → ≤130 files with supabase calls
- [ ] **Qualitative**: All auth flows work through UserService
- [ ] **Functional**: Login, signup, profile edit, settings work

---

## 🗓️ WEEK 2: TOURNAMENT & PAYMENT MIGRATION

### Day 1-2: Tournament Core Migration
**Target**: Migrate 40-50 tournament-related files

#### Tasks:
- [ ] **2.1** Migrate `/utils/tournamentAdapter.ts` → TournamentService
- [ ] **2.2** Migrate `/utils/bracketAdvancement.ts` → TournamentService
- [ ] **2.3** Migrate `/utils/debugTournamentRefresh.ts` → TournamentService
- [ ] **2.4** Migrate tournament management components

#### Verification Commands:
```bash
# Check tournament utilities
find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*tournament*" -o -name "*bracket*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files

# Check tournament components
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*tournament*" -o -name "*Tournament*" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 5 files
```

#### Success Criteria:
- [ ] Tournament creation works via TournamentService
- [ ] Bracket generation works via TournamentService  
- [ ] Tournament listing works via TournamentService
- [ ] No direct supabase calls in tournament utilities

### Day 3-4: Payment & Wallet Migration
**Target**: Migrate 20-25 payment-related files

#### Tasks:
- [ ] **2.5** Migrate VNPAY integration to PaymentService
- [ ] **2.6** Migrate wallet components to PaymentService
- [ ] **2.7** Migrate transaction history to PaymentService
- [ ] **2.8** Update payment forms and flows

#### Verification Commands:
```bash
# Check payment/wallet components
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*payment*" -o -name "*wallet*" -o -name "*Wallet*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files

# Check VNPAY integration
grep -r "vnp_" /workspaces/sabo-pool-v12/apps/sabo-user/src/components | grep -v PaymentService | wc -l
# Target: 0 lines
```

#### Success Criteria:
- [ ] Payment processing works via PaymentService
- [ ] Wallet balance/history works via PaymentService
- [ ] VNPAY integration works via PaymentService
- [ ] Transaction tracking works via PaymentService

### Day 5: Week 2 Validation
**Checkpoint**: Verify tournament & payment migration

#### Verification Commands:
```bash
# Overall progress check
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 80 files (down from 130)

# Tournament/payment verification
find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*tournament*" -o -path "*payment*" -o -path "*wallet*" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 5 files
```

#### Week 2 Success Criteria:
- [ ] **Quantitative**: Reduced from ≤130 → ≤80 files with supabase calls
- [ ] **Qualitative**: Tournament & payment flows work through services
- [ ] **Functional**: Create tournament, join tournament, payments work

---

## 🗓️ WEEK 3: CLUB, CHALLENGE & RANKING MIGRATION

### Day 1-2: Club Management Migration
**Target**: Migrate 25-30 club-related files

#### Tasks:
- [ ] **3.1** Migrate club management components
- [ ] **3.2** Migrate club membership logic
- [ ] **3.3** Migrate club tournament components
- [ ] **3.4** Update club navigation and headers

#### Verification Commands:
```bash
# Check club components
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -path "*club*" -o -path "*Club*" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 3 files

# Check club pages
find /workspaces/sabo-pool-v12/apps/sabo-user/src/pages -path "*club*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files
```

#### Success Criteria:
- [ ] Club creation/edit works via ClubService
- [ ] Club membership works via ClubService
- [ ] Club tournaments work via ClubService
- [ ] Club settings work via ClubService

### Day 3-4: Challenge & Ranking Migration
**Target**: Migrate 20-25 challenge/ranking files

#### Tasks:
- [ ] **3.5** Migrate challenge components to ChallengeService
- [ ] **3.6** Migrate ranking components to RankingService  
- [ ] **3.7** Migrate SPA points to SPAService
- [ ] **3.8** Migrate ELO calculations to ELORatingService

#### Verification Commands:
```bash
# Check challenge components
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*challenge*" -o -name "*Challenge*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files

# Check ranking components  
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*ranking*" -o -name "*Ranking*" | xargs grep -l "supabase\." | wc -l
# Target: 0 files
```

#### Success Criteria:
- [ ] Challenge creation/response works via ChallengeService
- [ ] Ranking updates work via RankingService
- [ ] SPA points calculation works via SPAService
- [ ] ELO rating updates work via ELORatingService

### Day 5: Week 3 Validation
**Checkpoint**: Verify club, challenge & ranking migration

#### Verification Commands:
```bash
# Overall progress check
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 30 files (down from 80)

# Feature-specific verification
find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*club*" -o -path "*challenge*" -o -path "*ranking*" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 5 files
```

#### Week 3 Success Criteria:
- [ ] **Quantitative**: Reduced from ≤80 → ≤30 files with supabase calls
- [ ] **Qualitative**: Club, challenge, ranking work through services
- [ ] **Functional**: All major features work via services

---

## 🗓️ WEEK 4: FINAL CLEANUP & MOBILE PREPARATION

### Day 1-3: Remaining Components Migration
**Target**: Migrate final 20-30 files

#### Tasks:
- [ ] **4.1** Migrate remaining utility files
- [ ] **4.2** Migrate notification components  
- [ ] **4.3** Migrate analytics components
- [ ] **4.4** Clean up imports and unused code

#### Verification Commands:
```bash
# Check remaining files
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
# Target: ≤ 5 files

# Check utils directory specifically
find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*.ts" | xargs grep -l "supabase\." | wc -l
# Target: 0 files
```

#### Success Criteria:
- [ ] All utility files migrated to appropriate services
- [ ] All components use services instead of direct calls
- [ ] Clean import statements (no unused imports)
- [ ] No eslint errors related to services

### Day 4-5: Mobile Integration Preparation
**Target**: Prepare services for mobile consumption

#### Tasks:
- [ ] **4.5** Add mobile export patterns to services
- [ ] **4.6** Optimize service APIs for mobile
- [ ] **4.7** Add offline support hooks
- [ ] **4.8** Create mobile service configuration

#### Verification Commands:
```bash
# Verify mobile exports
find /workspaces/sabo-pool-v12/packages/shared-business/src -name "index.ts" | xargs grep -c "export.*Service"
# Target: ≥ 8 service exports

# Check mobile-specific exports
ls -la /workspaces/sabo-pool-v12/packages/shared-business/src/mobile/
# Should have: OfflineDataService, NotificationService, WebSocketService
```

#### Success Criteria:
- [ ] All services properly exported from shared-business
- [ ] Mobile services ready for consumption
- [ ] Service APIs optimized for mobile patterns
- [ ] Documentation updated for mobile usage

---

## 🏁 FINAL VALIDATION CHECKLIST

### Quantitative Metrics:
```bash
# MUST BE ZERO at the end
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
# Target: 0 files

# Service count verification
find /workspaces/sabo-pool-v12/packages/shared-business/src -name "*Service.ts" | wc -l
# Target: ≥ 8 services

# Component verification (should import services, not supabase)
find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*.tsx" | xargs grep -l "from.*shared-business" | wc -l
# Target: ≥ 50 components
```

### Functional Testing Checklist:
- [ ] **Authentication**: Login, signup, logout work
- [ ] **User Management**: Profile edit, settings work  
- [ ] **Tournaments**: Create, join, manage tournaments work
- [ ] **Payments**: VNPAY, wallet, transactions work
- [ ] **Clubs**: Create, join, manage clubs work
- [ ] **Challenges**: Create, accept, complete challenges work
- [ ] **Rankings**: ELO updates, SPA points work
- [ ] **Real-time**: Live updates still work
- [ ] **Mobile Ready**: Services can be imported in mobile app

### Technical Validation:
- [ ] **No eslint errors** related to missing services
- [ ] **No console errors** in browser
- [ ] **No broken imports** in any components
- [ ] **All services properly typed** with TypeScript
- [ ] **Services follow consistent patterns**

---

## 📈 PROGRESS TRACKING DASHBOARD

### Daily Progress Commands:
```bash
# Overall progress
echo "Files with supabase calls: $(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)"

# By category  
echo "Auth files: $(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*auth*" -o -path "*user*" | xargs grep -l "supabase\." | wc -l)"
echo "Tournament files: $(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*tournament*" | xargs grep -l "supabase\." | wc -l)"
echo "Payment files: $(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*payment*" -o -path "*wallet*" | xargs grep -l "supabase\." | wc -l)"
echo "Club files: $(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*club*" | xargs grep -l "supabase\." | wc -l)"

# Service count
echo "Created services: $(find /workspaces/sabo-pool-v12/packages/shared-business/src -name "*Service.ts" | wc -l)"
```

### Weekly Milestones:
- **Week 1**: 158 → ≤130 files (≥18% reduction)
- **Week 2**: ≤130 → ≤80 files (≥38% additional reduction)  
- **Week 3**: ≤80 → ≤30 files (≥63% additional reduction)
- **Week 4**: ≤30 → 0 files (100% completion)

---

## 🎯 SUCCESS DEFINITION

**ONLY call this migration successful when:**
1. **ZERO files** contain direct supabase calls
2. **ALL components** use services instead of direct DB access
3. **ALL features** work through service layer
4. **MOBILE CONSUMPTION** is ready (services can be imported)
5. **NO REGRESSION** in functionality

**Verification Command (MUST BE ZERO):**
```bash
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
```

Mỗi ngày tôi sẽ chạy commands này để track progress và không được báo cáo hoàn thành trước khi verification commands cho ra kết quả mong muốn! 🎯
