import { Challenge } from '@/types/challenge';
import { ExtendedChallenge, ExtendedChallengeProfile } from '@/types/enhancedChallenge';
import { getDisplayName } from '@/types/unified-profile';

/**
 * Type Guards and Validators for Challenge Components
 * Prevents runtime errors by validating data structure
 */

// Type guard to check if data is a valid Challenge
export const isValidChallenge = (data: any): data is Challenge => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.challenger_id === 'string' &&
    typeof data.opponent_id === 'string' &&
    typeof data.status === 'string' &&
    ['pending', 'open', 'accepted', 'declined', 'ongoing', 'completed', 'cancelled', 'expired'].includes(data.status)
  );
};

// Type guard to check if profile data is valid
export const isValidProfile = (data: any): data is ExtendedChallengeProfile => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.user_id === 'string' &&
    typeof data.full_name === 'string'
  );
};

// Safe accessor for challenge properties with fallbacks
export const safeChallengeAccess = {
  getId: (challenge: Challenge | ExtendedChallenge): string => challenge?.id || '',
  getTitle: (challenge: Challenge | ExtendedChallenge): string => 
    (challenge as any)?.title || challenge?.message || 'Thách đấu',
  getDescription: (challenge: Challenge | ExtendedChallenge): string => 
    (challenge as any)?.description || challenge?.message || '',
  getBetAmount: (challenge: Challenge | ExtendedChallenge): number => 
    (challenge as any)?.bet_amount || challenge?.bet_points || (challenge as any)?.stake_amount || 0,
  getStatus: (challenge: Challenge | ExtendedChallenge): string => 
    challenge?.status || 'unknown',
  getChallengerProfile: (challenge: Challenge | ExtendedChallenge) => 
    (challenge as any)?.challenger_profile || (challenge as any)?.challenger,
  getOpponentProfile: (challenge: Challenge | ExtendedChallenge) => 
    (challenge as any)?.opponent_profile || (challenge as any)?.opponent,
  getScheduledTime: (challenge: Challenge | ExtendedChallenge): string => 
    challenge?.scheduled_time || challenge?.created_at || '',
  getLocation: (challenge: Challenge | ExtendedChallenge): string => 
    challenge?.location || '',
  getRaceTo: (challenge: Challenge | ExtendedChallenge): number => 
    challenge?.race_to || 0,
};

// Safe accessor for profile properties with fallbacks
export const safeProfileAccess = {
  getId: (profile?: ExtendedChallengeProfile): string => profile?.id || profile?.user_id || '',
  getName: (profile?: ExtendedChallengeProfile): string => 
    profile ? getDisplayName(profile as any) : 'Unknown Player',
  getAvatar: (profile?: ExtendedChallengeProfile): string => profile?.avatar_url || '',
  getRank: (profile?: ExtendedChallengeProfile): string => 
    profile?.verified_rank || profile?.current_rank || profile?.rank || '',
  getElo: (profile?: ExtendedChallengeProfile): number => profile?.elo || 1000,
  getInitials: (profile?: ExtendedChallengeProfile): string => {
    const name = safeProfileAccess.getName(profile);
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || '??';
  },
  isOnline: (profile?: ExtendedChallengeProfile): boolean => profile?.online_status || false,
  isPremium: (profile?: ExtendedChallengeProfile): boolean => profile?.is_premium || false,
  getWinStreak: (profile?: ExtendedChallengeProfile): number => profile?.win_streak || 0,
};

// Utility to safely filter challenges by status
export const filterChallengesByStatus = (
  challenges: (Challenge | ExtendedChallenge)[], 
  status: string
): (Challenge | ExtendedChallenge)[] => {
  if (!Array.isArray(challenges)) return [];
  
  return challenges.filter(challenge => {
    if (!isValidChallenge(challenge)) return false;
    return safeChallengeAccess.getStatus(challenge) === status;
  });
};

// Utility to safely map challenges for rendering
export const safeMapChallenges = <T>(
  challenges: (Challenge | ExtendedChallenge)[], 
  mapper: (challenge: Challenge | ExtendedChallenge) => T,
  fallback: T[] = []
): T[] => {
  if (!Array.isArray(challenges)) return fallback;
  
  return challenges
    .filter(isValidChallenge)
    .map(challenge => {
      try {
        return mapper(challenge);
      } catch (error) {
        console.warn('Error mapping challenge:', error);
        return null;
      }
    })
    .filter((item): item is T => item !== null);
};

// Error boundary helper for challenge components - returns fallback component type
export const createChallengeErrorFallback = (message: string = 'Không thể hiển thị thách đấu này') => {
  return () => ({
    type: 'div',
    props: {
      className: 'p-4 text-center text-muted-foreground',
      children: [
        {
          type: 'div',
          props: { className: 'text-sm', children: message }
        },
        {
          type: 'div', 
          props: { className: 'text-xs mt-1', children: 'Vui lòng thử lại sau' }
        }
      ]
    }
  });
};

// Validation helper for component props
export const validateChallengeProps = (props: {
  challenge?: Challenge | ExtendedChallenge;
  challenges?: (Challenge | ExtendedChallenge)[];
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (props.challenge && !isValidChallenge(props.challenge)) {
    errors.push('Invalid challenge data structure');
  }
  
  if (props.challenges && !Array.isArray(props.challenges)) {
    errors.push('Challenges must be an array');
  }
  
  if (props.challenges && Array.isArray(props.challenges)) {
    const invalidChallenges = props.challenges.filter(c => !isValidChallenge(c));
    if (invalidChallenges.length > 0) {
      errors.push(`${invalidChallenges.length} invalid challenge(s) in array`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Development helper to log component data
export const debugChallengeData = (componentName: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 [${componentName}] Debug Data`);
    console.log('Raw data:', data);
    
    if (data.challenge) {
      console.log('Challenge valid:', isValidChallenge(data.challenge));
      console.log('Challenge title:', safeChallengeAccess.getTitle(data.challenge));
      console.log('Challenge status:', safeChallengeAccess.getStatus(data.challenge));
    }
    
    if (data.challenges) {
      console.log('Challenges count:', data.challenges?.length || 0);
      console.log('Valid challenges:', data.challenges?.filter(isValidChallenge).length || 0);
    }
    
    console.groupEnd();
  }
};
