# 📚 SABO Pool V12 - Shared Business Logic Reference Guide
**Comprehensive Developer Reference for Consolidated Business Logic Services**

---

## 📋 Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Installation & Setup](#installation--setup)
3. [Phase 2: HIGH PRIORITY Systems](#phase-2-high-priority-systems)
4. [Phase 2 Expansion: SPA & Milestone Systems](#phase-2-expansion-spa--milestone-systems)
5. [Phase 3: MEDIUM PRIORITY Systems](#phase-3-medium-priority-systems)
6. [Integration Patterns](#integration-patterns)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Overview & Architecture

### Business Logic Consolidation Status
| Phase | Priority | Status | Components | Lines of Code |
|-------|----------|--------|------------|---------------|
| **Phase 1** | Audit | ✅ Complete | 200+ files analyzed | - |
| **Phase 2** | HIGH | ✅ Complete | User, Club, Challenge | 2,100+ |
| **Phase 2 Expansion** | CRITICAL | ✅ Complete | SPA Points, Milestones | 1,670+ |
| **Phase 3** | MEDIUM | ✅ Complete | Notifications, Analytics, Admin | 1,943+ |
| **Total** | - | ✅ Complete | **10 Services** | **5,713+ lines** |

### Architecture Principles
- 🎯 **Service-Oriented**: Each business domain has dedicated service classes
- 🔒 **Type-Safe**: Complete TypeScript interface coverage
- 🔄 **Reusable**: Shared across both admin and user applications
- 📦 **Modular**: Clean separation of concerns and dependencies
- 🚀 **Scalable**: Enterprise-grade patterns and structures

---

## 🛠️ Installation & Setup

### Import Structure
```typescript
// Individual service imports
import { userProfileService } from '@/packages/shared-business/src/user/user-profile';
import { clubManagementService } from '@/packages/shared-business/src/club/club-management';
import { challengeService } from '@/packages/shared-business/src/challenge/challenge-system';

// Phase 2 Expansion imports
import { spaSystemService, milestoneSystemService } from '@/packages/shared-business/src/phase2-expansion';

// Phase 3 imports
import { notificationService } from '@/packages/shared-business/src/notification/notification-system';
import { analyticsService } from '@/packages/shared-business/src/analytics/analytics-system';
import { adminService } from '@/packages/shared-business/src/admin/admin-system';
```

### Package Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "typescript": "^5.x"
  }
}
```

---

## 🎯 Phase 2: HIGH PRIORITY Systems

### 👤 User Management (`user/`)

#### User Profile Service
```typescript
import { userProfileService, UserProfile } from '@/packages/shared-business/src/user/user-profile';

// Load user profile with all related data
const profile = await userProfileService.loadUserProfile(userId);

// Update profile information
const updatedProfile = await userProfileService.updateUserProfile(userId, {
  display_name: 'New Name',
  bio: 'Updated bio',
  preferences: { theme: 'dark' }
});

// Get profile statistics
const stats = await userProfileService.getUserStats(userId);
```

#### User Settings Service
```typescript
import { userSettingsService, UserSettings } from '@/packages/shared-business/src/user/user-settings';

// Load user settings
const settings = await userSettingsService.getUserSettings(userId);

// Update notification preferences
await userSettingsService.updateNotificationSettings(userId, {
  email_notifications: true,
  push_notifications: false,
  tournament_reminders: true
});

// Update privacy settings
await userSettingsService.updatePrivacySettings(userId, {
  profile_visibility: 'public',
  show_online_status: false
});
```

### 🏛️ Club Management (`club/`)

#### Club Management Service
```typescript
import { clubManagementService, Club } from '@/packages/shared-business/src/club/club-management';

// Create new club
const club = await clubManagementService.createClub({
  name: 'Elite Pool Club',
  description: 'Premier billiards community',
  type: 'public',
  max_members: 100
});

// Join club
const joinResult = await clubManagementService.joinClub(userId, clubId);

// Get club details with member info
const clubDetails = await clubManagementService.getClubDetails(clubId);

// Club member operations
await clubManagementService.promoteToModerator(clubId, userId, promoterId);
await clubManagementService.removeMember(clubId, userId, moderatorId);
```

### 🎮 Challenge System (`challenge/`)

#### Challenge Service
```typescript
import { challengeService, Challenge } from '@/packages/shared-business/src/challenge/challenge-system';

// Create challenge
const challenge = await challengeService.createChallenge({
  title: 'Daily Practice',
  type: 'daily',
  difficulty: 'medium',
  spa_reward: 100,
  requirements: { matches_to_win: 3 }
});

// Submit challenge progress
const progressResult = await challengeService.submitChallengeProgress(
  challengeId,
  userId,
  { matches_won: 1 }
);

// Get active challenges
const challenges = await challengeService.getActiveChallenges(userId);

// Complete challenge
const completion = await challengeService.completeChallenge(challengeId, userId);
```

---

## 🎯 Phase 2 Expansion: SPA & Milestone Systems

### 🏆 SPA Points System (`spa/`)

#### SPA System Service
```typescript
import { spaSystemService, SPAActivity } from '@/packages/shared-business/src/spa/spa-system';

// Calculate match points
const activity: SPAActivity = {
  player_id: userId,
  activity_type: 'match_completion',
  result: 'win',
  is_tournament: true,
  is_challenge: false,
  is_perfect_game: true,
  is_first_win_of_day: false,
  current_streak: 5
};

const transaction = spaSystemService.calculateMatchPoints(activity);

// Calculate tournament prize
const prize = spaSystemService.calculateTournamentPrize('DE16', 1, 16);

// Get available rewards
const rewards = spaSystemService.getAvailableRewards();

// Generate leaderboard
const leaderboard = spaSystemService.generateLeaderboard(playerBalances, 'weekly');
```

#### SPA Balance Service
```typescript
import { spaBalanceService } from '@/packages/shared-business/src/spa/spa-balance';

// Get current balance
const balance = await spaBalanceService.getCurrentBalance(userId);

// Add points
const addResult = await spaBalanceService.addPoints(
  userId,
  500,
  'tournament_win',
  'Tournament victory reward'
);

// Deduct points for purchase
const deductResult = await spaBalanceService.deductPoints(
  userId,
  1000,
  'item_purchase',
  'Premium cue purchase'
);

// Create purchase order
const order = await spaBalanceService.createPurchaseOrder(
  userId,
  'premium_cue_1month',
  'Premium Cue (1 Month)',
  5000
);
```

### 🎖️ Milestone & Achievement System (`milestone/`)

#### Milestone System Service
```typescript
import { milestoneSystemService } from '@/packages/shared-business/src/milestone/milestone-system';

// Initialize milestones for new player
await milestoneSystemService.initializePlayerMilestones(userId);

// Update milestone progress
const result = await milestoneSystemService.updatePlayerProgress(
  userId,
  'match_count',
  1
);

// Check and award milestone
const awardResult = await milestoneSystemService.checkAndAwardMilestone(
  userId,
  'tournament_win',
  5
);

// Process daily check-in
const checkinResult = await milestoneSystemService.processDailyCheckin(userId);

// Get player progress
const progress = await milestoneSystemService.getPlayerMilestoneProgress(userId);
```

#### Achievement Progress Service
```typescript
import { achievementProgressService } from '@/packages/shared-business/src/milestone/achievement-progress';

// Track match completion
const achievements = await achievementProgressService.handleMatchCompletion(
  userId,
  true, // won
  false, // not perfect
  tournamentId
);

// Handle tournament victory
const tournamentAchievements = await achievementProgressService.handleTournamentWin(
  userId,
  tournamentId
);

// Get user badges
const badges = await achievementProgressService.getUserBadges(userId);

// Get progress summary
const summary = await achievementProgressService.getAchievementProgressSummary(userId);
```

---

## 🎯 Phase 3: MEDIUM PRIORITY Systems

### 🔔 Notification System (`notification/`)

#### Notification Service
```typescript
import { notificationService, NotificationTemplate } from '@/packages/shared-business/src/notification/notification-system';

// Send single notification
await notificationService.sendNotification({
  user_id: userId,
  type: 'tournament_invitation',
  title: 'Tournament Invitation',
  message: 'You are invited to join Elite Tournament',
  category: 'tournament',
  priority: 'high',
  metadata: { tournament_id: tournamentId }
});

// Send bulk notifications
await notificationService.sendBulkNotifications([
  { user_id: user1, type: 'system_update', title: 'System Update', message: 'New features available' },
  { user_id: user2, type: 'system_update', title: 'System Update', message: 'New features available' }
]);

// Get user notifications
const notifications = await notificationService.getUserNotifications(userId, {
  limit: 20,
  unread_only: true
});

// Setup real-time subscription
const unsubscribe = await notificationService.subscribeToNotifications(
  userId,
  (notification) => {
    console.log('New notification:', notification);
  }
);
```

### 📊 Analytics System (`analytics/`)

#### Analytics Service
```typescript
import { analyticsService, AnalyticsTimeframe } from '@/packages/shared-business/src/analytics/analytics-system';

// Club analytics
const clubStats = await analyticsService.getClubAnalytics(clubId, {
  timeframe: 'last_30_days',
  include_trends: true
});

// User analytics
const userStats = await analyticsService.getUserAnalytics(userId, {
  timeframe: 'last_7_days',
  metrics: ['matches', 'tournaments', 'spa_earned']
});

// Revenue analytics
const revenueData = await analyticsService.getRevenueAnalytics({
  timeframe: 'last_month',
  breakdown_by: 'day',
  include_projections: true
});

// System performance
const performance = await analyticsService.getSystemPerformance({
  timeframe: 'last_24_hours',
  include_alerts: true
});

// Generate reports
const report = await analyticsService.generateReport({
  type: 'club_performance',
  club_id: clubId,
  timeframe: 'last_month',
  format: 'detailed'
});
```

### 👨‍💼 Admin System (`admin/`)

#### Admin Service
```typescript
import { adminService, AdminRole } from '@/packages/shared-business/src/admin/admin-system';

// User management
const userList = await adminService.getUsers({
  page: 1,
  limit: 50,
  status: 'active',
  role: 'player'
});

// Moderate user
await adminService.moderateUser(userId, {
  action: 'suspend',
  duration: '7_days',
  reason: 'Inappropriate behavior',
  moderator_id: adminId
});

// Club management
const clubs = await adminService.getClubs({
  status: 'active',
  sort_by: 'member_count'
});

// System configuration
await adminService.updateSystemConfig({
  maintenance_mode: false,
  max_concurrent_users: 10000,
  feature_flags: {
    tournaments_enabled: true,
    spa_system_enabled: true
  }
});

// Role management
await adminService.assignRole(userId, 'moderator', adminId);
await adminService.revokeRole(userId, 'moderator', adminId);
```

---

## 🔄 Integration Patterns

### React Hook Integration
```typescript
// Custom hook example
import { useQuery, useMutation } from '@tanstack/react-query';
import { userProfileService } from '@/packages/shared-business/src/user/user-profile';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userProfileService.loadUserProfile(userId),
    enabled: !!userId
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) =>
      userProfileService.updateUserProfile(userId, updates)
  });
}
```

### Service Composition
```typescript
// Complex business operation combining multiple services
async function completeMatchWithRewards(
  userId: string,
  matchData: MatchResult
) {
  // 1. Update user stats
  await userProfileService.updateMatchStats(userId, matchData);
  
  // 2. Calculate and award SPA points
  const spaTransaction = spaSystemService.calculateMatchPoints({
    player_id: userId,
    activity_type: 'match_completion',
    result: matchData.won ? 'win' : 'loss',
    is_tournament: matchData.tournament_id ? true : false,
    is_challenge: matchData.challenge_id ? true : false,
    is_perfect_game: matchData.perfect_game,
    is_first_win_of_day: matchData.first_win_today,
    current_streak: matchData.win_streak
  });
  
  await spaBalanceService.addPoints(
    userId,
    spaTransaction.total_points,
    'match_completion',
    'Match completion reward'
  );
  
  // 3. Update milestone progress
  await milestoneSystemService.updatePlayerProgress(userId, 'match_count', 1);
  if (matchData.won) {
    await milestoneSystemService.updatePlayerProgress(userId, 'match_win', 1);
  }
  
  // 4. Track achievements
  await achievementProgressService.handleMatchCompletion(
    userId,
    matchData.won,
    matchData.perfect_game,
    matchData.tournament_id,
    matchData.challenge_id
  );
  
  // 5. Send notification
  await notificationService.sendNotification({
    user_id: userId,
    type: 'match_completed',
    title: matchData.won ? 'Victory!' : 'Match Completed',
    message: `You earned ${spaTransaction.total_points} SPA points`,
    category: 'gameplay'
  });
  
  // 6. Log analytics
  await analyticsService.trackEvent('match_completed', {
    user_id: userId,
    match_result: matchData.won ? 'win' : 'loss',
    spa_earned: spaTransaction.total_points,
    tournament_id: matchData.tournament_id
  });
}
```

---

## 🎯 Best Practices

### 1. Error Handling
```typescript
try {
  const result = await userProfileService.updateUserProfile(userId, updates);
  return { success: true, data: result };
} catch (error) {
  console.error('Profile update failed:', error);
  return { success: false, error: error.message };
}
```

### 2. Type Safety
```typescript
// Always use proper types
import type { UserProfile, UserSettings } from '@/packages/shared-business/src/user/user-profile';

