/**
 * SERVICES QUICK IMPORT REFERENCE
 * ==============================
 * 
 * Copy-paste import statements cho tất cả services
 * Chỉ cần tìm service cần dùng và copy import statement
 */

// ==========================================
// 🔐 AUTHENTICATION & USER MANAGEMENT
// ==========================================

// User Service
import { userService } from '@/services/userService';
// Methods: createUser(), getUserById(), updateProfile(), deleteUser(), getUserByEmail()

// Auth Service  
import { authService } from '@/services/authService';
// Methods: signIn(), signOut(), resetPassword(), validateSession(), refreshToken()

// Profile Service
import { profileService } from '@/services/profileService';
// Methods: getProfile(), updateAvatar(), setPreferences(), getProfileStats()

// Settings Service
import { settingsService } from '@/services/settingsService';
// Methods: getUserSettings(), updateSettings(), resetToDefaults(), exportSettings()

// ==========================================
// 🏆 TOURNAMENT & COMPETITION
// ==========================================

// Tournament Service
import { tournamentService } from '@/services/tournamentService';
// Methods: createTournament(), getTournaments(), updateBracket(), joinTournament()

// Challenge Service
import { challengeService } from '@/services/challengeService';
// Methods: createChallenge(), acceptChallenge(), declineChallenge(), getChallenges()

// Match Service
import { matchService } from '@/services/matchService';
// Methods: createMatch(), updateScore(), finishMatch(), getMatchHistory()

// Table Service
import { tableService } from '@/services/tableService';
// Methods: getAvailableTables(), bookTable(), releaseTable(), getTableStatus()

// ==========================================
// 🏢 CLUB MANAGEMENT
// ==========================================

// Club Service
import { clubService } from '@/services/clubService';
// Methods: getClubs(), createClub(), updateClubInfo(), joinClub(), leaveClub()

// Member Service
import { memberService } from '@/services/memberService';
// Methods: addMember(), removeMember(), updateRole(), getMembers()

// Role Service
import { roleService } from '@/services/roleService';
// Methods: getRoles(), checkPermission(), assignRole(), createRole()

// ==========================================
// ⭐ VERIFICATION & RANKING
// ==========================================

// Verification Service
import { verificationService } from '@/services/verificationService';
// Methods: submitVerification(), approveRank(), rejectRank(), getVerifications()

// Rank Service
import { rankService } from '@/services/rankService';
// Methods: calculateELO(), updateRanking(), getRankHistory(), getLeaderboard()

// Handicap Service
import { handicapService } from '@/services/handicapService';
// Methods: calculateHandicap(), applyHandicap(), getHandicapHistory()

// Statistics Service
import { statisticsService } from '@/services/statisticsService';
// Methods: getPlayerStats(), calculateWinRate(), getPerformanceTrends()

// ==========================================
// 💰 WALLET & PAYMENT
// ==========================================

// Wallet Service
import { walletService } from '@/services/walletService';
// Methods: getBalance(), addFunds(), withdrawFunds(), getTransactionHistory()

// Payment Service
import { paymentService } from '@/services/paymentService';
// Methods: processPayment(), refundPayment(), getPaymentMethods(), validatePayment()

// Transaction Service
import { transactionService } from '@/services/transactionService';
// Methods: getTransactions(), createTransaction(), updateTransactionStatus()

// SPA Points Service
import { spaPointsService } from '@/services/spaPointsService';
// Methods: awardPoints(), redeemPoints(), getPointsHistory(), calculatePoints()

// ==========================================
// 📢 COMMUNICATION
// ==========================================

// Notification Service
import { notificationService } from '@/services/notificationService';
// Methods: sendNotification(), markAsRead(), getNotifications(), clearAll()

// Email Service
import { emailService } from '@/services/emailService';
// Methods: sendEmail(), sendEmailTemplate(), validateEmail(), getEmailStatus()

// Message Service
import { messageService } from '@/services/messageService';
// Methods: sendMessage(), getConversations(), markAsRead(), deleteMessage()

// Alert Service
import { alertService } from '@/services/alertService';
// Methods: createAlert(), dismissAlert(), getActiveAlerts(), clearAlerts()

// ==========================================
// 💾 DATA MANAGEMENT
// ==========================================

// Storage Service
import { storageService } from '@/services/storageService';
// Methods: uploadFile(), deleteFile(), getFileUrl(), getFileMetadata()

// Cache Service
import { cacheService } from '@/services/cacheService';
// Methods: setCache(), getCache(), clearCache(), invalidateCache()

// Backup Service
import { backupService } from '@/services/backupService';
// Methods: createBackup(), restoreBackup(), scheduleBackup(), getBackupHistory()

// Sync Service
import { syncService } from '@/services/syncService';
// Methods: syncData(), handleOfflineQueue(), detectConflicts(), forcSync()

// ==========================================
// 📊 ANALYTICS & REPORTING
// ==========================================

// Analytics Service
import { analyticsService } from '@/services/analyticsService';
// Methods: trackEvent(), getAnalytics(), generateReport(), trackUserBehavior()

// Reporting Service
import { reportingService } from '@/services/reportingService';
// Methods: generateReport(), exportData(), scheduleReport(), getReportHistory()

