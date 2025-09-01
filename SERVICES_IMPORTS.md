# Services Import Reference

Copy-paste import statements cho tất cả services trong SABO Pool system.

## 🔐 Authentication & User Management

```typescript
// User Service
import { userService } from '@/services/userService';
// Methods: createUser(), getUserById(), updateProfile(), deleteUser()

// Auth Service  
import { authService } from '@/services/authService';
// Methods: signIn(), signOut(), resetPassword(), validateSession()

// Profile Service
import { profileService } from '@/services/profileService';
// Methods: getProfile(), updateAvatar(), setPreferences()

// Settings Service
import { settingsService } from '@/services/settingsService';
// Methods: getUserSettings(), updateSettings(), resetToDefaults()
```

## 🏆 Tournament & Competition

```typescript
// Tournament Service
import { tournamentService } from '@/services/tournamentService';
// Methods: createTournament(), getTournaments(), updateBracket()

// Challenge Service
import { challengeService } from '@/services/challengeService';
// Methods: createChallenge(), acceptChallenge(), declineChallenge()

// Match Service
import { matchService } from '@/services/matchService';
// Methods: createMatch(), updateScore(), finishMatch()

// Table Service
import { tableService } from '@/services/tableService';
// Methods: getAvailableTables(), bookTable(), releaseTable()
```

## 🏢 Club Management

```typescript
// Club Service
import { clubService } from '@/services/clubService';
// Methods: getClubs(), createClub(), updateClubInfo()

// Member Service
import { memberService } from '@/services/memberService';
// Methods: addMember(), removeMember(), updateRole()

// Role Service
import { roleService } from '@/services/roleService';
// Methods: getRoles(), checkPermission(), assignRole()
```

## ⭐ Verification & Ranking

```typescript
// Verification Service
import { verificationService } from '@/services/verificationService';
// Methods: submitVerification(), approveRank(), rejectRank()

// Rank Service
import { rankService } from '@/services/rankService';
// Methods: calculateELO(), updateRanking(), getRankHistory()

// Handicap Service
import { handicapService } from '@/services/handicapService';
// Methods: calculateHandicap(), applyHandicap(), getHandicapHistory()

// Statistics Service
import { statisticsService } from '@/services/statisticsService';
// Methods: getPlayerStats(), calculateWinRate(), getPerformanceTrends()
```

## 💰 Wallet & Payment

```typescript
// Wallet Service
import { walletService } from '@/services/walletService';
// Methods: getBalance(), addFunds(), withdrawFunds()

// Payment Service
import { paymentService } from '@/services/paymentService';
// Methods: processPayment(), refundPayment(), getPaymentMethods()

// Transaction Service
import { transactionService } from '@/services/transactionService';
// Methods: getTransactions(), createTransaction(), updateTransactionStatus()

// SPA Points Service
import { spaPointsService } from '@/services/spaPointsService';
// Methods: awardPoints(), redeemPoints(), getPointsHistory()
```

## 📢 Communication

```typescript
// Notification Service
import { notificationService } from '@/services/notificationService';
// Methods: sendNotification(), markAsRead(), getNotifications()

// Email Service
import { emailService } from '@/services/emailService';
// Methods: sendEmail(), sendEmailTemplate(), validateEmail()

// Message Service
import { messageService } from '@/services/messageService';
// Methods: sendMessage(), getConversations(), markAsRead()

// Alert Service
import { alertService } from '@/services/alertService';
// Methods: createAlert(), dismissAlert(), getActiveAlerts()
```

## 💾 Data Management

```typescript
// Storage Service
import { storageService } from '@/services/storageService';
// Methods: uploadFile(), deleteFile(), getFileUrl()

// Cache Service
import { cacheService } from '@/services/cacheService';
// Methods: setCache(), getCache(), clearCache()

// Backup Service
import { backupService } from '@/services/backupService';
// Methods: createBackup(), restoreBackup(), scheduleBackup()

// Sync Service
import { syncService } from '@/services/syncService';
// Methods: syncData(), handleOfflineQueue(), detectConflicts()
```

## 📊 Analytics & Reporting

```typescript
// Analytics Service
import { analyticsService } from '@/services/analyticsService';
// Methods: trackEvent(), getAnalytics(), generateReport()

// Reporting Service
import { reportingService } from '@/services/reportingService';
// Methods: generateReport(), exportData(), scheduleReport()

// Metrics Service
import { metricsService } from '@/services/metricsService';
// Methods: collectMetrics(), calculateKPIs(), getMetricsDashboard()

// Audit Service
import { auditService } from '@/services/auditService';
// Methods: logActivity(), getAuditTrail(), exportAuditLog()
```

## 🖥️ Dashboard & UI

```typescript
// Dashboard Service
import { dashboardService } from '@/services/dashboardService';
// Methods: getDashboardData(), refreshDashboard(), customizeDashboard()

// Search Service
import { searchService } from '@/services/searchService';
// Methods: search(), buildIndex(), getSearchSuggestions()

// Filter Service
import { filterService } from '@/services/filterService';
// Methods: applyFilters(), sortData(), saveFilterPreset()

// Theme Service
import { themeService } from '@/services/themeService';
// Methods: setTheme(), getTheme(), applyCustomTheme()
```

## 📱 Mobile Capabilities