// Avoid any types - use proper interfaces
interface ProfileUpdateData extends Partial<UserProfile> {
  updated_at?: string;
}
```

### 3. Performance Optimization
```typescript
// Use proper query keys for caching
const queryKey = ['user-profile', userId, 'with-stats'];

// Implement proper pagination
const clubs = await clubManagementService.getClubs({
  page: 1,
  limit: 20,
  sort_by: 'created_at',
  order: 'desc'
});
```

### 4. Real-time Updates
```typescript
// Subscribe to real-time changes
useEffect(() => {
  const unsubscribe = notificationService.subscribeToNotifications(
    userId,
    (notification) => {
      // Update UI with new notification
      queryClient.invalidateQueries(['notifications', userId]);
    }
  );
  
  return unsubscribe;
}, [userId]);
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Import Errors
```typescript
// ❌ Wrong
import { userProfileService } from '@/packages/shared-business';

// ✅ Correct
import { userProfileService } from '@/packages/shared-business/src/user/user-profile';
```

#### 2. Type Conflicts
```typescript
// Ensure consistent type imports
import type { UserProfile } from '@/packages/shared-business/src/user/user-profile';
import type { Club } from '@/packages/shared-business/src/club/club-management';
```

#### 3. Service Dependencies
```typescript
// Some services require authentication context
const user = useAuth(); // Ensure user is authenticated
if (!user?.id) return null;

const profile = await userProfileService.loadUserProfile(user.id);
```

