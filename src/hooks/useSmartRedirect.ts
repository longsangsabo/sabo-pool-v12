import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSecureRedirectUrl } from '@/utils/authConfig';

export interface User {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: {
    role?: string;
    full_name?: string;
  };
  app_metadata?: {
    role?: string;
    provider?: string;
  };
}

export const useSmartRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterAuth = useCallback((user: User, customRedirect?: string) => {
    try {
      // 1. Check for custom redirect parameter
      if (customRedirect) {
        const secureUrl = getSecureRedirectUrl(customRedirect);
        navigate(secureUrl, { replace: true });
        return;
      }

      // 2. Check for intended destination (stored before auth)
      const intendedPath = sessionStorage.getItem('intendedPath');
      if (intendedPath) {
        sessionStorage.removeItem('intendedPath');
        const secureUrl = getSecureRedirectUrl(intendedPath);
        navigate(secureUrl, { replace: true });
        return;
      }

      // 3. Check URL search params for redirect
      const urlParams = new URLSearchParams(location.search);
      const redirectParam = urlParams.get('redirect');
      if (redirectParam) {
        const secureUrl = getSecureRedirectUrl(redirectParam);
        navigate(secureUrl, { replace: true });
        return;
      }

      // 4. Role-based default redirects
      const userRole = getUserRole(user);
      
      switch (userRole) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'club_owner':
          navigate('/club-management', { replace: true });
          break;
        case 'user':
        default:
          navigate('/dashboard', { replace: true });
          break;
      }

    } catch (error) {
      console.error('Smart redirect error:', error);
      // Fallback to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, location]);

  const saveIntendedPath = useCallback((path: string) => {
    try {
      sessionStorage.setItem('intendedPath', path);
    } catch (error) {
      console.warn('Failed to save intended path:', error);
    }
  }, []);

  const clearIntendedPath = useCallback(() => {
    try {
      sessionStorage.removeItem('intendedPath');
    } catch (error) {
      console.warn('Failed to clear intended path:', error);
    }
  }, []);

  const getIntendedPath = useCallback((): string | null => {
    try {
      return sessionStorage.getItem('intendedPath');
    } catch (error) {
      console.warn('Failed to get intended path:', error);
      return null;
    }
  }, []);

  return {
    redirectAfterAuth,
    saveIntendedPath,
    clearIntendedPath,
    getIntendedPath
  };
};

/**
 * Get user role from user object
 */
const getUserRole = (user: User): string => {
  // Priority order: user_metadata.role > app_metadata.role > default
  if (user.user_metadata?.role) {
    return user.user_metadata.role;
  }
  
  if (user.app_metadata?.role) {
    return user.app_metadata.role;
  }
  
  // Default role
  return 'user';
};

/**
 * Hook for handling auth redirects with loading states
 */
export const useAuthRedirect = () => {
  const { redirectAfterAuth, saveIntendedPath } = useSmartRedirect();
  
  const handleAuthSuccess = useCallback((user: User, options?: {
    customRedirect?: string;
    delay?: number;
  }) => {
    const { customRedirect, delay = 0 } = options || {};
    
    if (delay > 0) {
      setTimeout(() => {
        redirectAfterAuth(user, customRedirect);
      }, delay);
    } else {
      redirectAfterAuth(user, customRedirect);
    }
  }, [redirectAfterAuth]);

  const handleAuthFailure = useCallback((error?: any, options?: {
    redirectTo?: string;
    delay?: number;
  }) => {
    const { redirectTo = '/auth/login', delay = 0 } = options || {};
    
    console.error('Auth failure:', error);
    
    if (delay > 0) {
      setTimeout(() => {
        window.location.href = redirectTo;
      }, delay);
    } else {
      window.location.href = redirectTo;
    }
  }, []);

  return {
    handleAuthSuccess,
    handleAuthFailure,
    saveIntendedPath
  };
};
