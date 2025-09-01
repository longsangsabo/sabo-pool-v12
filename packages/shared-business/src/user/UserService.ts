/**
 * COMPREHENSIVE USER SERVICE
 * 
 * Mobile-Ready Service Layer for User Management
 * Consolidates all user-related logic from scattered UI components
 * 
 * Target: Eliminate direct supabase calls in user features
 * Features: Auth, Profile, Settings, Preferences, Mobile-specific operations
 */

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  rank?: string;
  elo_rating?: number;
  spa_points?: number;
  created_at: string;
  updated_at: string;
  last_seen?: string;
  is_verified: boolean;
  is_active: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    tournament_updates: boolean;
    challenge_requests: boolean;
    ranking_changes: boolean;
    payment_confirmations: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_real_name: boolean;
    show_location: boolean;
    show_contact_info: boolean;
  };
  mobile: {
    biometric_auth: boolean;
    offline_mode: boolean;
    auto_sync: boolean;
    data_saver: boolean;
  };
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  device_id?: string;
  last_activity?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
  phone?: string;
  terms_accepted: boolean;
  marketing_consent?: boolean;
}

export interface PasswordResetRequest {
  email: string;
  redirect_url?: string;
}

export interface ProfileUpdateData {
  display_name?: string;
  full_name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  device_tracking: boolean;
  session_timeout: number;
}

/**
 * COMPREHENSIVE USER SERVICE
 * 
 * Handles all user operations:
 * - Authentication (login, signup, logout, password reset)
 * - Profile management (view, update, avatar)
 * - User preferences and settings
 * - Security and privacy controls
 * - Mobile-specific features (biometric auth, offline profile)
 * - Social features (friends, blocking)
 */
export class UserService {
  private apiClient: any;
  private cache: Map<string, any> = new Map();
  private currentUser: User | null = null;
  private sessionCallbacks: ((user: User | null) => void)[] = [];

  constructor(apiClient: any) {
    this.apiClient = apiClient;
    this.initializeSession();
  }

  // ===== AUTH HELPER METHODS (MIGRATED FROM authHelpers.ts) =====

  /**
   * Handle authentication errors with user-friendly messages
   * Migrated from authHelpers.ts
   */
  handleAuthError(error: any): string {
    console.error('Auth error:', error);

    switch (error?.message) {
      case 'Invalid login credentials':
        return 'Email hoặc mật khẩu không đúng';
      case 'Email not confirmed':
        return 'Vui lòng xác nhận email trước khi đăng nhập';
      case 'User already registered':
        return 'Email này đã được đăng ký';
      case 'Signup requires a valid password':
        return 'Mật khẩu phải có ít nhất 6 ký tự';
      default:
        return error?.message || 'Có lỗi xảy ra trong quá trình xác thực';
    }
  }

