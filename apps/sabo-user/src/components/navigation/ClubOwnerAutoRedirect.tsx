import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClubOwnership } from '@/hooks/useClubOwnership';
import { useAuth } from '@/hooks/useAuth';

interface ClubOwnerAutoRedirectProps {
 children: React.ReactNode;
}

const CLUB_MANAGEMENT_ROUTES = ['/club-management', '/club', '/clubs'];

const EXCLUDED_ROUTES = [
 '/login',
 '/register',
 '/profile',
 '/auth',
 '/challenges',
 '/tournaments',
 '/dashboard',
];

export const ClubOwnerAutoRedirect: React.FC<ClubOwnerAutoRedirectProps> = ({
 children,
}) => {
 const navigate = useNavigate();
 const location = useLocation();
 const { user } = useAuth();
 const { isClubOwner, clubProfile, loading } = useClubOwnership();

 useEffect(() => {
  if (loading || !user) return;

  const currentPath = location.pathname;
  const isOnExcludedRoute = EXCLUDED_ROUTES.some(route =>
   currentPath.startsWith(route)
  );
  const isOnClubRoute = CLUB_MANAGEMENT_ROUTES.some(route =>
   currentPath.startsWith(route)
  );

  // Auto-redirect club owners to management page after login
  if (isClubOwner && clubProfile && !isOnExcludedRoute && !isOnClubRoute) {
   // Only redirect if they're on the root page or dashboard
   if (currentPath === '/' || currentPath === '/dashboard') {
    navigate('/club-management', { replace: true });
   }
  }
 }, [isClubOwner, clubProfile, loading, location.pathname, navigate, user]);

 return <>{children}</>;
};
