import { Challenge, ChallengeProfile } from './challenge';

// Action types for enhanced challenge cards
export type ChallengeAction = 
  | 'join' 
  | 'accept' 
  | 'decline' 
  | 'cancel' 
  | 'view' 
  | 'watch'
  | 'score'
  | 'share'
  | 'notify';

// Card variant types  
export type ChallengeCardVariant = 
  | 'open'      // Open challenges waiting for opponents
  | 'live'      // Live matches in progress
  | 'upcoming'  // Scheduled matches
  | 'completed' // Finished matches
  | 'pending'   // Awaiting response
  | 'default';  // Default view

// Extended Challenge interface with additional properties for Enhanced components
export interface ExtendedChallenge extends Challenge {
  // Display properties
  title?: string;
  description?: string;
  type?: string;
  
  // Social stats
  views_count?: number;
  comments_count?: number;
  likes_count?: number;
  
  // Timing properties  
  start_time?: string;
  end_time?: string;
  duration?: number;
  urgency?: 'low' | 'medium' | 'high';
  
  // Financial properties
  bet_amount?: number;
  prize_pool?: number;
  
  // Result properties
  winner_id?: string;
  loser_id?: string;
  
  // SABO specific properties
  handicap_data?: any; // JSON data for handicap information
  location?: string;   // Challenge location/venue
  
  // Enhanced profile properties
  challenger_profile?: ExtendedChallengeProfile;
  opponent_profile?: ExtendedChallengeProfile;
}

// Extended profile with additional UI properties
export interface ExtendedChallengeProfile extends ChallengeProfile {
  username?: string;
  rank?: string;
  online_status?: boolean;
  is_premium?: boolean;
  badge_count?: number;
  win_streak?: number;
}

// Enhanced Card Props interface
export interface EnhancedChallengeCardProps {
  challenge: ExtendedChallenge;
  variant: ChallengeCardVariant;
  currentUserId?: string;
  
  // Action handlers
  onAction?: (challengeId: string, action: ChallengeAction) => void;
  onJoin?: (challengeId: string) => Promise<void>;
  onSubmitScore?: (challengeId: string, challengerScore: number, opponentScore: number) => Promise<void>;
  
  // State management
  isLoading?: boolean;
  isJoining?: boolean;
  isSubmittingScore?: boolean;
  
  // Layout options
  compact?: boolean;
  showActions?: boolean;
  showDetails?: boolean;
  showAvatar?: boolean;
  size?: 'compact' | 'default' | 'large';
  
  // Enhanced features
  showQuickActions?: boolean;
  showStats?: boolean;
  showBadges?: boolean;
  showTimestamp?: boolean;
  isInteractive?: boolean;
  isSelected?: boolean;
  enableBookmark?: boolean;
  enableShare?: boolean;
  
  // Highlighting
  highlighted?: boolean;
  urgent?: boolean;
  
  // Animation
  animationDelay?: number;
  disableAnimation?: boolean;
  
  // Events
  onCardClick?: (challengeId: string) => void;
  className?: string;
}

// Avatar Props interface for Enhanced components
export interface EnhancedAvatarProps {
  profile: ExtendedChallengeProfile;
  size?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
  showOnlineStatus?: boolean;
  showBadges?: boolean;
  className?: string;
}

// Status Badge Props interface
export interface EnhancedStatusBadgeProps {
  status: string;
  variant?: ChallengeCardVariant;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
  startTime?: string;
  urgency?: 'low' | 'medium' | 'high';
  className?: string;
}

// Action Button Props interface
export interface EnhancedActionButtonProps {
  action: ChallengeAction;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: (event: React.MouseEvent) => void;
  className?: string;
}

// Helper function to convert Challenge to ExtendedChallenge
export function toExtendedChallenge(challenge: Challenge): ExtendedChallenge {
  return {
    ...challenge,
    // Provide default values for missing properties
    title: challenge.message || 'Thách đấu',
    description: challenge.message,
    bet_amount: challenge.bet_points || challenge.stake_amount,
    start_time: challenge.scheduled_time || challenge.created_at,
    challenger_profile: toExtendedProfile(challenge.challenger_profile || challenge.challenger),
    opponent_profile: toExtendedProfile(challenge.opponent_profile || challenge.opponent),
  };
}

// Helper function to convert ChallengeProfile to ExtendedChallengeProfile
export function toExtendedProfile(profile?: ChallengeProfile): ExtendedChallengeProfile | undefined {
  if (!profile) return undefined;
  
  return {
    ...profile,
    username: profile.display_name || profile.full_name,
    rank: profile.verified_rank || profile.current_rank,
    online_status: false, // Default value
    is_premium: false, // Default value
  };
}