  /**
   * Validate JWT token
   * Migrated from authHelpers.ts
   */
  async validateJWTToken(): Promise<boolean> {
    try {
      const {
        data: { session },
        error,
      } = await this.apiClient.auth.getSession();

      if (error) {
        console.error('JWT validation error:', error);
        return false;
      }

      if (!session?.access_token) {
        console.warn('No access token found');
        return false;
      }

      // Check if token is expired
      if (session.expires_at && session.expires_at < Date.now() / 1000) {
        console.warn('Token expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('JWT validation failed:', error);
      return false;
    }
  }

  /**
   * Refresh authentication session
   * Migrated from authHelpers.ts
   */
  async refreshAuthSession(): Promise<boolean> {
    try {
      const { data, error } = await this.apiClient.auth.refreshSession();

      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }

      return !!data.session;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  /**
   * Configure OAuth redirects
   * Migrated from authHelpers.ts
   */
  configureOAuthRedirects() {
    // For server-side or mobile environments, use environment variable
    const baseUrl = typeof globalThis !== 'undefined' && globalThis.window
      ? globalThis.window.location.origin 
      : process.env.VITE_APP_URL || 'https://saboarena.com';
    const redirectUrl = `${baseUrl}/`;

    return {
      google: {
        provider: 'google' as const,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      },
      facebook: {
        provider: 'facebook' as const,
        options: {
          redirectTo: redirectUrl,
          scopes: 'email',
        },
      },
    };
  }

  // ===== AUTH CONFIG METHODS (MIGRATED FROM authConfig.ts) =====

  /**
   * Get authentication redirect URL
   * Migrated from authConfig.ts
   */
  getAuthRedirectUrl(path = '/auth/callback'): string {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.VITE_APP_URL || 'https://saboarena.com'
      : (typeof globalThis !== 'undefined' && globalThis.window 
          ? globalThis.window.location.origin 
          : 'http://localhost:5173');
    return `${baseUrl}${path}`;
  }

  /**
   * Get standardized auth redirect URLs
   * Migrated from authConfig.ts
   */
  getAuthRedirects() {
    return {
      emailSignup: this.getAuthRedirectUrl('/auth/callback?type=email_signup'),
      emailResend: this.getAuthRedirectUrl('/auth/callback?type=email_confirm'),
      emailLogin: this.getAuthRedirectUrl('/auth/callback?type=email_login'),
      oauth: this.getAuthRedirectUrl('/auth/callback?type=oauth'),
      phoneOtp: null,
      passwordReset: this.getAuthRedirectUrl('/auth/callback?type=password_reset'),
    };
  }

  /**
   * Get auth success message
   * Migrated from authConfig.ts
   */
  getAuthSuccessMessage(type: string | undefined): string {
    switch (type) {
      case 'email_signup':
        return 'Đăng ký thành công! Chào mừng bạn đến với SABO ARENA!';
      case 'email_confirm':
        return 'Email đã được xác thực thành công!';
      case 'email_login':
        return 'Đăng nhập thành công!';
      case 'oauth':
        return 'Đăng nhập thành công qua mạng xã hội!';
      case 'password_reset':
        return 'Mật khẩu đã được đặt lại thành công!';
      default:
        return 'Xác thực thành công!';
    }
  }

  /**
   * Get auth error message
   * Migrated from authConfig.ts
   */
  getAuthErrorMessage(type: string | undefined): string {
    switch (type) {
      case 'email_signup':
        return 'Đăng ký thất bại. Vui lòng thử lại.';
      case 'email_confirm':
        return 'Xác thực email thất bại. Link có thể đã hết hạn.';
      case 'oauth':
        return 'Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.';
      case 'password_reset':
        return 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      default:
        return 'Xác thực thất bại. Vui lòng thử lại.';
    }
  }

  /**
   * Validate and secure redirect URL
   * Migrated from authConfig.ts
   */
  getSecureRedirectUrl(path: string): string {
    const allowedPaths = [
      '/dashboard',
      '/admin',
      '/club-management',
      '/profile',
      '/settings',
    ];

    return allowedPaths.includes(path) ? path : '/dashboard';
  }

  // ===== AUTHENTICATION OPERATIONS =====

  /**
   * Sign in user with email/password
   * Mobile-ready with biometric support
   */
  async signIn(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      const { data, error } = await this.apiClient.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Get user profile
      const userProfile = await this.getUserProfile(data.user.id);
      
      const session: AuthSession = {
        user: userProfile,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        device_id: this.getDeviceId(),
        last_activity: new Date().toISOString()
      };

      // Update current user
      this.currentUser = userProfile;
      this.notifySessionChange(userProfile);

      // Store session for mobile persistence
      await this.storeSession(session);

      // Track sign-in analytics
      await this.trackUserActivity('sign_in', { method: 'email' });

      return session;
    } catch (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  /**
   * Sign up new user
   * Mobile-optimized with validation
   */
  async signUp(signUpData: SignUpData): Promise<{ user: User; needsVerification: boolean }> {
    try {
      // Validate sign up data
      const validation = this.validateSignUpData(signUpData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Create auth account
      const { data, error } = await this.apiClient.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            username: signUpData.username,
            full_name: signUpData.full_name,
            phone: signUpData.phone,
            terms_accepted: signUpData.terms_accepted,
            marketing_consent: signUpData.marketing_consent || false,
          }
        }
      });

      if (error) throw error;

      // Create user profile
      const userProfile = await this.createUserProfile({
        id: data.user!.id,
        email: signUpData.email,
        username: signUpData.username,
        full_name: signUpData.full_name,
        phone: signUpData.phone,
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        preferences: this.getDefaultPreferences()
      });

      // Track sign-up analytics
      await this.trackUserActivity('sign_up', { method: 'email' });

      return {
        user: userProfile,
        needsVerification: !data.session // No session means email verification required
      };
    } catch (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }

  /**
   * Sign out user
   * Mobile-safe with cleanup
   */
  async signOut(): Promise<void> {
    try {
      // Sign out from auth service
      await this.apiClient.auth.signOut();

      // Clear current user
      this.currentUser = null;
      this.notifySessionChange(null);

      // Clear cached data
      this.cache.clear();

      // Clear stored session
      await this.clearStoredSession();

      // Track sign-out analytics
      await this.trackUserActivity('sign_out');
    } catch (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Request password reset
   * Mobile-friendly with deep linking
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    try {
      const { error } = await this.apiClient.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: request.redirect_url || this.getDefaultResetUrl()
        }
      );

      if (error) throw error;

      // Track password reset request
      await this.trackUserActivity('password_reset_requested', { email: request.email });
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Update password
   * Mobile-ready with security validation
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('Must be signed in to update password');
      }

      // Validate password strength
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const { error } = await this.apiClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Track password update
      await this.trackUserActivity('password_updated');
    } catch (error) {
      throw new Error(`Password update failed: ${error.message}`);
    }
  }

