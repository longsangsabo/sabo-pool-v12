# 🎯 SPA (SABO Points Arena) - Complete Ecosystem Documentation

## 📋 Overview

This is the comprehensive documentation for the complete SPA (SABO Points Arena) ecosystem in the SABO Pool V12 system. SPA points are the virtual currency that powers rewards, betting, milestones, and tournament participation across the entire platform.

---

## 🏗️ Core SPA System

### 📊 Database Tables
- **`spa_milestones`** - Milestone definitions with point rewards
- **`user_milestone_progress`** - User progress tracking
- **`spa_bonus_activities`** - Bonus activity definitions  
- **`spa_transactions`** - All SPA point transactions log

### 🎯 Milestone System
| Type | Description | Points Awarded |
|------|-------------|----------------|
| 🏆 **Tournament Win** | Win any tournament | 500 SPA |
| 🎮 **Challenge Win** | Win challenge matches | 300 SPA |
| 👥 **Social Engagement** | Community interaction | 200 SPA |
| 🎯 **Skill Development** | Improve ranking | 100 SPA |

### 🎁 Bonus Activities System
| Activity | Icon | Points | Description |
|----------|------|--------|-------------|
| **Daily Login** | 🎁 | +100 SPA | Login daily |
| **First Match** | 🎯 | +150 SPA | Play first match |
| **Tournament Entry** | 🏆 | +200 SPA | Join tournament |
| **Challenge Creation** | ⚔️ | +250 SPA | Create challenge |
| **Social Sharing** | 📱 | +300 SPA | Share achievements |
| **Profile Completion** | 👤 | +350 SPA | Complete profile |
| **Club Participation** | 🏢 | +400 SPA | Join club activities |
| **Achievement Unlock** | 💰 | +500 SPA | Major achievements |

---

## 🏆 Tournament Integration

### 💰 Tournament Rewards (by Rank)

The SPA reward system scales based on player rank and tournament position:

#### 🥇 Champion (1st Place)
- **K Rank**: 900 SPA
- **K+ Rank**: 950 SPA  
- **I Rank**: 1,000 SPA
- **I+ Rank**: 1,050 SPA
- **H Rank**: 1,100 SPA
- **H+ Rank**: 1,150 SPA
- **G Rank**: 1,200 SPA
- **G+ Rank**: 1,275 SPA
- **F Rank**: 1,350 SPA
- **F+ Rank**: 1,425 SPA
- **E Rank**: 1,500 SPA
- **E+ Rank**: 1,600 SPA

#### 🥈 Runner-up (2nd Place)
- **K Rank**: 700 SPA
- **K+ Rank**: 750 SPA
- **I Rank**: 800 SPA
- **I+ Rank**: 825 SPA
- **H Rank**: 850 SPA
- **H+ Rank**: 875 SPA
- **G Rank**: 900 SPA
- **G+ Rank**: 950 SPA
- **F Rank**: 1,000 SPA
- **F+ Rank**: 1,050 SPA
- **E Rank**: 1,100 SPA
- **E+ Rank**: 1,200 SPA

#### 🥉 Third Place
- **K Rank**: 500 SPA
- **K+ Rank**: 550 SPA
- **I Rank**: 600 SPA
- **I+ Rank**: 625 SPA
- **H Rank**: 650 SPA
- **H+ Rank**: 675 SPA
- **G Rank**: 700 SPA
- **G+ Rank**: 750 SPA
- **F Rank**: 800 SPA
- **F+ Rank**: 850 SPA
- **E Rank**: 900 SPA
- **E+ Rank**: 1,000 SPA

#### 🎯 Participation Rewards
All participants receive **100-130 SPA** based on rank (higher ranks get slight bonuses).

### 📋 Tournament Prize System
- Uses `calculateRewardsFromTiers()` function from database prize tiers
- Fallback to `calculateRewards()` for dynamic calculation
- Integrates with tournament prize pools and entry fees
- Located in: `src/utils/tournamentRewards.ts`

---

## ⚔️ Challenge System Integration

### 🎮 Challenge Betting System

**Challenge System Status**: ✅ **SPA POINTS BETTING SYSTEM**

The challenge system uses **SPA points for betting** (NOT ELO points):

