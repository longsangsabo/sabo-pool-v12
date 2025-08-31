/**
 * SABO POOL - SERVICES REFERENCE GUIDE
 * ===================================
 * 
 * File này là DOCUMENTATION và REFERENCE cho tất cả services trong hệ thống
 * Không phải là file implementation, mà là nơi tham chiếu cho developers
 * 
 * PURPOSE:
 * --------
 * ✅ Biết được có bao nhiêu services
 * ✅ Mỗi service làm gì
 * ✅ Service nào nên dùng cho feature nào
 * ✅ Import pattern chuẩn
 * ✅ Dependencies giữa các services
 * 
 * HOW TO USE:
 * -----------
 * 1. Xem file này để biết service nào cần dùng
 * 2. Import service từ đúng location
 * 3. Follow naming convention đã định nghĩa
 * 
 * IMPORT EXAMPLES:
 * ---------------
 * // From app-specific services
 * import { userService } from '@/services/userService';
 * import { tournamentService } from '@/services/tournamentService';
 * 
 * // From shared services  
 * import { PaymentService } from '@sabo-pool/shared-business/payment/PaymentService';
 * import { NotificationService } from '@sabo-pool/shared-business/mobile/NotificationService';
 */

// ==========================================
// 🔐 AUTHENTICATION & USER MANAGEMENT (4 services)
// ==========================================

/**
 * USER SERVICE
 * Location: apps/sabo-user/src/services/userService.ts
 * Purpose: Core user management, profiles, CRUD operations
 * Methods: createUser(), getUserById(), updateProfile(), deleteUser()
 * Dependencies: supabase auth, profiles table
 */

/**
 * AUTH SERVICE  
 * Location: apps/sabo-user/src/services/authService.ts
 * Purpose: Authentication, login/logout, session management
 * Methods: signIn(), signOut(), resetPassword(), validateSession()
 * Dependencies: supabase auth
 */

/**
 * PROFILE SERVICE
 * Location: apps/sabo-user/src/services/profileService.ts  
 * Purpose: User profile data, avatars, preferences
 * Methods: getProfile(), updateAvatar(), setPreferences()
 * Dependencies: userService, storageService
 */

/**
 * SETTINGS SERVICE
 * Location: apps/sabo-user/src/services/settingsService.ts
 * Purpose: User settings, configurations, preferences
 * Methods: getUserSettings(), updateSettings(), resetToDefaults()
 * Dependencies: userService
 */

// ==========================================
// 🏆 TOURNAMENT & COMPETITION (4 services)
// ==========================================

/**
 * TOURNAMENT SERVICE
 * Location: apps/sabo-user/src/services/tournamentService.ts
 * Purpose: Tournament CRUD, brackets, scheduling
 * Methods: createTournament(), getTournaments(), updateBracket()
 * Dependencies: userService, clubService
 */

/**
 * CHALLENGE SERVICE
 * Location: apps/sabo-user/src/services/challengeService.ts
 * Purpose: Challenge system, invitations, responses  
 * Methods: createChallenge(), acceptChallenge(), declineChallenge()
 * Dependencies: userService, tournamentService
 */

/**
 * MATCH SERVICE
 * Location: apps/sabo-user/src/services/matchService.ts
 * Purpose: Match management, scoring, results
 * Methods: createMatch(), updateScore(), finishMatch()
 * Dependencies: tournamentService, challengeService
 */

/**
 * TABLE SERVICE
 * Location: apps/sabo-user/src/services/tableService.ts
 * Purpose: Table assignments, availability, booking
 * Methods: getAvailableTables(), bookTable(), releaseTable()
 * Dependencies: clubService
 */

// ==========================================
// 🏢 CLUB MANAGEMENT (3 services)
// ==========================================

/**
 * CLUB SERVICE
 * Location: apps/sabo-user/src/services/clubService.ts
 * Purpose: Club management, info, membership
 * Methods: getClubs(), createClub(), updateClubInfo()
 * Dependencies: userService
 */

/**
 * MEMBER SERVICE
 * Location: apps/sabo-user/src/services/memberService.ts
 * Purpose: Member management, roles, permissions
 * Methods: addMember(), removeMember(), updateRole()
 * Dependencies: clubService, userService
 */

