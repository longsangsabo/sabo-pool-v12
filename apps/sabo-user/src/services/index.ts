/**
 * SABO POOL - SERVICES REGISTRY
 * ============================
 * Central registry cho tất cả các services trong hệ thống
 * File này làm single source of truth cho việc import và sử dụng services
 * 
 * HOW TO USE:
 * -----------
 * import { userService, tournamentService } from '@/services';
 * 
 * ARCHITECTURE:
 * ------------
 * Presentation Layer → Service Layer → Data Access Layer
 * Components → Services (this file) → Supabase/API calls
 * 
 * NAMING CONVENTION:
 * -----------------
 * - File: [domain]Service.ts (camelCase)
 * - Export: [domain]Service (camelCase)
 * - Class: [Domain]Service (PascalCase)
 */

// ==========================================
// CORE AUTHENTICATION & USER MANAGEMENT
// ==========================================

import { UserService } from './userService';
import { AuthService } from './authService';
import { ProfileService } from './profileService';
import { SettingsService } from './settingsService';

export const userService = new UserService();
export const authService = new AuthService();
export const profileService = new ProfileService();
export const settingsService = new SettingsService();

// ==========================================
// TOURNAMENT & COMPETITION MANAGEMENT
// ==========================================

import { TournamentService } from './tournamentService';
import { ChallengeService } from './challengeService';
import { MatchService } from './matchService';
import { TableService } from './tableService';

export const tournamentService = new TournamentService();
export const challengeService = new ChallengeService();
export const matchService = new MatchService();
export const tableService = new TableService();

// ==========================================
// CLUB & MEMBERSHIP MANAGEMENT
// ==========================================

import { ClubService } from './clubService';
import { MemberService } from './memberService';
import { RoleService } from './roleService';

export const clubService = new ClubService();
export const memberService = new MemberService();
export const roleService = new RoleService();

// ==========================================
// VERIFICATION & RANKING SYSTEM
// ==========================================

import { VerificationService } from './verificationService';
import { RankService } from './rankService';
import { HandicapService } from './handicapService';
import { StatisticsService } from './statisticsService';

export const verificationService = new VerificationService();
export const rankService = new RankService();
export const handicapService = new HandicapService();
export const statisticsService = new StatisticsService();

// ==========================================
// WALLET & PAYMENT SYSTEM
// ==========================================

import { WalletService } from './walletService';
import { PaymentService } from './paymentService';
import { TransactionService } from './transactionService';
import { SpaPointsService } from './spaPointsService';

export const walletService = new WalletService();
export const paymentService = new PaymentService();
export const transactionService = new TransactionService();
export const spaPointsService = new SpaPointsService();

// ==========================================
// COMMUNICATION & NOTIFICATIONS
// ==========================================

import { NotificationService } from './notificationService';
import { EmailService } from './emailService';
import { MessageService } from './messageService';
import { AlertService } from './alertService';

export const notificationService = new NotificationService();
export const emailService = new EmailService();
export const messageService = new MessageService();
export const alertService = new AlertService();

// ==========================================
// DATA & STORAGE MANAGEMENT
// ==========================================

import { StorageService } from './storageService';
import { CacheService } from './cacheService';
import { BackupService } from './backupService';
import { SyncService } from './syncService';

export const storageService = new StorageService();
export const cacheService = new CacheService();
export const backupService = new BackupService();
export const syncService = new SyncService();

// ==========================================
// ANALYTICS & REPORTING
// ==========================================

import { AnalyticsService } from './analyticsService';
import { ReportingService } from './reportingService';
import { MetricsService } from './metricsService';
import { AuditService } from './auditService';

export const analyticsService = new AnalyticsService();
export const reportingService = new ReportingService();
export const metricsService = new MetricsService();
export const auditService = new AuditService();

// ==========================================
// DASHBOARD & UI HELPERS
// ==========================================

import { DashboardService } from './dashboardService';
import { SearchService } from './searchService';
import { FilterService } from './filterService';
import { ThemeService } from './themeService';

export const dashboardService = new DashboardService();
export const searchService = new SearchService();
export const filterService = new FilterService();
export const themeService = new ThemeService();

// ==========================================
// MOBILE & OFFLINE CAPABILITIES
// ==========================================

import { OfflineService } from './offlineService';
import { WebSocketService } from './webSocketService';
import { PushNotificationService } from './pushNotificationService';

export const offlineService = new OfflineService();
export const webSocketService = new WebSocketService();
export const pushNotificationService = new PushNotificationService();

// ==========================================
// SECURITY & VALIDATION
// ==========================================

import { SecurityService } from './securityService';
import { ValidationService } from './validationService';
import { PermissionService } from './permissionService';

export const securityService = new SecurityService();
export const validationService = new ValidationService();
export const permissionService = new PermissionService();

// ==========================================
// SERVICES DIRECTORY MAP
// ==========================================

