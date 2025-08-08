import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useClubOwnership } from '@/hooks/useClubOwnership';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { AdminResponsiveLayout } from './AdminResponsiveLayout';
import { ClubResponsiveLayout } from './ClubResponsiveLayout';
import { ResponsiveLayout } from './ResponsiveLayout';
import { useLocation } from 'react-router-dom';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { isClubOwner, loading: clubLoading } = useClubOwnership();
  const { isDesktop } = useOptimizedResponsive();
  const location = useLocation();
  const path = location.pathname;
  const isOwnerManagementRoute =
    path.startsWith('/club-management') || /\/clubs\/.+\/owner$/.test(path);

  console.log('[RoleBasedLayout] Debug:', {
    user: user?.id,
    isClubOwner,
    isOwnerManagementRoute,
    path,
    loading: { authLoading, adminLoading, clubLoading },
  });

  // Show loading while checking roles
  if (authLoading || adminLoading || clubLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Priority: Admin > Club Owner > Regular User
  if (user && isAdmin) {
    return <AdminResponsiveLayout>{children}</AdminResponsiveLayout>;
  }

  // Club owners get club-specific layout ONLY for management routes
  if (user && isClubOwner && isOwnerManagementRoute) {
    console.log(
      '[RoleBasedLayout] Using ClubResponsiveLayout for owner management'
    );
    return <ClubResponsiveLayout>{children}</ClubResponsiveLayout>;
  }

  // Regular users get standard responsive layout (including club owners viewing public pages)
  console.log('[RoleBasedLayout] Using ResponsiveLayout (player/public)');
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
};