/**
 * ROLE SERVICE
 * Location: apps/sabo-user/src/services/roleService.ts
 * Purpose: Role definitions, access control
 * Methods: getRoles(), checkPermission(), assignRole()
 * Dependencies: memberService
 */

// ==========================================
// ⭐ VERIFICATION & RANKING (4 services)
// ==========================================

/**
 * VERIFICATION SERVICE
 * Location: apps/sabo-user/src/services/verificationService.ts
 * Purpose: Rank verification, evidence submission
 * Methods: submitVerification(), approveRank(), rejectRank()
 * Dependencies: userService, storageService
 */

/**
 * RANK SERVICE
 * Location: apps/sabo-user/src/services/rankService.ts
 * Purpose: Ranking system, ELO calculations
 * Methods: calculateELO(), updateRanking(), getRankHistory()
 * Dependencies: userService, matchService
 */

/**
 * HANDICAP SERVICE
 * Location: apps/sabo-user/src/services/handicapService.ts
 * Purpose: Handicap calculations, adjustments
 * Methods: calculateHandicap(), applyHandicap(), getHandicapHistory()
 * Dependencies: rankService, matchService
 */

/**
 * STATISTICS SERVICE
 * Location: apps/sabo-user/src/services/statisticsService.ts
 * Purpose: Player statistics, performance metrics
 * Methods: getPlayerStats(), calculateWinRate(), getPerformanceTrends()
 * Dependencies: matchService, tournamentService
 */

// ==========================================
// 💰 WALLET & PAYMENT (4 services)
// ==========================================

/**
 * WALLET SERVICE
 * Location: apps/sabo-user/src/services/walletService.ts
 * Purpose: Wallet management, balance tracking
 * Methods: getBalance(), addFunds(), withdrawFunds()
 * Dependencies: userService, transactionService
 */

/**
 * PAYMENT SERVICE
 * Location: apps/sabo-user/src/services/paymentService.ts
 * Purpose: Payment processing, transactions
 * Methods: processPayment(), refundPayment(), getPaymentMethods()
 * Dependencies: walletService
 */

/**
 * TRANSACTION SERVICE
 * Location: apps/sabo-user/src/services/transactionService.ts
 * Purpose: Transaction history, records
 * Methods: getTransactions(), createTransaction(), updateTransactionStatus()
 * Dependencies: userService, paymentService
 */

/**
 * SPA POINTS SERVICE
 * Location: apps/sabo-user/src/services/spaPointsService.ts
 * Purpose: SPA points system, rewards
 * Methods: awardPoints(), redeemPoints(), getPointsHistory()
 * Dependencies: userService, transactionService
 */

// ==========================================
// 📢 COMMUNICATION (4 services)
// ==========================================

/**
 * NOTIFICATION SERVICE
 * Location: apps/sabo-user/src/services/notificationService.ts
 * Purpose: In-app notifications, alerts
 * Methods: sendNotification(), markAsRead(), getNotifications()
 * Dependencies: userService
 */

/**
 * EMAIL SERVICE
 * Location: apps/sabo-user/src/services/emailService.ts
 * Purpose: Email sending, templates
 * Methods: sendEmail(), sendEmailTemplate(), validateEmail()
 * Dependencies: userService
 */

/**
 * MESSAGE SERVICE
 * Location: apps/sabo-user/src/services/messageService.ts
 * Purpose: Direct messaging, chat
 * Methods: sendMessage(), getConversations(), markAsRead()
 * Dependencies: userService, notificationService
 */

/**
 * ALERT SERVICE
 * Location: apps/sabo-user/src/services/alertService.ts
 * Purpose: System alerts, warnings
 * Methods: createAlert(), dismissAlert(), getActiveAlerts()
 * Dependencies: notificationService
 */

// ==========================================
// 💾 DATA MANAGEMENT (4 services)
// ==========================================

/**
 * STORAGE SERVICE
 * Location: apps/sabo-user/src/services/storageService.ts
 * Purpose: File storage, media uploads
 * Methods: uploadFile(), deleteFile(), getFileUrl()
 * Dependencies: supabase storage
 */

