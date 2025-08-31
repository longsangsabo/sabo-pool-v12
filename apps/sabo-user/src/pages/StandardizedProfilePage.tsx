import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import OptimizedMobileProfile from './OptimizedMobileProfile';

const StandardizedProfilePage: React.FC = () => {
 const { isMobile } = useOptimizedResponsive();

 // Debug logging
 console.log('🔍 [StandardizedProfilePage] Debug info:', {
  isMobile,
  screenWidth: window.innerWidth,
  userAgent: navigator.userAgent.includes('Mobile'),
 });

 // Use OptimizedMobileProfile for both mobile and desktop for consistency
 console.log('🎯 [StandardizedProfilePage] Rendering OptimizedMobileProfile for consistent experience');
 return <OptimizedMobileProfile />;
};

export default StandardizedProfilePage;
