# 🔍 WEEKLY VALIDATION CHECKLISTS

## Week 1 Validation Checklist: AUTH & USER MIGRATION

### Quantitative Verification
```bash
# MUST pass these checks before claiming Week 1 complete:

# 1. Overall reduction check
total_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)
echo "Total files with supabase: $total_files (must be ≤130)"

# 2. Auth files check
auth_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*auth*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Auth utils with supabase: $auth_files (must be 0)"

# 3. User profile files check  
profile_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -path "*profile*" -o -path "*Profile*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Profile components with supabase: $profile_files (must be 0)"
```

### Functional Testing Checklist
- [ ] **Login Flow**: Can login with email/password
- [ ] **Signup Flow**: Can create new account  
- [ ] **Logout Flow**: Can logout and session cleared
- [ ] **Profile View**: Can view user profile via UserService
- [ ] **Profile Edit**: Can edit profile via UserService
- [ ] **Settings**: Can save/load settings via UserService
- [ ] **Avatar Upload**: Can upload avatar via UserService
- [ ] **Auth State**: Auth state persists across refreshes

### Technical Verification
- [ ] **No Auth Utils Import**: Components don't import authHelpers directly
- [ ] **UserService Import**: Components import from shared-business
- [ ] **No Console Errors**: No errors in browser console during auth flows
- [ ] **TypeScript**: No TS errors in migrated components

---

## Week 2 Validation Checklist: TOURNAMENT & PAYMENT MIGRATION

### Quantitative Verification
```bash
# MUST pass these checks before claiming Week 2 complete:

# 1. Overall reduction check
total_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)
echo "Total files with supabase: $total_files (must be ≤80)"

# 2. Tournament files check
tournament_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*tournament*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Tournament utils with supabase: $tournament_files (must be 0)"

# 3. Payment files check
payment_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -path "*payment*" -o -path "*wallet*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Payment components with supabase: $payment_files (must be 0)"
```

### Functional Testing Checklist
- [ ] **Tournament Creation**: Can create tournament via TournamentService
- [ ] **Tournament Join**: Can join tournament via TournamentService
- [ ] **Bracket Generation**: Brackets generate via TournamentService
- [ ] **Tournament Listing**: Can list tournaments via TournamentService
- [ ] **Payment Processing**: VNPAY works via PaymentService
- [ ] **Wallet Balance**: Can view balance via PaymentService
- [ ] **Transaction History**: Can view history via PaymentService
- [ ] **Wallet Top-up**: Can add funds via PaymentService

### Technical Verification
- [ ] **No Tournament Utils Import**: Components don't import tournament utils directly
- [ ] **Service Imports**: Components import Tournament/PaymentService from shared-business
- [ ] **VNPAY Integration**: VNPAY calls go through PaymentService
- [ ] **No Console Errors**: No errors during tournament/payment flows

---

## Week 3 Validation Checklist: CLUB, CHALLENGE & RANKING MIGRATION

### Quantitative Verification
```bash
# MUST pass these checks before claiming Week 3 complete:

# 1. Overall reduction check
total_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)
echo "Total files with supabase: $total_files (must be ≤30)"

# 2. Club files check
club_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*club*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Club files with supabase: $club_files (must be ≤2)"

# 3. Challenge files check
challenge_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*challenge*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Challenge files with supabase: $challenge_files (must be 0)"
```

### Functional Testing Checklist
- [ ] **Club Creation**: Can create club via ClubService
- [ ] **Club Join**: Can join club via ClubService
- [ ] **Club Management**: Can manage club via ClubService
- [ ] **Club Tournaments**: Club tournaments work via ClubService
- [ ] **Challenge Creation**: Can create challenge via ChallengeService
- [ ] **Challenge Accept**: Can accept challenge via ChallengeService
- [ ] **Ranking Updates**: Rankings update via RankingService
- [ ] **ELO Calculation**: ELO updates via ELORatingService
- [ ] **SPA Points**: SPA points work via SPAService

### Technical Verification
- [ ] **Service Imports**: Components import Club/Challenge/RankingService
- [ ] **No Direct DB**: No direct supabase calls in club/challenge components
- [ ] **ELO Integration**: ELO calculations go through ELORatingService
- [ ] **SPA Integration**: SPA points go through SPAService

---

## Week 4 Validation Checklist: FINAL CLEANUP & MOBILE READY

### Quantitative Verification (MUST BE ZERO!)
```bash
# THE ULTIMATE VALIDATION - MUST BE ZERO:
total_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)
echo "Files with supabase calls: $total_files (MUST BE 0)"

# Additional checks:
utils_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*.ts" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Utils with supabase: $utils_files (MUST BE 0)"

components_with_services=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*.tsx" | xargs grep -l "from.*shared-business" 2>/dev/null | wc -l)
echo "Components using services: $components_with_services (should be ≥50)"

service_count=$(find /workspaces/sabo-pool-v12/packages/shared-business/src -name "*Service.ts" | wc -l)
echo "Total services: $service_count (should be ≥8)"
```

### Functional Testing Checklist (ALL FEATURES)
- [ ] **Authentication**: Login, signup, logout, profile, settings
- [ ] **Tournaments**: Create, join, manage, brackets, results
- [ ] **Payments**: VNPAY, wallet, transactions, top-up
- [ ] **Clubs**: Create, join, manage, club tournaments
- [ ] **Challenges**: Create, accept, complete, ELO updates
- [ ] **Rankings**: View rankings, SPA points, ELO ratings
- [ ] **Real-time**: Live updates, notifications
- [ ] **Navigation**: All pages load without errors

### Mobile Readiness Checklist
- [ ] **Service Exports**: All services exported from shared-business
- [ ] **Mobile Services**: OfflineDataService, NotificationService, WebSocketService ready
- [ ] **TypeScript**: All services properly typed
- [ ] **API Consistency**: Consistent patterns across all services
- [ ] **Error Handling**: Proper error handling in all services
- [ ] **Documentation**: Service APIs documented

### Technical Verification (ZERO TOLERANCE)
- [ ] **No ESLint Errors**: Zero linting errors related to services
- [ ] **No Console Errors**: Zero console errors in browser
- [ ] **No TypeScript Errors**: Zero TS compilation errors
- [ ] **No Broken Imports**: All imports resolve correctly
- [ ] **No Dead Code**: No unused imports or variables

---

## DAILY VALIDATION COMMAND

Run this command daily to track progress:
```bash
./scripts/daily-migration-progress.sh
```

## FINAL SUCCESS CRITERIA

**The migration is ONLY successful when ALL of these are true:**

1. **Zero Direct Calls**:
   ```bash
   find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l
   # MUST return 0
   ```

2. **All Features Work**: Manual testing passes for all major features

3. **Mobile Ready**: Services can be imported and used in mobile app

4. **Clean Code**: No errors, warnings, or dead code

**DO NOT claim completion until these criteria are 100% met! 🎯**