#### 💰 SPA Betting Tiers
| SPA Bet Amount | Race To | Handicap 1.0 | Handicap 0.5 | Description |
|----------------|---------|--------------|--------------|-------------|
| 600 SPA | 22 | 3.5 | 2.5 | Thách đấu cao cấp - Race to 22 |
| 500 SPA | 18 | 3.0 | 2.0 | Thách đấu trung cao - Race to 18 |
| 400 SPA | 16 | 2.5 | 1.5 | Thách đấu trung cấp - Race to 16 |
| 300 SPA | 14 | 2.0 | 1.5 | Thách đấu trung bình - Race to 14 |
| 200 SPA | 12 | 1.5 | 1.0 | Thách đấu cơ bản - Race to 12 |
| 100 SPA | 8 | 1.0 | 0.5 | Thách đấu sơ cấp - Race to 8 |

### 🎯 Challenge Mechanics
- **Winner**: Receives the bet amount in SPA points
- **Loser**: Loses the bet amount from their SPA balance
- **ELO Points**: NOT affected by challenges (ELO only from tournaments)
- **Match Statistics**: Win/loss count updated, but no ELO changes

### 📊 Challenge Database Schema
- **`challenges`** table uses `bet_points` field (SPA points: 100, 200, 300, 400, 500, 600)
- **`challenge_results`** tracks SPA point exchanges
- **Fixed Migration**: `20250810120000_fix_challenge_spa_only.sql`
- **SPA Integration**: Complete with transaction logging

### � SPA Challenge Functions
```sql
-- Validate user has enough SPA for betting
SELECT validate_challenge_spa_balance(user_id, bet_amount);

-- Process challenge result with SPA exchange
SELECT process_challenge_result(challenge_id, winner_id, loser_id, winner_score, loser_score);

-- Calculate SPA point exchange
SELECT calculate_challenge_spa(winner_spa, loser_spa, bet_amount);
```

---

## 📱 Frontend Components

### 🎯 Core SPA Components
- **`SPADashboard`** - Main SPA dashboard
- **`SPAAdminPanel`** - Admin management interface
- **`SPAMilestones`** - Milestone progress display
- **`SPATransactions`** - Transaction history

### 🔧 Services & Hooks
- **`spaService.ts`** - Complete API service layer
- **`useSPA.ts`** - React hook for SPA operations
- **`useUserSPA.ts`** - User-specific SPA data

### 🎨 UI Integration
- SPA points displayed in player profiles (`ChallengeProfile` type)
- Tournament reward displays use SPA calculations
- Mobile-optimized SPA components
- Real-time SPA balance updates

---

## 🗄️ API Endpoints

### 🔌 SPA Service Methods
```typescript
// Core Operations
await spaService.getUserSPAPoints(userId)
await spaService.updateUserSPAPoints(userId, points, reason)
await spaService.awardBonusActivity(userId, activityType)

// Milestone System
await spaService.checkMilestoneProgress(userId, milestoneType)
await spaService.getUserMilestoneProgress(userId)

// Tournament Integration
await spaService.awardTournamentSPA(userId, position, rank)
```

### 📊 Database Functions
```sql
-- Reset all SPA points
SELECT reset_all_spa_points();

-- Award milestone completion
SELECT award_milestone_completion(user_id, milestone_type);

-- Process SPA transaction
SELECT process_spa_transaction(user_id, amount, transaction_type, reference_id);
```

---

## 🎮 Complete SPA Features

### ✅ Implemented Features
- [x] **SPA Point System** - Complete virtual currency system
- [x] **Milestone Tracking** - 4 milestone types with rewards
- [x] **Bonus Activities** - 8 bonus activity types
- [x] **Tournament Rewards** - Rank-based SPA rewards (ELO separate)
- [x] **Challenge Betting** - SPA points betting system (100-600 SPA)
- [x] **Transaction Logging** - Complete audit trail
- [x] **Admin Panel** - Full administrative control
- [x] **Mobile UI** - Responsive SPA interfaces
- [x] **Real-time Updates** - Live balance tracking

### ⚠️ System Separation
- [✅] **ELO System**: Tournament-only rewards, ranking system
- [✅] **SPA System**: Challenge betting, milestones, bonuses, tournament rewards

### 🔄 Future Enhancements
- [ ] **SPA Shop System** - Spend SPA on virtual items
- [ ] **SPA Leaderboards** - Monthly/weekly SPA rankings
- [ ] **SPA Transfer System** - P2P SPA point transfers
- [ ] **SPA Achievements** - Special SPA-based achievements

---

## 📈 SPA Economy Balance

### 💰 SPA Earning Sources
1. **Tournament Participation**: 100-1,600 SPA (rank-based)
2. **Milestone Completion**: 100-500 SPA per milestone
3. **Daily Activities**: 100-500 SPA per activity
4. **Challenge Wins**: Variable SPA (bet amount from opponent)
5. **Social Engagement**: 200 SPA (milestone-based)

