# 🚀 SABO Pool V12 - Quick Start Guide
**Fast Setup for Shared Business Logic Services**

---

## ⚡ Quick Setup (5 minutes)

### 1. Import What You Need
```typescript
// Core services (most common)
import { userProfileService } from '@/packages/shared-business/src/user/user-profile';
import { clubManagementService } from '@/packages/shared-business/src/club/club-management';
import { spaSystemService } from '@/packages/shared-business/src/spa/spa-system';
import { notificationService } from '@/packages/shared-business/src/notification/notification-system';
```

### 2. Basic User Flow
```typescript
// Complete user onboarding flow
async function setupNewUser(userId: string) {
  // 1. Initialize user profile
  await userProfileService.initializeUserProfile(userId);
  
  // 2. Setup default settings
  await userSettingsService.initializeDefaultSettings(userId);
  
  // 3. Initialize milestones
  await milestoneSystemService.initializePlayerMilestones(userId);
  
  // 4. Send welcome notification
  await notificationService.sendNotification({
    user_id: userId,
    type: 'welcome',
    title: 'Welcome to SABO Pool!',
    message: 'Start your billiards journey today',
    category: 'system'
  });
}
```

### 3. Common Operations
```typescript
// Match completion with rewards
async function completeMatch(userId: string, won: boolean, spaEarned: number) {
  // Award SPA points
  await spaBalanceService.addPoints(userId, spaEarned, 'match_completion');
  
  // Update milestones
  await milestoneSystemService.updatePlayerProgress(userId, 'match_count', 1);
  if (won) {
    await milestoneSystemService.updatePlayerProgress(userId, 'match_win', 1);
  }
  
  // Send notification
  await notificationService.sendNotification({
    user_id: userId,
    type: 'match_completed',
    title: won ? 'Victory!' : 'Good Game!',
    message: `You earned ${spaEarned} SPA points`,
    category: 'gameplay'
  });
}
```

---

## 🎯 Most Used Services

### 1. User Profile (Daily Use)
```typescript
// Get user info
const profile = await userProfileService.loadUserProfile(userId);

// Update profile
await userProfileService.updateUserProfile(userId, {
  display_name: 'New Name',
  bio: 'Updated bio'
});
```

### 2. SPA Points (Critical for Engagement)
```typescript
// Check balance
const balance = await spaBalanceService.getCurrentBalance(userId);

// Award points
await spaBalanceService.addPoints(userId, 500, 'tournament_win');

// Calculate match points
const points = spaSystemService.calculateMatchPoints(activityData);
```

### 3. Notifications (Real-time)
```typescript
// Send notification
await notificationService.sendNotification({
  user_id: userId,
  type: 'tournament_invitation',
  title: 'Tournament Starting!',
  message: 'Your tournament begins in 5 minutes',
  category: 'tournament',
  priority: 'high'
});
```

### 4. Milestones (Gamification)
```typescript
// Update progress
await milestoneSystemService.updatePlayerProgress(userId, 'match_count', 1);

// Check achievements
const achievements = await achievementProgressService.handleMatchCompletion(
  userId, true, false
);
```

---

## 📱 React Integration Examples

### Profile Component
```typescript
import { useQuery } from '@tanstack/react-query';
import { userProfileService } from '@/packages/shared-business/src/user/user-profile';

function UserProfile({ userId }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userProfileService.loadUserProfile(userId)
  });

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{profile.display_name}</h1>
      <p>SPA Points: {profile.spa_points}</p>
      <p>Matches Won: {profile.total_wins}</p>
    </div>
  );
}
```

### SPA Balance Display
```typescript
import { spaBalanceService } from '@/packages/shared-business/src/spa/spa-balance';

function SPABalance({ userId }) {
  const { data: balance } = useQuery({
    queryKey: ['spa-balance', userId],
    queryFn: () => spaBalanceService.getCurrentBalance(userId),
    refetchInterval: 30000 // Update every 30 seconds
  });

  return (
    <div className="spa-balance">
      <span className="points">{balance?.current_balance || 0}</span>
      <span className="label">SPA Points</span>
    </div>
  );
}
```

---

## 🔧 Environment Setup

### TypeScript Config
```json
{
  "compilerOptions": {
    "paths": {
      "@/packages/shared-business/*": ["./packages/shared-business/src/*"]
    }
  }
}
```

### Package.json
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc"
  }
}
```

---

## ⚠️ Common Gotchas

### 1. Authentication Required
```typescript
// Always check user authentication first
const user = useAuth();
if (!user?.id) return null;

// Then call services
const profile = await userProfileService.loadUserProfile(user.id);
```

### 2. Error Handling
```typescript
try {
  await userProfileService.updateUserProfile(userId, updates);
} catch (error) {
  console.error('Update failed:', error);
  // Show user-friendly error message
}
```

### 3. Real-time Updates
```typescript
// Invalidate cache after mutations
const mutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    queryClient.invalidateQueries(['user-profile', userId]);
  }
});
```

---

## 📊 Monitoring & Debug

### Enable Debug Logs
```typescript
// In browser console or .env
localStorage.setItem('debug', 'shared-business:*');
```

### Performance Monitoring
```typescript
// Track service performance
console.time('user-profile-load');
const profile = await userProfileService.loadUserProfile(userId);
console.timeEnd('user-profile-load');
```

---

## 🎉 Success Checklist

- [ ] ✅ Services imported correctly
- [ ] ✅ User authentication working
- [ ] ✅ Error handling in place
- [ ] ✅ Real-time updates configured
- [ ] ✅ Type safety verified
- [ ] ✅ Performance monitoring enabled

---

**🚀 You're ready to build amazing features with SABO Pool's business logic services!**

For detailed documentation, see: [Shared Business Logic Reference Guide](./SHARED_BUSINESS_LOGIC_REFERENCE_GUIDE.md)