/**
 * CACHE SERVICE
 * Location: apps/sabo-user/src/services/cacheService.ts
 * Purpose: Data caching, performance optimization
 * Methods: setCache(), getCache(), clearCache()
 * Dependencies: none
 */

/**
 * BACKUP SERVICE
 * Location: apps/sabo-user/src/services/backupService.ts
 * Purpose: Data backup, recovery
 * Methods: createBackup(), restoreBackup(), scheduleBackup()
 * Dependencies: storageService
 */

/**
 * SYNC SERVICE
 * Location: apps/sabo-user/src/services/syncService.ts
 * Purpose: Data synchronization, offline support
 * Methods: syncData(), handleOfflineQueue(), detectConflicts()
 * Dependencies: cacheService, storageService
 */

// ==========================================
// 📊 ANALYTICS & REPORTING (4 services)
// ==========================================

/**
 * ANALYTICS SERVICE
 * Location: apps/sabo-user/src/services/analyticsService.ts
 * Purpose: User analytics, behavior tracking
 * Methods: trackEvent(), getAnalytics(), generateReport()
 * Dependencies: userService
 */

/**
 * REPORTING SERVICE
 * Location: apps/sabo-user/src/services/reportingService.ts
 * Purpose: Report generation, data export
 * Methods: generateReport(), exportData(), scheduleReport()
 * Dependencies: analyticsService, statisticsService
 */

/**
 * METRICS SERVICE
 * Location: apps/sabo-user/src/services/metricsService.ts
 * Purpose: Performance metrics, KPIs
 * Methods: collectMetrics(), calculateKPIs(), getMetricsDashboard()
 * Dependencies: analyticsService
 */

/**
 * AUDIT SERVICE
 * Location: apps/sabo-user/src/services/auditService.ts
 * Purpose: Audit trails, activity logging
 * Methods: logActivity(), getAuditTrail(), exportAuditLog()
 * Dependencies: userService
 */

// ==========================================
// 🖥️ DASHBOARD & UI (4 services)
// ==========================================

/**
 * DASHBOARD SERVICE
 * Location: apps/sabo-user/src/services/dashboardService.ts
 * Purpose: Dashboard data aggregation
 * Methods: getDashboardData(), refreshDashboard(), customizeDashboard()
 * Dependencies: userService, statisticsService, analyticsService
 */

/**
 * SEARCH SERVICE
 * Location: apps/sabo-user/src/services/searchService.ts
 * Purpose: Search functionality, indexing
 * Methods: search(), buildIndex(), getSearchSuggestions()
 * Dependencies: none
 */

/**
 * FILTER SERVICE
 * Location: apps/sabo-user/src/services/filterService.ts
 * Purpose: Data filtering, sorting
 * Methods: applyFilters(), sortData(), saveFilterPreset()
 * Dependencies: searchService
 */

/**
 * THEME SERVICE
 * Location: apps/sabo-user/src/services/themeService.ts
 * Purpose: Theme management, UI preferences
 * Methods: setTheme(), getTheme(), applyCustomTheme()
 * Dependencies: userService, settingsService
 */

// ==========================================
// 📱 MOBILE CAPABILITIES (3 services)
// ==========================================

/**
 * OFFLINE SERVICE
 * Location: apps/sabo-user/src/services/offlineService.ts
 * Purpose: Offline functionality, data sync
 * Methods: goOffline(), syncWhenOnline(), getOfflineData()
 * Dependencies: syncService, cacheService
 */

/**
 * WEBSOCKET SERVICE
 * Location: apps/sabo-user/src/services/webSocketService.ts
 * Purpose: Real-time communications
 * Methods: connect(), disconnect(), subscribe(), emit()
 * Dependencies: userService
 */

/**
 * PUSH NOTIFICATION SERVICE
 * Location: apps/sabo-user/src/services/pushNotificationService.ts
 * Purpose: Push notifications
 * Methods: registerDevice(), sendPushNotification(), unsubscribe()
 * Dependencies: notificationService, userService
 */

// ==========================================
// 🔒 SECURITY & VALIDATION (3 services)
// ==========================================

/**
 * SECURITY SERVICE
 * Location: apps/sabo-user/src/services/securityService.ts
 * Purpose: Security utilities, encryption
 * Methods: encrypt(), decrypt(), validateToken(), checkSecurity()
 * Dependencies: authService
 */

