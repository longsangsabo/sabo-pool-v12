import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import TournamentsPage from './TournamentsPage';

const StandardizedTournamentsPage: React.FC = () => {
 const { isMobile } = useOptimizedResponsive();

 // Debug logging
 console.log('🔍 [StandardizedTournamentsPage] Debug info:', {
  isMobile,
  screenWidth: window.innerWidth,
  userAgent: navigator.userAgent.includes('Mobile'),
 });

 // Use TournamentsPage for both mobile and desktop for consistency
 console.log('🎯 [StandardizedTournamentsPage] Rendering TournamentsPage for consistent experience');
 return <TournamentsPage />;
};

export default StandardizedTournamentsPage;
