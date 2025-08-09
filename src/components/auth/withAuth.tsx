import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLoadingOverlay } from './AuthLoadingOverlay';

export type UserRole = 'admin' | 'club_owner' | 'user';

interface WithAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

/**
 * Higher-order component for route protection
 * 
 * @param Component - Component to wrap
 * @param options - Auth requirements
 * @returns Protected component
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) => {
  const WrappedComponent = (props: P) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    const {
      requiredRole,
      redirectTo = '/auth/login',
      allowedRoles = []
    } = options;

    // Show loading while auth state is being determined
    if (loading) {
      return <AuthLoadingOverlay message="Đang kiểm tra quyền truy cập..." />;
    }

    // Redirect to login if not authenticated
    if (!user) {
      // Store intended destination for redirect after login
      sessionStorage.setItem('intendedPath', location.pathname + location.search);
      return <Navigate to={redirectTo} replace />;
    }

    // Check role requirements
    if (requiredRole) {
      const userRole = getUserRole(user);
      if (userRole !== requiredRole) {
        return <UnauthorizedPage requiredRole={requiredRole} userRole={userRole} />;
      }
    }

    // Check if user role is in allowed roles
    if (allowedRoles.length > 0) {
      const userRole = getUserRole(user);
      if (!allowedRoles.includes(userRole)) {
        return <UnauthorizedPage requiredRole={allowedRoles[0]} userRole={userRole} />;
      }
    }

    // All checks passed, render component
    return <Component {...props} />;
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Get user role from user object
 */
const getUserRole = (user: any): UserRole => {
  // Check user metadata or role field
  if (user.user_metadata?.role) return user.user_metadata.role;
  if (user.app_metadata?.role) return user.app_metadata.role;
  
  // Default role
  return 'user';
};

/**
 * Unauthorized access page
 */
const UnauthorizedPage: React.FC<{
  requiredRole: UserRole;
  userRole: UserRole;
}> = ({ requiredRole, userRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8 text-center">
      <div>
        <div className="mx-auto h-12 w-12 text-red-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Không có quyền truy cập
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Bạn không có quyền truy cập vào khu vực này.
        </p>
        <div className="mt-4 text-xs text-gray-500">
          <p>Yêu cầu: <span className="font-semibold">{requiredRole}</span></p>
          <p>Của bạn: <span className="font-semibold">{userRole}</span></p>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        <button
          onClick={() => window.history.back()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Quay lại
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  </div>
);

// Convenient wrapper functions for common use cases
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'admin' });

export const withClubOwnerAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'club_owner' });

export const withAnyAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, {});

// Export types
export type { WithAuthOptions };
