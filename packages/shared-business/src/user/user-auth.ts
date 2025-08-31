/**
 * USER AUTHENTICATION BUSINESS LOGIC
 * Consolidated from AuthService.ts and related authentication components
 */

import { SupabaseClient, User, Session } from '@supabase/supabase-js';

// ===== TYPES =====
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email?: string;
  phone?: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

// ===== USER AUTHENTICATION SERVICE =====
export class UserAuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sign up with email or phone
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Validate input
      if (!data.password || data.password.length < 6) {
        return {
          success: false,
          error: 'Mật khẩu phải có ít nhất 6 ký tự',
        };
      }

      if (!data.email && !data.phone) {
        return {
          success: false,
          error: 'Vui lòng nhập email hoặc số điện thoại',
        };
      }

      // Sign up with Supabase
      const signUpPayload: any = {
        password: data.password,
      };

      if (data.email) {
        signUpPayload.email = data.email;
      } else if (data.phone) {
        signUpPayload.phone = data.phone;
      }

      if (data.fullName) {
        signUpPayload.options = {
          data: {
            full_name: data.fullName,
          },
        };
      }

      const { data: authData, error } = await this.supabase.auth.signUp(
        signUpPayload
      );

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: authData.user ? this.formatAuthUser(authData.user) : undefined,
        session: authData.session
          ? this.formatAuthSession(authData.session)
          : undefined,
      };
    } catch (error) {
      console.error('Error during sign up:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình đăng ký',
      };
    }
  }

  /**
   * Sign in with email or phone
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      // Validate input
      if (!data.password) {
        return {
          success: false,
          error: 'Vui lòng nhập mật khẩu',
        };
      }

      if (!data.email && !data.phone) {
        return {
          success: false,
          error: 'Vui lòng nhập email hoặc số điện thoại',
        };
      }

      // Sign in with Supabase
      const signInPayload: any = {
        password: data.password,
      };

      if (data.email) {
        signInPayload.email = data.email;
      } else if (data.phone) {
        signInPayload.phone = data.phone;
      }

      const { data: authData, error } = await this.supabase.auth.signInWithPassword(
        signInPayload
      );

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: authData.user ? this.formatAuthUser(authData.user) : undefined,
        session: authData.session
          ? this.formatAuthSession(authData.session)
          : undefined,
      };
    } catch (error) {
      console.error('Error during sign in:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình đăng nhập',
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error during sign out:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình đăng xuất',
      };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: sessionData, error } = await this.supabase.auth.getSession();

      if (error || !sessionData.session) {
        return null;
      }

      return this.formatAuthSession(sessionData.session);
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: userData, error } = await this.supabase.auth.getUser();

      if (error || !userData.user) {
        return null;
      }

      return this.formatAuthUser(userData.user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData, redirectTo?: string): Promise<AuthResult> {
    try {
      if (!data.email) {
        return {
          success: false,
          error: 'Vui lòng nhập email',
        };
      }

      const defaultRedirectTo = redirectTo || 'http://localhost:3000/reset-password';

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: defaultRedirectTo,
        }
      );

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình đặt lại mật khẩu',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<AuthResult> {
    try {
      if (!data.newPassword || data.newPassword.length < 6) {
        return {
          success: false,
          error: 'Mật khẩu mới phải có ít nhất 6 ký tự',
        };
      }

      const { data: authData, error } = await this.supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: authData.user ? this.formatAuthUser(authData.user) : undefined,
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình đổi mật khẩu',
      };
    }
  }

  /**
   * Update user email
   */
  async updateEmail(newEmail: string): Promise<AuthResult> {
    try {
      if (!newEmail || !this.isValidEmail(newEmail)) {
        return {
          success: false,
          error: 'Email không hợp lệ',
        };
      }

      const { data: authData, error } = await this.supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: authData.user ? this.formatAuthUser(authData.user) : undefined,
      };
    } catch (error) {
      console.error('Error updating email:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình cập nhật email',
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResult> {
    try {
      const { data: sessionData, error } = await this.supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: this.getAuthErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: sessionData.user ? this.formatAuthUser(sessionData.user) : undefined,
        session: sessionData.session
          ? this.formatAuthSession(sessionData.session)
          : undefined,
      };
    } catch (error) {
      console.error('Error refreshing session:', error);
      return {
        success: false,
        error: 'Có lỗi xảy ra trong quá trình làm mới phiên đăng nhập',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return session !== null && !this.isSessionExpired(session);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Format auth user from Supabase user
   */
  private formatAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
    };
  }

  /**
   * Format auth session from Supabase session
   */
  private formatAuthSession(session: Session): AuthSession {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      token_type: session.token_type,
      user: this.formatAuthUser(session.user),
    };
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: AuthSession): boolean {
    if (!session.expires_at) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return now >= session.expires_at;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user-friendly error message
   */
  private getAuthErrorMessage(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Thông tin đăng nhập không chính xác',
      'Email not confirmed': 'Vui lòng xác nhận email trước khi đăng nhập',
      'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
      'User already registered': 'Email hoặc số điện thoại đã được đăng ký',
      'Invalid email': 'Email không hợp lệ',
      'Phone number already registered': 'Số điện thoại đã được đăng ký',
      'Email already registered': 'Email đã được đăng ký',
      'Invalid phone number': 'Số điện thoại không hợp lệ',
      'Rate limit exceeded': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      'Network error': 'Lỗi kết nối mạng',
    };

    return errorMap[errorMessage] || errorMessage || 'Có lỗi xảy ra';
  }
}
