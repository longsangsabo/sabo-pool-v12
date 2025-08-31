// SABO Pool Arena - Shared Authentication Types
// Consolidated authentication interfaces and types

import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'super_admin' | 'moderator';

export interface User extends Omit<SupabaseUser, 'app_metadata'> {
  id: string;
  email?: string;
  phone?: string;
  app_metadata?: {
    provider?: string;
    role?: UserRole;
    is_admin?: boolean;
    is_super_admin?: boolean;
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  referral_code?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  // SABO-specific fields
  spa_points: number;
  elo_rating: number;
  current_rank: string;
  total_tournaments: number;
  tournaments_won: number;
  win_rate: number;
  longest_win_streak: number;
  current_win_streak: number;
}

export interface AuthState {
  user: User | null;
  session: SupabaseSession | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  lastLoginMethod: string | null;
  retryCount: number;
}

export interface AuthCredentials {
  email?: string;
  phone?: string;
  password: string;
  fullName?: string;
  referralCode?: string;
}

export interface AuthResponse {
  data?: {
    user?: User;
    session?: SupabaseSession;
    profile?: UserProfile;
  };
  error?: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
    status?: number;
  };
}

export interface OAuthConfig {
  provider: 'google' | 'facebook' | 'apple' | 'discord';
  options: {
    redirectTo: string;
    scopes?: string;
    queryParams?: Record<string, string>;
  };
}

export interface PhoneAuthConfig {
  phone: string;
  channel?: 'sms' | 'whatsapp';
  options?: {
    template?: string;
    captcha_token?: string;
  };
}

export interface AuthError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  context?: string;
}

export interface AuthServiceConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  redirectUrl?: string;
  emailRedirectTo?: string;
  phoneRedirectTo?: string;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
  debug?: boolean;
}

export interface PermissionContext {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, any>;
}

export interface Permission {
  id: string;
  role: UserRole;
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
  is_active: boolean;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inherit_from?: UserRole[];
}

// Auth Context Types
export interface AuthContextType extends AuthState {
  // Basic Auth Methods
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  
  // Phone Auth Methods
  signInWithPhone: (phone: string, password?: string) => Promise<AuthResponse>;
  signUpWithPhone: (phone: string, password?: string, fullName?: string, referralCode?: string) => Promise<AuthResponse>;
  signInWithPhonePassword: (phone: string, password: string) => Promise<AuthResponse>;
  requestPhoneOtp: (phone: string) => Promise<AuthResponse>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<AuthResponse>;
  
  // Email Auth Aliases
  signInWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signUpWithEmail: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<AuthResponse>;
  
  // OAuth Methods
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithFacebook: () => Promise<AuthResponse>;
  signInWithApple: () => Promise<AuthResponse>;
  
  // Account Management
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResponse>;
  refreshSession: () => Promise<void>;
  
  // Utility Methods
  clearError: () => void;
  retryLastAction: () => Promise<void>;
  handleAuthError: (error: any, context?: string) => string;
}

export interface AdminAuthContextType extends AuthContextType {
  // Admin-specific state
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  adminPermissions: Permission[];
  
  // Admin-specific methods
  hasRole: (role: UserRole) => boolean;
  hasPermission: (context: PermissionContext) => boolean;
  switchRole: (role: UserRole) => Promise<void>;
  checkAdminAccess: () => boolean;
  requireAdminAccess: () => void;
  grantRole: (userId: string, role: UserRole) => Promise<void>;
  revokeRole: (userId: string, role: UserRole) => Promise<void>;
  
  // User Management
  getAllUsers: (filters?: Record<string, any>) => Promise<User[]>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
}

// Event Types for Auth State Changes
export interface AuthStateChangeEvent {
  type: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';
  user?: User;
  session?: SupabaseSession;
  timestamp: number;
}

export interface AuthEventHandler {
  (event: AuthStateChangeEvent): void | Promise<void>;
}

// Auth Configuration
export interface AuthConfigOptions {
  autoRefresh?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
  debug?: boolean;
  redirectUrls?: {
    emailSignup?: string;
    emailLogin?: string;
    phoneSignup?: string;
    phoneLogin?: string;
    passwordReset?: string;
  };
  oauthProviders?: {
    google?: OAuthConfig['options'];
    facebook?: OAuthConfig['options'];
    apple?: OAuthConfig['options'];
  };
  phoneAuth?: {
    enabled: boolean;
    defaultChannel: 'sms' | 'whatsapp';
    template?: string;
  };
  rateLimits?: {
    signInAttempts: number;
    signUpAttempts: number;
    passwordResetAttempts: number;
    otpRequestAttempts: number;
    timeWindowMinutes: number;
  };
  security?: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    sessionTimeoutMinutes: number;
    maxDevicesPerUser: number;
  };
}

// Auth Validation Types
export interface ValidationRule {
  field: string;
  validator: (value: any) => boolean | string;
  message?: string;
  required?: boolean;
}

export interface AuthValidationRules {
  email: ValidationRule[];
  phone: ValidationRule[];
  password: ValidationRule[];
  fullName: ValidationRule[];
  username: ValidationRule[];
}

// Auth Performance Metrics
export interface AuthMetrics {
  signInAttempts: number;
  signInSuccesses: number;
  signInFailures: number;
  signUpAttempts: number;
  signUpSuccesses: number;
  signUpFailures: number;
  sessionDuration: number[];
  errorCodes: Record<string, number>;
  responseTime: number[];
  cacheHitRate: number;
  retryAttempts: number;
  circuitBreakerTrips: number;
}