```typescript
// Offline Service
import { offlineService } from '@/services/offlineService';
// Methods: goOffline(), syncWhenOnline(), getOfflineData()

// WebSocket Service
import { webSocketService } from '@/services/webSocketService';
// Methods: connect(), disconnect(), subscribe(), emit()

// Push Notification Service
import { pushNotificationService } from '@/services/pushNotificationService';
// Methods: registerDevice(), sendPushNotification(), unsubscribe()
```

## 🔒 Security & Validation

```typescript
// Security Service
import { securityService } from '@/services/securityService';
// Methods: encrypt(), decrypt(), validateToken(), checkSecurity()

// Validation Service
import { validationService } from '@/services/validationService';
// Methods: validate(), sanitize(), validateSchema()

// Permission Service
import { permissionService } from '@/services/permissionService';
// Methods: checkPermission(), hasAccess(), getPermissions()
```

## 🤝 Shared Services

```typescript
// Shared User Service
import { UserService } from '@sabo-pool/shared-business/user/UserService';

// Shared Payment Service
import { PaymentService } from '@sabo-pool/shared-business/payment/PaymentService';

// Shared Notification Service
import { NotificationService } from '@sabo-pool/shared-business/mobile/NotificationService';

// Shared Offline Data Service
import { OfflineDataService } from '@sabo-pool/shared-business/mobile/OfflineDataService';

// Shared WebSocket Service
import { WebSocketService } from '@sabo-pool/shared-business/mobile/WebSocketService';
```

## 🔄 Multiple Services Import

```typescript
// Import multiple services from central index
import { 
  userService, 
  tournamentService, 
  challengeService,
  paymentService,
  notificationService 
} from '@/services';

// Import all authentication services
import { 
  userService,
  authService,
  profileService,
  settingsService 
} from '@/services';

// Import all tournament-related services
import {
  tournamentService,
  challengeService,
  matchService,
  tableService
} from '@/services';
```

## 📝 Usage Examples

### Basic User Management
```typescript
import { userService, profileService, notificationService } from '@/services';

export async function createUserProfile() {
  try {
    // Create user
    const user = await userService.createUser({
      email: 'user@example.com',
      password: 'securePassword'
    });
    
    // Update profile
    const profile = await profileService.updateProfile(user.id, {
      name: 'John Doe',
      bio: 'Pool enthusiast'
    });
    
    // Send welcome notification
    await notificationService.sendNotification({
      userId: user.id,
      title: 'Welcome to SABO Pool!',
      message: 'Your account has been created successfully'
    });
    
    return { user, profile };
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw error;
  }
}
```

### Tournament Management
```typescript
import { tournamentService, paymentService, notificationService } from '@/services';

export async function manageTournament() {
  try {
    // Create tournament
    const tournament = await tournamentService.createTournament({
      name: 'Weekly Championship',
      type: 'elimination',
      maxPlayers: 16,
      entryFee: 10
    });
    
    // Process payment for entry fee
    await paymentService.processPayment({
      userId: 'user-id',
      amount: tournament.entryFee,
      type: 'tournament_entry',
      tournamentId: tournament.id
    });
    
    // Send tournament notification
    await notificationService.sendNotification({
      userId: 'user-id',
      title: 'Tournament Created',
      message: `You've successfully joined ${tournament.name}`
    });
    
    return tournament;
  } catch (error) {
    console.error('Failed to manage tournament:', error);
    throw error;
  }
}
```

### Real-time Features
```typescript
import { webSocketService, notificationService, offlineService } from '@/services';

export async function setupRealTimeFeatures() {
  try {
    // Connect to WebSocket
    await webSocketService.connect();
    
    // Subscribe to match updates
    webSocketService.subscribe('match-updates', (data) => {
      console.log('Match updated:', data);
    });
    
    // Subscribe to notifications
    webSocketService.subscribe('notifications', (notification) => {
      notificationService.displayNotification(notification);
    });
    
    // Handle offline scenarios
    if (!offlineService.isOnline()) {
      const offlineData = await offlineService.getOfflineData();
      console.log('Working offline with data:', offlineData);
    }
    
  } catch (error) {
    console.error('Failed to setup real-time features:', error);
    throw error;
  }
}
```

## 🎯 Service Selection Guide

| Need | Service | Import |
|------|---------|--------|
| User CRUD | userService | `import { userService } from '@/services/userService';` |
| Authentication | authService | `import { authService } from '@/services/authService';` |
| Tournaments | tournamentService | `import { tournamentService } from '@/services/tournamentService';` |
| Payments | paymentService | `import { paymentService } from '@/services/paymentService';` |
| Notifications | notificationService | `import { notificationService } from '@/services/notificationService';` |
| Real-time | webSocketService | `import { webSocketService } from '@/services/webSocketService';` |
| Analytics | analyticsService | `import { analyticsService } from '@/services/analyticsService';` |
| File Upload | storageService | `import { storageService } from '@/services/storageService';` |

## 🔍 Quick Search

- **User Management**: userService, authService, profileService, settingsService
- **Tournaments**: tournamentService, challengeService, matchService, tableService  
- **Payments**: walletService, paymentService, transactionService, spaPointsService
- **Communication**: notificationService, emailService, messageService, alertService
- **Data**: storageService, cacheService, backupService, syncService
- **Analytics**: analyticsService, reportingService, metricsService, auditService
- **Mobile**: offlineService, webSocketService, pushNotificationService
- **Security**: securityService, validationService, permissionService