/**
 * COMPLETE SERVICES MAP (43 total services)
 * ========================================
 * 
 * 🔐 AUTHENTICATION (4 services):
 * - userService: User management, profiles, authentication
 * - authService: Login, logout, session management
 * - profileService: User profile data, avatars, preferences
 * - settingsService: User settings, configurations
 * 
 * 🏆 TOURNAMENTS (4 services):
 * - tournamentService: Tournament CRUD, brackets, scheduling
 * - challengeService: Challenge system, invitations, responses
 * - matchService: Match management, scoring, results
 * - tableService: Table assignments, availability
 * 
 * 🏢 CLUBS (3 services):
 * - clubService: Club management, info, membership
 * - memberService: Member management, roles, permissions
 * - roleService: Role definitions, access control
 * 
 * ⭐ VERIFICATION (4 services):
 * - verificationService: Rank verification, evidence submission
 * - rankService: Ranking system, ELO calculations
 * - handicapService: Handicap calculations, adjustments
 * - statisticsService: Player statistics, performance metrics
 * 
 * 💰 PAYMENTS (4 services):
 * - walletService: Wallet management, balance tracking
 * - paymentService: Payment processing, transactions
 * - transactionService: Transaction history, records
 * - spaPointsService: SPA points system, rewards
 * 
 * 📢 COMMUNICATION (4 services):
 * - notificationService: In-app notifications, alerts
 * - emailService: Email sending, templates
 * - messageService: Direct messaging, chat
 * - alertService: System alerts, warnings
 * 
 * 💾 DATA MANAGEMENT (4 services):
 * - storageService: File storage, media uploads
 * - cacheService: Data caching, performance optimization
 * - backupService: Data backup, recovery
 * - syncService: Data synchronization, offline support
 * 
 * 📊 ANALYTICS (4 services):
 * - analyticsService: User analytics, behavior tracking
 * - reportingService: Report generation, data export
 * - metricsService: Performance metrics, KPIs
 * - auditService: Audit trails, activity logging
 * 
 * 🖥️ DASHBOARD (4 services):
 * - dashboardService: Dashboard data aggregation
 * - searchService: Search functionality, indexing
 * - filterService: Data filtering, sorting
 * - themeService: Theme management, UI preferences
 * 
 * 📱 MOBILE (3 services):
 * - offlineService: Offline functionality, data sync
 * - webSocketService: Real-time communications
 * - pushNotificationService: Push notifications
 * 
 * 🔒 SECURITY (3 services):
 * - securityService: Security utilities, encryption
 * - validationService: Data validation, sanitization
 * - permissionService: Permission checks, access control
 */

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type ServiceCategory = 
  | 'authentication'
  | 'tournaments' 
  | 'clubs'
  | 'verification'
  | 'payments'
  | 'communication'
  | 'data'
  | 'analytics'
  | 'dashboard'
  | 'mobile'
  | 'security';

export interface ServiceInfo {
  name: string;
  category: ServiceCategory;
  description: string;
  dependencies?: string[];
  status: 'active' | 'deprecated' | 'experimental';
}

// ==========================================
// SERVICES METADATA
// ==========================================

export const servicesMetadata: Record<string, ServiceInfo> = {
  userService: {
    name: 'User Service',
    category: 'authentication',
    description: 'Complete user management including profiles, authentication, and user data',
    status: 'active'
  },
  tournamentService: {
    name: 'Tournament Service', 
    category: 'tournaments',
    description: 'Tournament management including creation, brackets, and scheduling',
    dependencies: ['userService', 'clubService'],
    status: 'active'
  },
  // Add more metadata as needed...
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get service by name
 */
export function getService(serviceName: string): any {
  const services: Record<string, any> = {
    userService,
    authService,
    profileService,
    settingsService,
    tournamentService,
    challengeService,
    matchService,
    tableService,
    clubService,
    memberService,
    roleService,
    verificationService,
    rankService,
    handicapService,
    statisticsService,
    walletService,
    paymentService,
    transactionService,
    spaPointsService,
    notificationService,
    emailService,
    messageService,
    alertService,
    storageService,
    cacheService,
    backupService,
    syncService,
    analyticsService,
    reportingService,
    metricsService,
    auditService,
    dashboardService,
    searchService,
    filterService,
    themeService,
    offlineService,
    webSocketService,
    pushNotificationService,
    securityService,
    validationService,
    permissionService
  };
  
  return services[serviceName];
}

/**
 * Get services by category
 */
export function getServicesByCategory(category: ServiceCategory): any[] {
  return Object.values(servicesMetadata)
    .filter(service => service.category === category)
    .map(service => getService(service.name.replace(' ', '').toLowerCase() + 'Service'));
}

/**
 * List all available services
 */
export function listAllServices(): string[] {
  return Object.keys(servicesMetadata);
}

// ==========================================
// EXPORTS SUMMARY
// ==========================================

export default {
  // Authentication
  userService,
  authService,
  profileService,
  settingsService,
  
  // Tournaments
  tournamentService,
  challengeService,
  matchService,
  tableService,
  
  // Clubs
  clubService,
  memberService,
  roleService,
  
  // Verification
  verificationService,
  rankService,
  handicapService,
  statisticsService,
  
  // Payments
  walletService,
  paymentService,
  transactionService,
  spaPointsService,
  
  // Communication
  notificationService,
  emailService,
  messageService,
  alertService,
  
  // Data Management
  storageService,
  cacheService,
  backupService,
  syncService,
  
  // Analytics
  analyticsService,
  reportingService,
  metricsService,
  auditService,
  
  // Dashboard
  dashboardService,
  searchService,
  filterService,
  themeService,
  
  // Mobile
  offlineService,
  webSocketService,
  pushNotificationService,
  
  // Security
  securityService,
  validationService,
  permissionService,
  
  // Utilities
  getService,
  getServicesByCategory,
  listAllServices,
  servicesMetadata
};