// Metrics Service
import { metricsService } from '@/services/metricsService';
// Methods: collectMetrics(), calculateKPIs(), getMetricsDashboard(), trackPerformance()

// Audit Service
import { auditService } from '@/services/auditService';
// Methods: logActivity(), getAuditTrail(), exportAuditLog(), trackChanges()

// ==========================================
// 🖥️ DASHBOARD & UI
// ==========================================

// Dashboard Service
import { dashboardService } from '@/services/dashboardService';
// Methods: getDashboardData(), refreshDashboard(), customizeDashboard(), getWidgets()

// Search Service
import { searchService } from '@/services/searchService';
// Methods: search(), buildIndex(), getSearchSuggestions(), advancedSearch()

// Filter Service
import { filterService } from '@/services/filterService';
// Methods: applyFilters(), sortData(), saveFilterPreset(), getFilterOptions()

// Theme Service
import { themeService } from '@/services/themeService';
// Methods: setTheme(), getTheme(), applyCustomTheme(), getAvailableThemes()

// ==========================================
// 📱 MOBILE CAPABILITIES
// ==========================================

// Offline Service
import { offlineService } from '@/services/offlineService';
// Methods: goOffline(), syncWhenOnline(), getOfflineData(), isOnline()

// WebSocket Service
import { webSocketService } from '@/services/webSocketService';
// Methods: connect(), disconnect(), subscribe(), emit(), getConnectionStatus()

// Push Notification Service
import { pushNotificationService } from '@/services/pushNotificationService';
// Methods: registerDevice(), sendPushNotification(), unsubscribe(), getPermissions()

// ==========================================
// 🔒 SECURITY & VALIDATION
// ==========================================

// Security Service
import { securityService } from '@/services/securityService';
// Methods: encrypt(), decrypt(), validateToken(), checkSecurity(), generateHash()

// Validation Service
import { validationService } from '@/services/validationService';
// Methods: validate(), sanitize(), validateSchema(), isValid()

// Permission Service
import { permissionService } from '@/services/permissionService';
// Methods: checkPermission(), hasAccess(), getPermissions(), grantPermission()

// ==========================================
// 🤝 SHARED SERVICES (từ packages)
// ==========================================

// Shared User Service
import { UserService } from '@sabo-pool/shared-business/user/UserService';
const sharedUserService = new UserService(supabaseClient);

// Shared Payment Service
import { PaymentService } from '@sabo-pool/shared-business/payment/PaymentService';
const sharedPaymentService = new PaymentService(paymentProvider, walletService);

// Shared Notification Service
import { NotificationService } from '@sabo-pool/shared-business/mobile/NotificationService';
const sharedNotificationService = new NotificationService(supabaseClient, pushProvider);

// Shared Offline Data Service
import { OfflineDataService } from '@sabo-pool/shared-business/mobile/OfflineDataService';
const sharedOfflineService = new OfflineDataService(localStorageProvider, syncProvider);

// Shared WebSocket Service
import { WebSocketService } from '@sabo-pool/shared-business/mobile/WebSocketService';
const sharedWebSocketService = new WebSocketService(websocketUrl);

// ==========================================
// 🔄 MULTIPLE SERVICES IMPORT
// ==========================================

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

// Import all payment services
import {
  walletService,
  paymentService,
  transactionService,
  spaPointsService
} from '@/services';

// Import all communication services
import {
  notificationService,
  emailService,
  messageService,
  alertService
} from '@/services';

// ==========================================
// 📝 USAGE EXAMPLES
// ==========================================

// Basic Usage Example
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

// Tournament Management Example
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

// Real-time Features Example
export async function setupRealTimeFeatures() {
  try {
    // Connect to WebSocket
    await webSocketService.connect();
    
    // Subscribe to match updates
    webSocketService.subscribe('match-updates', (data) => {
      console.log('Match updated:', data);
      // Update UI accordingly
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

// ==========================================
// 🎯 SERVICE SELECTION GUIDE
// ==========================================

/**
 * WHICH SERVICE TO USE?
 * 
 * 👤 User Management:
 * - Basic CRUD: userService
 * - Authentication: authService  
 * - Profile data: profileService
 * - Settings: settingsService
 * 
 * 🏆 Tournaments:
 * - Tournament CRUD: tournamentService
 * - Challenges: challengeService
 * - Match management: matchService
 * - Table booking: tableService
 * 
 * 💰 Payments:
 * - Wallet operations: walletService
 * - Payment processing: paymentService
 * - Transaction history: transactionService
 * - Points system: spaPointsService
 * 
 * 📢 Communication:
 * - In-app notifications: notificationService
 * - Email sending: emailService
 * - Direct messaging: messageService
 * - System alerts: alertService
 * 
 * 📊 Analytics:
 * - User analytics: analyticsService
 * - Reports: reportingService
 * - Performance metrics: metricsService
 * - Audit logs: auditService
 * 
 * 📱 Mobile:
 * - Offline support: offlineService
 * - Real-time: webSocketService
 * - Push notifications: pushNotificationService
 */

export default {
  message: 'Copy the import statements above for the services you need!'
};
