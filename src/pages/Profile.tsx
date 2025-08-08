import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import DesktopProfilePage from '@/components/profile/DesktopProfilePage';
import OptimizedMobileProfile from './OptimizedMobileProfile';

const Profile: React.FC = () => {
  const { isMobile } = useOptimizedResponsive();

  // Debug logging
  console.log('🔍 [Profile] Debug info:', {
    isMobile,
    screenWidth: window.innerWidth,
    userAgent: navigator.userAgent.includes('Mobile'),
  });

  if (isMobile) {
    console.log('🎯 [Profile] Rendering OptimizedMobileProfile for mobile');
    return <OptimizedMobileProfile />;
  }

  console.log('🎯 [Profile] Rendering DesktopProfilePage for desktop redesign');
  return <DesktopProfilePage />;
};

export default Profile;
