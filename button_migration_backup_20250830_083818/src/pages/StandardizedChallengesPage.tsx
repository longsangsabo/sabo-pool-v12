import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import EnhancedChallengesPageV3 from './challenges/EnhancedChallengesPageV3';

const StandardizedChallengesPage: React.FC = () => {
  const { isMobile } = useOptimizedResponsive();

  // Debug logging
  console.log('🔍 [StandardizedChallengesPage] Debug info:', {
    isMobile,
    screenWidth: window.innerWidth,
    userAgent: navigator.userAgent.includes('Mobile'),
  });

  // Use EnhancedChallengesPageV3 for both mobile and desktop for consistency
  console.log('🎯 [StandardizedChallengesPage] Rendering EnhancedChallengesPageV3 for consistent experience');
  return <EnhancedChallengesPageV3 />;
};

export default StandardizedChallengesPage;
