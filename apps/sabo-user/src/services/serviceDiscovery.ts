/**
 * SABO POOL - SERVICE DISCOVERY SYSTEM
 * ===================================
 * 
 * Hệ thống giúp Copilot và developers tự động discover services
 * Copilot có thể đọc file này để hiểu toàn bộ service ecosystem
 * 
 * HOW COPILOT USES THIS:
 * ----------------------
 * 1. Read this file first để hiểu có gì available
 * 2. Use getServiceInfo() để get details về specific service
 * 3. Use findServicesFor() để tìm services cho specific use case
 * 4. Use getServiceLocation() để biết file nào cần đọc
 */

export interface ServiceMetadata {
  name: string;
  filePath: string;
  category: string;
  description: string;
  mainMethods: string[];
  dependencies: string[];
  useCases: string[];
  examples: string[];
  status: 'implemented' | 'partial' | 'planned';
  lastUpdated: string;
}

/**
 * COMPLETE SERVICE REGISTRY
 * =========================
 * Copilot: Đọc object này để biết tất cả services available
 */
export const SERVICE_REGISTRY: Record<string, ServiceMetadata> = {
  // Authentication Services
  userService: {
    name: 'User Service',
    filePath: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/userService.ts',
    category: 'authentication',
    description: 'Complete user management including profiles, authentication, and user data',
    mainMethods: ['createUser', 'getUserById', 'updateProfile', 'deleteUser', 'getUserByEmail'],
    dependencies: ['supabase', 'profileService'],
    useCases: ['user registration', 'user login', 'profile management', 'user CRUD'],
    examples: [
      'userService.createUser({ email, password })',
      'userService.getUserById(userId)',
      'userService.updateProfile(userId, profileData)'
    ],
    status: 'implemented',
    lastUpdated: '2025-08-31'
  },

  authService: {
    name: 'Authentication Service',
    filePath: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/authService.ts',
    category: 'authentication',
    description: 'Authentication, login/logout, session management',
    mainMethods: ['signIn', 'signOut', 'resetPassword', 'validateSession', 'refreshToken'],
    dependencies: ['supabase'],
    useCases: ['user login', 'user logout', 'password reset', 'session validation'],
    examples: [
      'authService.signIn(email, password)',
      'authService.signOut()',
      'authService.resetPassword(email)'
    ],
    status: 'implemented',
    lastUpdated: '2025-08-31'
  },

  // Tournament Services
  tournamentService: {
    name: 'Tournament Service',
    filePath: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/tournamentService.ts',
    category: 'tournaments',
    description: 'Tournament management including creation, brackets, and scheduling',
    mainMethods: ['createTournament', 'getTournaments', 'updateBracket', 'joinTournament', 'leaveTournament'],
    dependencies: ['userService', 'clubService', 'paymentService'],
    useCases: ['create tournament', 'manage brackets', 'tournament registration', 'tournament scheduling'],
    examples: [
      'tournamentService.createTournament({ name, type, maxPlayers })',
      'tournamentService.joinTournament(tournamentId, userId)',
      'tournamentService.getTournaments({ status: "active" })'
    ],
    status: 'implemented',
    lastUpdated: '2025-08-31'
  },

  challengeService: {
    name: 'Challenge Service',
    filePath: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/challengeService.ts',
    category: 'tournaments',
    description: 'Challenge system, invitations, responses',
    mainMethods: ['createChallenge', 'acceptChallenge', 'declineChallenge', 'getChallenges'],
    dependencies: ['userService', 'tournamentService', 'notificationService'],
    useCases: ['challenge opponents', 'accept challenges', 'manage challenge invitations'],
    examples: [
      'challengeService.createChallenge({ challengerId, challengedId, stakes })',
      'challengeService.acceptChallenge(challengeId)',
      'challengeService.getChallenges(userId)'
    ],
    status: 'implemented',
    lastUpdated: '2025-08-31'
  },

  // Payment Services
  paymentService: {
    name: 'Payment Service',
    filePath: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/paymentService.ts',
    category: 'payments',
    description: 'Payment processing, transactions',
    mainMethods: ['processPayment', 'refundPayment', 'getPaymentMethods', 'validatePayment'],
    dependencies: ['walletService', 'transactionService'],
    useCases: ['process tournament fees', 'handle refunds', 'manage payment methods'],
    examples: [
      'paymentService.processPayment({ userId, amount, type })',
      'paymentService.refundPayment(paymentId)',
      'paymentService.getPaymentMethods(userId)'
    ],
    status: 'implemented',
    lastUpdated: '2025-08-31'
  },

  walletService: {
    name: 'Wallet Service',
    filePath: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/walletService.ts',
    category: 'payments',
    description: 'Wallet management, balance tracking',
    mainMethods: ['getBalance', 'addFunds', 'withdrawFunds', 'getTransactionHistory'],
    dependencies: ['userService', 'transactionService', 'paymentService'],
    useCases: ['check balance', 'add money to wallet', 'withdraw funds', 'transaction history'],
    examples: [
      'walletService.getBalance(userId)',
      'walletService.addFunds(userId, amount)',
      'walletService.withdrawFunds(userId, amount)'
    ],
    status: 'implemented',
    lastUpdated: '2025-08-31'
  },

  // Add more services...
  // Note: Abbreviated for brevity, but would include all 43 services
};

