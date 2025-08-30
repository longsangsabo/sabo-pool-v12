/**
 * Authentication Utilities
 * Consolidated from SABO Arena auth system
 */

export const handleAuthError = (error: any) => {
  console.error('Auth error:', error);

  // Return error message for toast handling in components
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
};

export const validateJWTToken = async (supabase: any) => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

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
};

export const refreshAuthSession = async (supabase: any) => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Session refresh failed:', error);
      return false;
    }

    return !!data.session;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
};

export const configureOAuthRedirects = () => {
  const redirectUrl = `${window.location.origin}/`;

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
};
