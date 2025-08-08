import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';

/**
 * Route guard to ensure old AuthPage is only used for forgot/reset flows.
 * If mode is not one of ['forgot-password','reset-password'], redirect to new login page.
 */
const AuthRouteGuard: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');

  if (mode === 'forgot-password' || mode === 'reset-password') {
    return <AuthPage />;
  }

  return <Navigate to='/auth/login' replace />;
};

export default AuthRouteGuard;
