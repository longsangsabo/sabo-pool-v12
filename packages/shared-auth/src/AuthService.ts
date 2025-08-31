/**
 * SABO Pool Arena - Consolidated Authentication Service
 * 
 * This service consolidates authentication logic from:
 * - apps/sabo-user/src/hooks/useAuth.tsx
 * - apps/sabo-user/src/hooks/useOptimizedAuth.ts
 * - packages/shared-auth/src/auth-service.ts
 * - apps/sabo-user/src/utils/authStateCleanup.ts
 * 
 * Features:
 * - Unified authentication methods for email, phone, OAuth
 * - Session management with automatic refresh
 * - Error handling and retry logic
 * - Profile management integration
 * - Admin role checking and permissions
 * - Performance optimizations with caching
 */

import { SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
// import { // ServiceCacheManager, // CacheInvalidationManager } from '@sabo/shared-business';
import { AuthError } from './AuthError';
import {
  User,
  UserProfile,
  AuthResponse,
  // OAuthConfig, - unused
  // PhoneAuthConfig, - unused
  AuthConfigOptions,
  UserRole,
  PermissionContext,
  AuthMetrics,
} from './auth-types';

/**
 * Consolidated Authentication Service
 * Handles all authentication operations with caching and performance optimizations
 */
export class AuthService {
  private supabase: SupabaseClient;
  private config: AuthConfigOptions;
  private metrics: AuthMetrics;
  private sessionCache = new Map<string, { session: Session; timestamp: number }>();
  private profileCache = new Map<string, { profile: UserProfile; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseClient: SupabaseClient, config: AuthConfigOptions = {}) {
    this.supabase = supabaseClient;
    this.config = {
      autoRefresh: true,
      persistSession: true,
      detectSessionInUrl: true,
      debug: false,
      ...config,
    };
    this.metrics = this.initializeMetrics();
  }

  /**
   * Email/Password Authentication
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    const startTime = Date.now();
    this.metrics.signInAttempts++;

    try {
      // Validate input
      this.validateEmail(email);
      this.validatePassword(password);

      // Check cache for recent attempts
      // const cacheKey = ServiceCacheManager.generateKey('auth:signin', email);
      // const cached = ServiceCacheManager.paymentCache.get(cacheKey);
      // if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cooldown
      //   throw new AuthError('Please wait before trying again', 'RATE_LIMITED');
      // }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.metrics.signInFailures++;
        this.metrics.errorCodes[error.message] = (this.metrics.errorCodes[error.message] || 0) + 1;
        
        // Cache failed attempt
        // // ServiceCacheManager.paymentCache.set(cacheKey, { timestamp: Date.now() }, 30000);
        
        throw this.transformAuthError(error);
      }

      if (!data.user || !data.session) {
        throw new AuthError('Invalid response from authentication service', 'AUTH_RESPONSE_ERROR');
      }

      // Cache successful session
      this.cacheSession(data.session);
      
      // Load and cache user profile
      const profile = await this.loadUserProfile(data.user.id);
      
      this.metrics.signInSuccesses++;
      this.metrics.responseTime.push(Date.now() - startTime);

      // Clear any rate limit cache on success
      // // ServiceCacheManager.paymentCache.delete(cacheKey);

      return {
        data: {
          user: data.user as User,
          session: data.session,
          profile: profile || undefined,
        },
      };
    } catch (error) {
      this.metrics.signInFailures++;
      this.metrics.responseTime.push(Date.now() - startTime);
      
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  async signUpWithEmail(
    email: string, 
    password: string, 
    fullName?: string, 
    referralCode?: string
  ): Promise<AuthResponse> {
    const startTime = Date.now();
    this.metrics.signUpAttempts++;

    try {
      // Validate input
      this.validateEmail(email);
      this.validatePassword(password);
      if (fullName) this.validateFullName(fullName);

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: this.config.redirectUrls?.emailSignup,
          data: {
            full_name: fullName,
            referral_code: referralCode,
          },
        },
      });

      if (error) {
        this.metrics.signUpFailures++;
        this.metrics.errorCodes[error.message] = (this.metrics.errorCodes[error.message] || 0) + 1;
        throw this.transformAuthError(error);
      }

      if (data.user && data.session) {
        // Cache session
        this.cacheSession(data.session);
        
        // Create initial profile
        const profile = await this.createInitialProfile(data.user, { fullName, referralCode });
        
        this.metrics.signUpSuccesses++;
        this.metrics.responseTime.push(Date.now() - startTime);

        return {
          data: {
            user: data.user as User,
            session: data.session,
            profile: profile || undefined,
          },
        };
      }

      // Email verification required
      this.metrics.signUpSuccesses++;
      return {
        data: {
          user: data.user as User,
          session: data.session || undefined,
        },
      };
    } catch (error) {
      this.metrics.signUpFailures++;
      this.metrics.responseTime.push(Date.now() - startTime);
      
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  /**
   * Phone Authentication
   */
  async signInWithPhone(phone: string, password?: string): Promise<AuthResponse> {
    try {
      const formattedPhone = this.formatPhoneToE164(phone);
      
      if (password) {
        // Password-based phone login
        return await this.signInWithPhonePassword(formattedPhone, password);
      } else {
        // OTP-based phone login
        return await this.requestPhoneOtp(formattedPhone);
      }
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  async signInWithPhonePassword(phone: string, password: string): Promise<AuthResponse> {
    try {
      const formattedPhone = this.formatPhoneToE164(phone);
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password,
      });

      if (error) throw this.transformAuthError(error);

      if (data.user && data.session) {
        this.cacheSession(data.session);
        const profile = await this.loadUserProfile(data.user.id);

        return {
          data: {
            user: data.user as User,
            session: data.session,
            profile: profile || undefined,
          },
        };
      }

      throw new AuthError('Invalid phone or password', 'INVALID_CREDENTIALS');
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  async requestPhoneOtp(phone: string): Promise<AuthResponse> {
    try {
      const formattedPhone = this.formatPhoneToE164(phone);
      
      const { data, error } = await this.supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: this.config.phoneAuth?.defaultChannel || 'sms',
        },
      });

      if (error) throw this.transformAuthError(error);

      return {
        data: {
          user: data.user as User,
          session: data.session,
        },
      };
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  async verifyPhoneOtp(phone: string, token: string): Promise<AuthResponse> {
    try {
      const formattedPhone = this.formatPhoneToE164(phone);
      
      const { data, error } = await this.supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw this.transformAuthError(error);

      if (data.user && data.session) {
        this.cacheSession(data.session);
        const profile = await this.loadUserProfile(data.user.id);

        return {
          data: {
            user: data.user as User,
            session: data.session,
            profile,
          },
        };
      }

      throw new AuthError('Invalid verification code', 'INVALID_OTP');
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  /**
   * OAuth Authentication
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.config.redirectUrls?.emailLogin,
          ...this.config.oauthProviders?.google,
        },
      });

      if (error) throw this.transformAuthError(error);

      return {
        data: {
          user: data.user as User,
          session: data.session,
        },
      };
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  async signInWithFacebook(): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: this.config.redirectUrls?.emailLogin,
          ...this.config.oauthProviders?.facebook,
        },
      });

      if (error) throw this.transformAuthError(error);

      return {
        data: {
          user: data.user as User,
          session: data.session,
        },
      };
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  /**
   * Session Management
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check cache first
      const { data: { user } } = await this.supabase.auth.getUser();
      return user as User || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        this.cacheSession(session);
      }
      
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  async refreshSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        this.cacheSession(data.session);
      }
      
      return data.session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  async signOut(scope: 'global' | 'local' = 'global'): Promise<void> {
    try {
      // Clear caches first
      this.clearCaches();
      
      // Sign out from Supabase
      await this.supabase.auth.signOut({ scope });
      
      // Clear browser storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if sign out fails, clear local caches
      this.clearCaches();
      throw error;
    }
  }

  /**
   * Profile Management
   */
  async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cached = this.profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        this.metrics.cacheHitRate++;
        return cached.profile;
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore not found error
        throw error;
      }

      const profile = data as UserProfile;
      
      if (profile) {
        // Cache the profile
        this.profileCache.set(userId, {
          profile,
          timestamp: Date.now(),
        });
      }

      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const profile = data as UserProfile;
      
      // Update cache
      this.profileCache.set(userId, {
        profile,
        timestamp: Date.now(),
      });

      // Invalidate related caches
      // // CacheInvalidationManager.invalidateELOData(userId);

      return profile;
    } catch (error) {
      throw this.transformAuthError(error);
    }
  }

  async createInitialProfile(
    user: SupabaseUser, 
    metadata: { fullName?: string; referralCode?: string }
  ): Promise<UserProfile> {
    try {
      const profile: Partial<UserProfile> = {
        user_id: user.id,
        full_name: metadata.fullName || user.user_metadata?.full_name,
        username: user.user_metadata?.username,
        avatar_url: user.user_metadata?.avatar_url,
        phone: user.phone,
        role: 'user',
        is_active: true,
        referral_code: this.generateReferralCode(),
        referred_by: metadata.referralCode,
        spa_points: 0,
        elo_rating: 1000, // Starting ELO
        current_rank: 'K',
        total_tournaments: 0,
        tournaments_won: 0,
        win_rate: 0,
        longest_win_streak: 0,
        current_win_streak: 0,
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;

      const createdProfile = data as UserProfile;
      
      // Cache the new profile
      this.profileCache.set(user.id, {
        profile: createdProfile,
        timestamp: Date.now(),
      });

      return createdProfile;
    } catch (error) {
      throw this.transformAuthError(error);
    }
  }

  /**
   * Password Management
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      this.validateEmail(email);

      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: this.config.redirectUrls?.passwordReset,
      });

      if (error) throw this.transformAuthError(error);

      return { data };
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  async updatePassword(password: string): Promise<AuthResponse> {
    try {
      this.validatePassword(password);

      const { data, error } = await this.supabase.auth.updateUser({
        password,
      });

      if (error) throw this.transformAuthError(error);

      return {
        data: {
          user: data.user as User,
        },
      };
    } catch (error) {
      return {
        error: this.transformAuthError(error),
      };
    }
  }

  /**
   * Admin & Role Management
   */
  isAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.app_metadata?.role === 'admin' || 
           user.app_metadata?.role === 'super_admin' ||
           user.app_metadata?.is_admin === true;
  }

  isSuperAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.app_metadata?.role === 'super_admin' ||
           user.app_metadata?.is_super_admin === true;
  }

  hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    return user.app_metadata?.role === role;
  }

  hasPermission(user: User | null, context: PermissionContext): boolean {
    if (!user) return false;
    
    // Super admins have all permissions
    if (this.isSuperAdmin(user)) return true;
    
    // Admins have most permissions
    if (this.isAdmin(user)) {
      const restrictedActions = ['manage', 'delete'];
      const restrictedResources = ['users', 'roles', 'permissions'];
      
      if (restrictedResources.includes(context.resource) && 
          restrictedActions.includes(context.action)) {
        return this.isSuperAdmin(user);
      }
      return true;
    }
    
    // Regular users have limited permissions
    const userRole = user.app_metadata?.role || 'user';
    return this.checkRolePermission(userRole, context);
  }

  requireAdminAccess(user: User | null): void {
    if (!this.isAdmin(user)) {
      throw new AuthError('Admin access required', 'ADMIN_ACCESS_REQUIRED');
    }
  }

  /**
   * Utility Methods
   */
  private cacheSession(session: Session): void {
    if (session.user?.id) {
      this.sessionCache.set(session.user.id, {
        session,
        timestamp: Date.now(),
      });
    }
  }

  private clearCaches(): void {
    this.sessionCache.clear();
    this.profileCache.clear();
    // Clear service caches
    // // ServiceCacheManager.clearAll();
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AuthError('Invalid email format', 'INVALID_EMAIL');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < (this.config.security?.passwordMinLength || 6)) {
      throw new AuthError('Password too short', 'PASSWORD_TOO_SHORT');
    }
  }

  private validateFullName(fullName: string): void {
    if (fullName.length < 2 || fullName.length > 100) {
      throw new AuthError('Full name must be between 2 and 100 characters', 'INVALID_FULL_NAME');
    }
  }

  private formatPhoneToE164(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle Vietnamese phone numbers
    if (digits.startsWith('84')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+84${digits.slice(1)}`;
    } else if (digits.length === 9) {
      return `+84${digits}`;
    }
    
    return `+${digits}`;
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private transformAuthError(error: any): AuthError {
    const authError = new AuthError(
      error.message || 'Authentication failed',
      error.code || 'AUTH_ERROR'
    );
    
    authError.details = error.details;
    authError.hint = error.hint;
    authError.status = error.status;
    
    return authError;
  }

  private checkRolePermission(role: UserRole, context: PermissionContext): boolean {
    // Implement role-based permission checking
    // This would be connected to a permissions system
    const basicPermissions = {
      user: ['read'],
      moderator: ['read', 'update'],
      admin: ['read', 'update', 'create', 'delete'],
      super_admin: ['read', 'update', 'create', 'delete', 'manage'],
    };
    
    const rolePermissions = basicPermissions[role] || [];
    return rolePermissions.includes(context.action);
  }

  private initializeMetrics(): AuthMetrics {
    return {
      signInAttempts: 0,
      signInSuccesses: 0,
      signInFailures: 0,
      signUpAttempts: 0,
      signUpSuccesses: 0,
      signUpFailures: 0,
      sessionDuration: [],
      errorCodes: {},
      responseTime: [],
      cacheHitRate: 0,
      retryAttempts: 0,
      circuitBreakerTrips: 0,
    };
  }

  /**
   * Get authentication metrics
   */
  getMetrics(): AuthMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (for testing or periodic resets)
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }
}

export default AuthService;