### 💸 SPA Spending Opportunities
1. **Challenge Betting**: 100, 200, 300, 400, 500, 600 SPA per challenge bet
2. **Tournament entry fees**: (future feature)
3. **Virtual item purchases**: (future feature)

### ⚖️ Economic Balance
The system now has **active circulation** through challenge betting:
- **Earning**: Tournament rewards, milestones, activities
- **Spending**: Challenge bets (primary SPA sink)
- **Risk/Reward**: Players can win or lose SPA through strategic betting

**ELO vs SPA Separation**:
- **ELO**: Tournament-only rewards, skill ranking, no betting
- **SPA**: Challenge betting, activity rewards, virtual currency

---

## 🔧 Technical Implementation

### 📂 File Structure
```
src/
├── services/spaService.ts              # Complete SPA API
├── hooks/useSPA.ts                     # SPA React hooks
├── components/spa/                     # SPA UI components
├── utils/tournamentRewards.ts          # Tournament SPA integration
├── types/challenge.ts                  # Challenge types (with spa_points)
└── pages/spa/                          # SPA dashboard pages

supabase/migrations/
├── 20250809164048_spa_system_reset.sql     # Complete SPA database
└── 20250810120000_fix_challenge_spa_only.sql # Challenge SPA betting fix
```

### 🔗 Integration Points
1. **Tournament System** → SPA rewards via `tournamentRewards.ts` (ELO separate)
2. **Challenge System** → SPA betting system via `process_challenge_result()`
3. **User Profiles** → SPA balance display (separate from ELO)
4. **Season System** → SPA point tracking (ELO tracking separate)
5. **Club System** → SPA activity tracking

---

## 📚 Related Documentation

### 📖 Core Documentation
- **Current Documentation** - This comprehensive SPA ecosystem guide (this file)
- **[CHALLENGE_SYSTEM_README.md](./CHALLENGE_SYSTEM_README.md)** - Challenge system (ELO only)
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database structure

### 🎯 Specific Guides
- **[TOURNAMENT_TESTING_GUIDE.md](./TOURNAMENT_TESTING_GUIDE.md)** - Tournament component testing
- **[MOBILE_UI_STANDARDIZATION_REPORT.md](./MOBILE_UI_STANDARDIZATION_REPORT.md)** - Mobile SPA interfaces
- **[ELO_RESET_GUIDE.md](./ELO_RESET_GUIDE.md)** - ELO system (separate from SPA)

---

## 🚀 Getting Started

### 1. Database Setup
```bash
# Apply SPA migration
psql -f supabase/migrations/20250809164048_spa_system_reset.sql

# Verify SPA tables
SELECT * FROM spa_milestones;
SELECT * FROM spa_bonus_activities;
```

### 2. Frontend Usage
```typescript
import { useSPA } from '@/hooks/useSPA';

function SPAComponent() {
  const { userSPA, awardBonus, milestones } = useSPA();
  
  return (
    <div>
      <h2>SPA Balance: {userSPA.balance}</h2>
      <button onClick={() => awardBonus('daily_login')}>
        Daily Login (+100 SPA)
      </button>
    </div>
  );
}
```

### 3. API Integration
```typescript
import { spaService } from '@/services/spaService';

// Award tournament SPA
await spaService.awardTournamentSPA(userId, 1, 'G'); // 1st place, G rank

// Check milestone progress  
await spaService.checkMilestoneProgress(userId, 'tournament_win');
```

---

## 📊 Summary

The SPA ecosystem is **100% complete** with comprehensive tournament integration, challenge betting system, milestone tracking, and bonus activities. The system now has clear separation between ELO (tournament-only) and SPA (betting + rewards).

**Current State**:
- ✅ Complete SPA core system
- ✅ Tournament reward integration (SPA rewards, ELO separate)
- ✅ Challenge betting system (SPA points 100-600)
- ✅ Milestone and bonus systems
- ✅ Admin management tools
- ✅ ELO/SPA system separation clarified

**System Architecture**: 
- **ELO System**: Tournament-only rewards for skill ranking
- **SPA System**: Challenge betting, milestones, activities, tournament bonus rewards
- **Unified Integration**: Clear separation with dedicated functions and tables

**Economic Model**: Active SPA circulation through challenge betting creates engaging risk/reward gameplay while ELO remains a pure skill measurement system.

---

*This document serves as the **single source of truth** for all SPA-related features across the SABO Pool V12 platform.*
