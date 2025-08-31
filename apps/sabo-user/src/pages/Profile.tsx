import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import OptimizedMobileProfile from './OptimizedMobileProfile';

const Profile: React.FC = () => {
 const { isMobile } = useOptimizedResponsive();

 // Debug logging
 console.log('🔍 [Profile] Debug info:', {
  isMobile,
  screenWidth: window.innerWidth,
  userAgent: navigator.userAgent.includes('Mobile'),
 });

 // Use OptimizedMobileProfile for both mobile and desktop for consistency
 console.log('🎯 [Profile] Rendering OptimizedMobileProfile for consistent experience');
 return <OptimizedMobileProfile />;
};

export default Profile;