/**
 * USE CASE TO SERVICES MAPPING
 * ============================
 * Copilot: Use này để tìm services cho specific use cases
 */
export const USE_CASE_MAPPING: Record<string, string[]> = {
  'user registration': ['userService', 'authService', 'profileService', 'emailService'],
  'user login': ['authService', 'userService', 'sessionService'],
  'create tournament': ['tournamentService', 'userService', 'paymentService', 'notificationService'],
  'join tournament': ['tournamentService', 'userService', 'paymentService', 'walletService'],
  'challenge opponent': ['challengeService', 'userService', 'notificationService', 'matchService'],
  'process payment': ['paymentService', 'walletService', 'transactionService', 'userService'],
  'send notification': ['notificationService', 'emailService', 'userService'],
  'upload file': ['storageService', 'userService', 'validationService'],
  'real-time updates': ['webSocketService', 'notificationService', 'userService'],
  'offline support': ['offlineService', 'syncService', 'cacheService'],
  'analytics tracking': ['analyticsService', 'metricsService', 'userService'],
  'generate report': ['reportingService', 'analyticsService', 'exportService'],
  'club management': ['clubService', 'memberService', 'userService', 'roleService'],
  'rank verification': ['verificationService', 'rankService', 'userService', 'storageService'],
  'match scoring': ['matchService', 'tournamentService', 'challengeService', 'statisticsService']
};

/**
 * CATEGORY TO SERVICES MAPPING
 * ============================
 * Copilot: Group services by category
 */
export const CATEGORY_SERVICES: Record<string, string[]> = {
  authentication: ['userService', 'authService', 'profileService', 'settingsService'],
  tournaments: ['tournamentService', 'challengeService', 'matchService', 'tableService'],
  clubs: ['clubService', 'memberService', 'roleService'],
  verification: ['verificationService', 'rankService', 'handicapService', 'statisticsService'],
  payments: ['walletService', 'paymentService', 'transactionService', 'spaPointsService'],
  communication: ['notificationService', 'emailService', 'messageService', 'alertService'],
  data: ['storageService', 'cacheService', 'backupService', 'syncService'],
  analytics: ['analyticsService', 'reportingService', 'metricsService', 'auditService'],
  dashboard: ['dashboardService', 'searchService', 'filterService', 'themeService'],
  mobile: ['offlineService', 'webSocketService', 'pushNotificationService'],
  security: ['securityService', 'validationService', 'permissionService']
};