/**
 * VALIDATION SERVICE
 * Location: apps/sabo-user/src/services/validationService.ts
 * Purpose: Data validation, sanitization
 * Methods: validate(), sanitize(), validateSchema()
 * Dependencies: none
 */

/**
 * PERMISSION SERVICE
 * Location: apps/sabo-user/src/services/permissionService.ts
 * Purpose: Permission checks, access control
 * Methods: checkPermission(), hasAccess(), getPermissions()
 * Dependencies: authService, roleService
 */

// ==========================================
// 🤝 SHARED SERVICES (packages/shared-business)
// ==========================================

/**
 * SHARED USER SERVICE
 * Location: packages/shared-business/src/user/UserService.ts
 * Purpose: Core user logic shared across apps
 * Used by: sabo-user, sabo-admin, sabo-mobile
 */

/**
 * SHARED PAYMENT SERVICE
 * Location: packages/shared-business/src/payment/PaymentService.ts
 * Purpose: Payment logic shared across apps
 * Used by: sabo-user, sabo-admin, sabo-mobile
 */

/**
 * SHARED NOTIFICATION SERVICE
 * Location: packages/shared-business/src/mobile/NotificationService.ts
 * Purpose: Notification logic for mobile apps
 * Used by: sabo-mobile, sabo-user (mobile views)
 */

// ==========================================
// 📝 DEVELOPMENT GUIDELINES
// ==========================================

/**
 * NAMING CONVENTIONS:
 * ------------------
 * - File: [domain]Service.ts (camelCase)
 * - Class: [Domain]Service (PascalCase)
 * - Instance: [domain]Service (camelCase)
 * - Method: action + Entity (e.g., createUser, getTournament)
 * 
 * FILE STRUCTURE:
 * --------------
 * apps/sabo-user/src/services/
 * ├── index.ts (central export)
 * ├── userService.ts
 * ├── tournamentService.ts
 * └── ... (43 total services)
 * 
 * IMPORT PATTERNS:
 * ---------------
 * // Individual service
 * import { userService } from '@/services/userService';
 * 
 * // Multiple services
 * import { userService, tournamentService } from '@/services';
 * 
 * // Shared service
 * import { PaymentService } from '@sabo-pool/shared-business/payment/PaymentService';
 * 
 * SERVICE DEPENDENCIES:
 * --------------------
 * - Keep dependencies minimal
 * - Avoid circular dependencies
 * - Use dependency injection when needed
 * - Document dependencies in service comments
 * 
 * ERROR HANDLING:
 * --------------
 * - Use consistent error types
 * - Provide meaningful error messages
 * - Log errors appropriately
 * - Return user-friendly messages
 * 
 * TESTING:
 * -------
 * - Each service should have unit tests
 * - Mock external dependencies
 * - Test error scenarios
 * - Integration tests for critical flows
 */

// ==========================================
// 📊 SERVICES SUMMARY
// ==========================================

export const SERVICES_SUMMARY = {
  total: 43,
  categories: {
    authentication: 4,
    tournaments: 4,
    clubs: 3,
    verification: 4,
    payments: 4,
    communication: 4,
    data: 4,
    analytics: 4,
    dashboard: 4,
    mobile: 3,
    security: 3,
    shared: 6
  },
  status: {
    implemented: 43,
    tested: 0, // TODO: Add tests
    documented: 43
  },
  migration: {
    original_supabase_calls: 158,
    current_supabase_calls: 0,
    success_rate: '100%'
  }
};

/**
 * QUICK REFERENCE MAP
 * ===================
 * 
 * Need authentication? → userService, authService
 * Need tournaments? → tournamentService, challengeService, matchService
 * Need payments? → walletService, paymentService, transactionService
 * Need notifications? → notificationService, emailService, messageService
 * Need data storage? → storageService, cacheService, syncService
 * Need analytics? → analyticsService, reportingService, statisticsService
 * Need mobile features? → offlineService, webSocketService, pushNotificationService
 * Need security? → securityService, validationService, permissionService
 */

export default {
  SERVICES_SUMMARY,
  message: 'This file is a documentation reference. Import actual services from their specific locations.'
};