#### 4. Database Requirements
```typescript
// Ensure proper database setup
// Services require corresponding Supabase tables and RLS policies
// Check migration files in supabase/migrations/
```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'shared-business:*');

// Services will log detailed information
const result = await userProfileService.updateUserProfile(userId, updates);
```

---

## 📈 Performance Metrics

### Service Response Times (Target)
- User Profile Operations: < 100ms
- Club Management: < 200ms
- SPA Calculations: < 50ms
- Notification Delivery: < 300ms
- Analytics Queries: < 500ms

### Memory Usage
- Each service instance: < 5MB
- Type definitions: Minimal overhead
- Caching: Configurable per service

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Service worker integration for offline support
- [ ] Advanced caching strategies
- [ ] Microservice decomposition
- [ ] GraphQL integration layer
- [ ] Advanced analytics ML models

### Extension Points
- Custom notification templates
- Plugin architecture for new services
- Custom analytics dimensions
- Advanced admin role definitions

---

## 📞 Support & Resources

### Documentation
- [Business Logic Architecture](./docs/TECHNICAL_ARCHITECTURE.md)
- [Database Schema](./supabase/migrations/)
- [API Documentation](./docs/API_DOCUMENTATION.md)

### Development
- TypeScript: 5.x+
- Supabase: 2.x+
- Testing: Jest + Testing Library
- Linting: ESLint + Prettier

---

**📚 This reference guide covers all consolidated business logic services. For specific implementation details, refer to individual service files and their comprehensive TypeScript documentation.**

---
*Last updated: August 30, 2025*  
*Version: 1.0.0*  
*SABO Pool V12 - Business Logic Reference*
