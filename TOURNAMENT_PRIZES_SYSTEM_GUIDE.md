# Tournament Prizes System - Database Implementation Guide

## ✅ Completed Setup

### 1. Database Schema
- ✅ **Table Created**: `tournament_prizes` with all columns and constraints
- ✅ **Indexes**: Optimized for performance queries
- ✅ **Functions**: Helper functions for calculations and data retrieval
- ✅ **Views**: `tournament_prizes_with_details` for joined queries
- ✅ **RLS Policies**: Row Level Security for data protection
- ✅ **Triggers**: Auto-update timestamps

### 2. TypeScript Integration
- ✅ **Service Layer**: `TournamentPrizesService` with full CRUD operations
- ✅ **React Component**: `TournamentPrizesManager` for UI management
- ✅ **Type Definitions**: Complete TypeScript types and interfaces
- ✅ **Form Integration**: Updated `EnhancedTournamentForm` to use new system

---

## 🚀 How to Use

### For Existing Tournaments (Edit Mode)
When editing an existing tournament, the form will automatically show the **`TournamentPrizesManager`** component which:
- Loads existing prizes from the database
- Allows adding/editing/deleting individual prizes  
- Provides prize templates (Standard, Winner-takes-all, Top-heavy, Distributed)
- Real-time calculation of total prize pool

### For New Tournaments (Create Mode) 
When creating a new tournament, it falls back to the legacy **`OptimizedRewardsSection`** until the tournament is saved and has an ID.

---

## 🛠 Technical Implementation

### Database Functions Available
```sql
-- Get tournament prizes (optimized)
SELECT * FROM get_tournament_prizes('tournament-id-here');

-- Calculate total prize money
SELECT calculate_tournament_total_prizes('tournament-id-here');

-- Query with tournament details
SELECT * FROM tournament_prizes_with_details 
WHERE tournament_id = 'tournament-id-here';
```

### Service Layer Usage
```typescript
import { TournamentPrizesService } from '@/services/tournament-prizes.service';

// Get all prizes for a tournament
const prizes = await TournamentPrizesService.getTournamentPrizes(tournamentId);

// Create a new prize
const newPrize = await TournamentPrizesService.createTournamentPrize({
  tournament_id: tournamentId,
  prize_position: 1,
  position_name: 'Vô địch',
  cash_amount: 5000000,
  elo_points: 100,
  spa_points: 1000,
  physical_items: ['Cúp vàng', 'Giấy chứng nhận'],
  color_theme: 'gold'
});

// Use templates
const template = TournamentPrizesService.createDefaultPrizeTemplate(
  tournamentId, 
  'standard',  // or 'winner-takes-all', 'top-heavy', 'distributed'
  10000000     // total prize pool in VND
);
```

### React Component Usage
```tsx
import { TournamentPrizesManager } from '@/components/tournament/TournamentPrizesManager';

<TournamentPrizesManager
  tournamentId={tournamentId}
  initialPrizePool={tournament?.prize_pool || 0}
  onPrizesChange={(prizes) => {
    console.log('Prizes updated:', prizes);
  }}
/>
```

---

## 📊 Prize Templates (Using Proven Logic)

**🔥 All templates now use the existing proven tournament reward logic from `tournamentRewards.ts`**

### 1. Tiêu chuẩn - 16 vị trí + giải tham gia
- **16 ranking positions**: 1st, 2nd, 3rd, 4th, 5th-6th (x2), 7th-8th (x2), 9th-12th (x4), 13th-16th (x4)
- **1 participation reward**: For players who don't make top 16 (position 99)
- **Cash Distribution**: 40% + 24% + 16% + 8% + 4%+4% + 2%+2% + 1.125%(x4) + 0.5625%(x4) + 0% (participation)
- **ELO Points**: 100, 75, 50, 40, 30(x2), 25(x2), 20(x4), 15(x4), 1 (participation)
- **SPA Points**: Calculated based on player rank (K=900/700/500/350..., I=1000/800/600/400..., etc.)

### 2. Winner Takes All (100% cho vô địch)  
- **Same 16 positions + participation** but only 1st place gets cash
- **ELO/SPA points**: Same distribution as standard (proven logic maintained)
- **Cash**: 100% to winner, 0% to others

### 3. Top Heavy (60-30-10% cho top 3)
- **Same 16 positions + participation** but cash concentrated on top 3
- **Cash Distribution**: 60% + 30% + 10% + 0% for others
- **ELO/SPA points**: Same as standard (maintains competitive integrity)

### 4. Phân phối đầy đủ (16 vị trí có tiền)
- **Identical to Standard**: Uses the proven distribution formula
- **All 16 ranking positions receive cash** according to the tested percentages
- **Participation reward**: ELO/SPA only, no cash
- **Best for maximum participation incentive**

---

## 🔄 Migration Strategy

### Phase 1: Parallel System ✅ (COMPLETED)
- Old JSON rewards system still works for new tournaments
- New table system available for existing tournaments
- Gradual rollout without breaking changes

### Phase 2: Full Migration (Next Steps)
1. **Data Migration Script**: Move existing JSON rewards to new table
2. **Remove Legacy Code**: Remove OptimizedRewardsSection dependency
3. **Update All Forms**: Use TournamentPrizesManager everywhere

---

## 🔧 Next Development Steps

1. **Test the System**:
   - Create a tournament and verify prizes manager appears
   - Test all CRUD operations
   - Verify templates work correctly

2. **Data Migration** (if needed):
   - Write script to migrate existing JSON rewards to new table
   - Test with a few tournaments first

3. **Enhanced Features**:
   - Prize distribution automation
   - Prize payout tracking
   - Integration with payment system

---

## 🎯 Benefits of New System

### ✅ Advantages
- **Separate Concerns**: Prizes have their own table and management
- **Scalability**: Can handle complex prize structures
- **Performance**: Optimized queries with proper indexes
- **Flexibility**: Easy to add new prize fields or conditions
- **Data Integrity**: Foreign key constraints and validation
- **Real-time Updates**: Live prize calculation and totals

### 📈 Advanced Features Available
- **Prize Templates**: Quick setup for common formats
- **Visual Theming**: Color-coded prize categories
- **Physical Items**: Track non-cash rewards
- **Conditional Prizes**: Special requirements or conditions
- **Display Control**: Hide/show prizes, custom ordering
- **Audit Trail**: Created/updated tracking

---

## 🐛 Troubleshooting

### Common Issues
1. **Foreign Key Error**: Make sure tournament exists before creating prizes
2. **Reserved Keyword**: Database uses `prize_position` not `position`
3. **Permission Error**: Check RLS policies are correctly applied
4. **TypeScript Errors**: Ensure all imports point to correct service files

### Support
- Check browser console for detailed error messages
- Review database logs in Supabase dashboard
- Verify service layer functions return expected data types

---

**Status**: ✅ **READY TO USE** - Database schema created, services implemented, UI components integrated!
