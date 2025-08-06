import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { Tournament } from '@/types/tournament';
import ModernTournamentCard from './ModernTournamentCard';
import MobileTournamentCard from './MobileTournamentCard';
import TournamentCardSkeleton from './TournamentCardSkeleton';

interface ResponsiveTournamentCardProps {
  tournament?: Tournament;
  onRegister?: () => void;
  onViewDetails?: () => void;
  isRegistered?: boolean;
  showActions?: boolean;
  priority?: 'high' | 'medium' | 'low';
  index?: number;
  loading?: boolean;
}

/**
 * Responsive Tournament Card Component
 * Automatically switches between desktop and mobile layouts
 * based on screen size and device capabilities
 */
const ResponsiveTournamentCard: React.FC<ResponsiveTournamentCardProps> = ({
  tournament,
  onRegister,
  onViewDetails,
  isRegistered = false,
  showActions = true,
  priority = 'medium',
  index = 0,
  loading = false,
}) => {
  const { isMobile, isTablet } = useOptimizedResponsive();

  // Show skeleton if loading or no tournament data
  if (loading || !tournament) {
    return (
      <TournamentCardSkeleton 
        isMobile={isMobile} 
        variant={isMobile ? 'mobile' : 'card'} 
      />
    );
  }

  // Use mobile-optimized card for mobile devices
  if (isMobile) {
    return (
      <MobileTournamentCard
        tournament={tournament}
        onRegister={onRegister}
        onViewDetails={onViewDetails}
        isRegistered={isRegistered}
        index={index}
      />
    );
  }

  // Use modern card for desktop and tablet
  return (
    <ModernTournamentCard
      tournament={tournament}
      onRegister={onRegister}
      onViewDetails={onViewDetails}
      showActions={showActions}
      priority={priority}
      index={index}
    />
  );
};

export default ResponsiveTournamentCard;