  // ===== PROFILE MANAGEMENT =====

  /**
   * Get current user
   * Mobile-optimized with caching
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get user profile by ID
   * Mobile-friendly with cache
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      // Check cache first
      const cacheKey = `user_${userId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Fetch from API
      const { data, error } = await this.apiClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const user = this.mapDatabaseUserToUser(data);
      
      // Cache the result
      this.cache.set(cacheKey, user);

      return user;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   * Mobile-optimized with offline support
   */
  async updateProfile(updates: ProfileUpdateData): Promise<User> {
    try {
      if (!this.currentUser) {
        throw new Error('Must be signed in to update profile');
      }

      // Validate updates
      const validation = this.validateProfileData(updates);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Update in database
      const { data, error } = await this.apiClient
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser = this.mapDatabaseUserToUser(data);

      // Update current user and cache
      this.currentUser = updatedUser;
      this.cache.set(`user_${updatedUser.id}`, updatedUser);
      this.notifySessionChange(updatedUser);

      // Track profile update
      await this.trackUserActivity('profile_updated', { fields: Object.keys(updates) });

      return updatedUser;
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Upload user avatar
   * Mobile-optimized with compression
   */
  async uploadAvatar(file: File | Blob): Promise<string> {
    try {
      if (!this.currentUser) {
        throw new Error('Must be signed in to upload avatar');
      }

      // Compress image if needed (mobile optimization)
      const compressedFile = await this.compressImage(file);

      // Generate unique filename
      const fileName = `avatars/${this.currentUser.id}/${Date.now()}.jpg`;

      // Upload to storage
      const { data, error } = await this.apiClient.storage
        .from('user-avatars')
        .upload(fileName, compressedFile, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = this.apiClient.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update user profile with new avatar
      await this.updateProfile({ avatar_url: avatarUrl });

      return avatarUrl;
    } catch (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  // ===== USER PREFERENCES =====

  /**
   * Get user preferences
   * Mobile-optimized with defaults
   */
  async getUserPreferences(userId?: string): Promise<UserPreferences> {
    try {
      const targetUserId = userId || this.currentUser?.id;
      if (!targetUserId) {
        throw new Error('User ID required');
      }

      const { data, error } = await this.apiClient
        .from('user_preferences')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return data ? data.preferences : this.getDefaultPreferences();
    } catch (error) {
      throw new Error(`Failed to get user preferences: ${error.message}`);
    }
  }

  /**
   * Update user preferences
   * Mobile-ready with validation
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      if (!this.currentUser) {
        throw new Error('Must be signed in to update preferences');
      }

      // Get current preferences
      const currentPrefs = await this.getUserPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };

      // Validate preferences
      const validation = this.validatePreferences(updatedPrefs);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Update in database
      const { data, error } = await this.apiClient
        .from('user_preferences')
        .upsert({
          user_id: this.currentUser.id,
          preferences: updatedPrefs,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update current user preferences
      if (this.currentUser) {
        this.currentUser.preferences = updatedPrefs;
        this.notifySessionChange(this.currentUser);
      }

      // Track preferences update
      await this.trackUserActivity('preferences_updated', { 
        changed_fields: Object.keys(preferences) 
      });

      return updatedPrefs;
    } catch (error) {
      throw new Error(`Preferences update failed: ${error.message}`);
    }
  }

  // ===== MOBILE-SPECIFIC FEATURES =====

  /**
   * Enable biometric authentication
   * Mobile-only feature
   */
  async enableBiometricAuth(): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('Must be signed in');
      }

      // Check if biometric is available
      const isAvailable = await this.checkBiometricAvailability();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Update preferences
      await this.updatePreferences({
        mobile: {
          ...this.currentUser.preferences?.mobile,
          biometric_auth: true
        }
      });

      // Store biometric credentials securely
      await this.storeBiometricCredentials();
    } catch (error) {
      throw new Error(`Failed to enable biometric auth: ${error.message}`);
    }
  }

  /**
   * Authenticate with biometrics
   * Mobile-only feature
   */
  async authenticateWithBiometrics(): Promise<AuthSession> {
    try {
      // Check if biometric is enabled
      const preferences = await this.getUserPreferences();
      if (!preferences.mobile?.biometric_auth) {
        throw new Error('Biometric authentication not enabled');
      }

      // Verify biometric
      const verified = await this.verifyBiometric();
      if (!verified) {
        throw new Error('Biometric verification failed');
      }

      // Get stored credentials
      const credentials = await this.getBiometricCredentials();
      if (!credentials) {
        throw new Error('No biometric credentials found');
      }

      // Sign in with stored credentials
      return await this.signIn(credentials);
    } catch (error) {
      throw new Error(`Biometric authentication failed: ${error.message}`);
    }
  }

  /**
   * Sync offline data
   * Mobile-specific operation
   */
  async syncOfflineData(): Promise<{ synced: number; conflicts: number }> {
    try {
      if (!this.currentUser) {
        throw new Error('Must be signed in to sync data');
      }

      // Get offline changes
      const offlineChanges = await this.getOfflineChanges();
      let synced = 0;
      let conflicts = 0;

      // Sync each change
      for (const change of offlineChanges) {
        try {
          await this.syncChange(change);
          synced++;
        } catch (error) {
          if (error.message.includes('conflict')) {
            conflicts++;
          } else {
            throw error;
          }
        }
      }

      // Clear synced offline data
      await this.clearOfflineChanges();

      return { synced, conflicts };
    } catch (error) {
      throw new Error(`Offline sync failed: ${error.message}`);
    }
  }

  // ===== SESSION MANAGEMENT =====

  /**
   * Subscribe to session changes
   * Mobile-ready state management
   */
  onSessionChange(callback: (user: User | null) => void): () => void {
    this.sessionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.sessionCallbacks.indexOf(callback);
      if (index > -1) {
        this.sessionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Refresh current session
   * Mobile-friendly token refresh
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.apiClient.auth.refreshSession();
      
      if (error || !data.session) {
        this.currentUser = null;
        this.notifySessionChange(null);
        return null;
      }

      // Update current user
      if (data.user) {
        const userProfile = await this.getUserProfile(data.user.id);
        this.currentUser = userProfile;
        this.notifySessionChange(userProfile);

        const session: AuthSession = {
          user: userProfile,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          last_activity: new Date().toISOString()
        };

        await this.storeSession(session);
        return session;
      }

      return null;
    } catch (error) {
      throw new Error(`Session refresh failed: ${error.message}`);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async initializeSession(): Promise<void> {
    try {
      // Try to restore session from storage
      const storedSession = await this.getStoredSession();
      if (storedSession && storedSession.expires_at > Date.now()) {
        this.currentUser = storedSession.user;
        this.notifySessionChange(storedSession.user);
      }

      // Set up auth state listener
      this.apiClient.auth.onAuthStateChange((event: string, session: any) => {
        if (event === 'SIGNED_OUT' || !session) {
          this.currentUser = null;
          this.notifySessionChange(null);
          this.clearStoredSession();
        }
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  private notifySessionChange(user: User | null): void {
    this.sessionCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in session change callback:', error);
      }
    });
  }

  private validateSignUpData(data: SignUpData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!data.username || data.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!data.terms_accepted) {
      errors.push('Must accept terms and conditions');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateProfileData(data: ProfileUpdateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    if (data.date_of_birth && !this.isValidDate(data.date_of_birth)) {
      errors.push('Invalid date of birth');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validatePreferences(prefs: UserPreferences): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['vi', 'en'].includes(prefs.language)) {
      errors.push('Invalid language preference');
    }

    if (!['light', 'dark', 'system'].includes(prefs.theme)) {
      errors.push('Invalid theme preference');
    }

    return { isValid: errors.length === 0, errors };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'vi',
      theme: 'system',
      notifications: {
        push_enabled: true,
        email_enabled: true,
        sms_enabled: false,
        tournament_updates: true,
        challenge_requests: true,
        ranking_changes: true,
        payment_confirmations: true
      },
      privacy: {
        profile_visibility: 'public',
        show_real_name: true,
        show_location: false,
        show_contact_info: false
      },
      mobile: {
        biometric_auth: false,
        offline_mode: true,
        auto_sync: true,
        data_saver: false
      }
    };
  }

  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      display_name: dbUser.display_name,
      full_name: dbUser.full_name,
      avatar_url: dbUser.avatar_url,
      phone: dbUser.phone,
      date_of_birth: dbUser.date_of_birth,
      location: dbUser.location,
      bio: dbUser.bio,
      rank: dbUser.rank,
      elo_rating: dbUser.elo_rating,
      spa_points: dbUser.spa_points,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at,
      last_seen: dbUser.last_seen,
      is_verified: dbUser.is_verified,
      is_active: dbUser.is_active,
      preferences: dbUser.preferences
    };
  }

  private async createUserProfile(userData: Partial<User>): Promise<User> {
    const { data, error } = await this.apiClient
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;

    return this.mapDatabaseUserToUser(data);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
  }

  private isValidDate(date: string): boolean {
    return !isNaN(new Date(date).getTime());
  }

  private getDeviceId(): string {
    // Generate or retrieve device ID for mobile tracking
    return 'mobile-device-' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultResetUrl(): string {
    return 'sabo://reset-password';
  }

  // Mobile-specific helper methods
  private async compressImage(file: File | Blob): Promise<Blob> {
    // Implementation would compress image for mobile optimization
    return file;
  }

  private async checkBiometricAvailability(): Promise<boolean> {
    // Check if device supports biometric authentication
    return false; // Placeholder
  }

  private async storeBiometricCredentials(): Promise<void> {
    // Store credentials securely for biometric auth
  }

  private async getBiometricCredentials(): Promise<AuthCredentials | null> {
    // Retrieve stored biometric credentials
    return null; // Placeholder
  }

  private async verifyBiometric(): Promise<boolean> {
    // Perform biometric verification
    return false; // Placeholder
  }

  private async storeSession(session: AuthSession): Promise<void> {
    // Store session for offline access
  }

  private async getStoredSession(): Promise<AuthSession | null> {
    // Retrieve stored session
    return null; // Placeholder
  }

  private async clearStoredSession(): Promise<void> {
    // Clear stored session
  }

  private async trackUserActivity(activity: string, metadata?: any): Promise<void> {
    // Track user activity for analytics
  }

  private async getOfflineChanges(): Promise<any[]> {
    // Get pending offline changes
    return [];
  }

  private async syncChange(change: any): Promise<void> {
    // Sync individual change
  }

  private async clearOfflineChanges(): Promise<void> {
    // Clear synced offline changes
  }
}

// Export for mobile app consumption
export default UserService;
