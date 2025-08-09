/**
 * Centralized Auth Configuration
 * Standardizes all authentication redirect URLs and patterns
 */

export const getAuthRedirectUrl = (path = '/auth/callback') => {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.VITE_APP_URL || 'https://saboarena.com'
      : window.location.origin;
  return `${baseUrl}${path}`;
};

// Standardized redirect URLs for all auth flows
export const AUTH_REDIRECTS = {
  // All email auth flows → auth callback
  emailSignup: getAuthRedirectUrl('/auth/callback?type=email_signup'),
  emailResend: getAuthRedirectUrl('/auth/callback?type=email_confirm'),
  emailLogin: getAuthRedirectUrl('/auth/callback?type=email_login'),

  // OAuth providers → auth callback
  oauth: getAuthRedirectUrl('/auth/callback?type=oauth'),

  // Phone OTP (no redirect needed - handled in-app)
  phoneOtp: null,

  // Password reset
  passwordReset: getAuthRedirectUrl('/auth/callback?type=password_reset'),
};

// Success messages based on auth type
export const getAuthSuccessMessage = (type: string | null): string => {
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
};

// Error messages for auth failures
export const getAuthErrorMessage = (type: string | null): string => {
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
};

// Validate redirect URL to prevent open redirect attacks
export const getSecureRedirectUrl = (path: string): string => {
  const allowedPaths = [
    '/dashboard',
    '/admin',
    '/club-management',
    '/profile',
    '/settings',
  ];

  return allowedPaths.includes(path) ? path : '/dashboard';
};

// OAuth provider configurations
export const OAUTH_CONFIGS = {
  google: {
    provider: 'google' as const,
    options: {
      redirectTo: AUTH_REDIRECTS.oauth,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  },
  facebook: {
    provider: 'facebook' as const,
    options: {
      redirectTo: AUTH_REDIRECTS.oauth,
      scopes: 'email,public_profile',
    },
  },
};

// Environment-based configuration
export const AUTH_CONFIG = {
  redirects: AUTH_REDIRECTS,
  oauth: OAUTH_CONFIGS,
  messages: {
    success: getAuthSuccessMessage,
    error: getAuthErrorMessage,
  },
  security: {
    validateRedirect: getSecureRedirectUrl,
  },
} as const;