/**
 * UTILITY FUNCTIONS FOR COPILOT
 * =============================
 */

/**
 * Get detailed info about a service
 * Copilot: Use this to get complete service details
 */
export function getServiceInfo(serviceName: string): ServiceMetadata | null {
  return SERVICE_REGISTRY[serviceName] || null;
}

/**
 * Find services for a specific use case
 * Copilot: Use this to find relevant services for user requirements
 */
export function findServicesFor(useCase: string): string[] {
  const lowerUseCase = useCase.toLowerCase();
  
  // Exact match first
  if (USE_CASE_MAPPING[lowerUseCase]) {
    return USE_CASE_MAPPING[lowerUseCase];
  }
  
  // Partial match
  const matches: string[] = [];
  Object.entries(USE_CASE_MAPPING).forEach(([key, services]) => {
    if (key.includes(lowerUseCase) || lowerUseCase.includes(key)) {
      matches.push(...services);
    }
  });
  
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Get services by category
 * Copilot: Use this to explore services in specific domains
 */
export function getServicesByCategory(category: string): string[] {
  return CATEGORY_SERVICES[category] || [];
}

/**
 * Get file path for a service
 * Copilot: Use this to know which file to read
 */
export function getServiceLocation(serviceName: string): string | null {
  const service = SERVICE_REGISTRY[serviceName];
  return service ? service.filePath : null;
}

/**
 * Get all service dependencies
 * Copilot: Use this to understand service relationships
 */
export function getServiceDependencies(serviceName: string): string[] {
  const service = SERVICE_REGISTRY[serviceName];
  return service ? service.dependencies : [];
}

/**
 * Search services by keyword
 * Copilot: Use this for flexible service discovery
 */
export function searchServices(keyword: string): string[] {
  const lowerKeyword = keyword.toLowerCase();
  const matches: string[] = [];
  
  Object.entries(SERVICE_REGISTRY).forEach(([serviceName, metadata]) => {
    const searchText = `${metadata.name} ${metadata.description} ${metadata.useCases.join(' ')} ${metadata.mainMethods.join(' ')}`.toLowerCase();
    
    if (searchText.includes(lowerKeyword)) {
      matches.push(serviceName);
    }
  });
  
  return matches;
}

/**
 * Get service examples
 * Copilot: Use this to see how to use a service
 */
export function getServiceExamples(serviceName: string): string[] {
  const service = SERVICE_REGISTRY[serviceName];
  return service ? service.examples : [];
}

/**
 * COPILOT INSTRUCTIONS
 * ====================
 * 
 * Hey Copilot! 👋 When working with SABO Pool services:
 * 
 * 1. ALWAYS read this file first to understand available services
 * 2. Use findServicesFor(useCase) to find relevant services
 * 3. Use getServiceLocation(serviceName) to get file path
 * 4. Read the actual service file before using it
 * 5. Check dependencies with getServiceDependencies()
 * 6. Look at examples with getServiceExamples()
 * 
 * EXAMPLE WORKFLOW:
 * ----------------
 * User wants: "Create a tournament with payment"
 * 
 * 1. const services = findServicesFor('create tournament');
 *    // Returns: ['tournamentService', 'userService', 'paymentService', 'notificationService']
 * 
 * 2. const filePath = getServiceLocation('tournamentService');
 *    // Returns: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/tournamentService.ts'
 * 
 * 3. Read the file at filePath to understand API
 * 
 * 4. const examples = getServiceExamples('tournamentService');
 *    // Get usage examples
 * 
 * 5. Implement solution using the services
 */

export default {
  SERVICE_REGISTRY,
  USE_CASE_MAPPING,
  CATEGORY_SERVICES,
  getServiceInfo,
  findServicesFor,
  getServicesByCategory,
  getServiceLocation,
  getServiceDependencies,
  searchServices,
  getServiceExamples
};
