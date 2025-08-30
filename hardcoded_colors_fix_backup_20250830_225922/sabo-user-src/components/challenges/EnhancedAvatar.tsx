import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Crown, Star, Zap } from 'lucide-react';
import { AvatarSize, avatarSizeConfig } from '@/types/challengeCard';
import { ExtendedChallengeProfile } from '@/types/enhancedChallenge';

interface EnhancedAvatarProps {
  // Support both old and new interfaces
  src?: string;
  name?: string;
  rank?: string;
  points?: number;
  profile?: ExtendedChallengeProfile;
  size?: AvatarSize;
  isOnline?: boolean;
  isWinner?: boolean;
  showBadge?: boolean;
  showRank?: boolean;
  showOnlineStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  src,
  name = 'Player',
  rank,
  points,
  profile,
  size = 'md',
  isOnline = false,
  isWinner = false,
  showBadge = true,
  showRank = true,
  showOnlineStatus = false,
  className = '',
  onClick
}) => {
  // Use profile data if available, otherwise use individual props
  const avatarSrc = src || profile?.avatar_url;
  const displayName = name || profile?.full_name || profile?.display_name || 'Player';
  const displayRank = rank || profile?.rank || profile?.verified_rank || profile?.current_rank;
  const displayPoints = points || profile?.elo || profile?.ranking_points;
  const onlineStatus = isOnline || profile?.online_status;
  
  const sizeConfig = avatarSizeConfig[size];
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Determine rank color and icon
  const getRankConfig = (rank?: string, points?: number) => {
    if (!rank && !points) return null;
    
    if (points && points >= 2000) {
      return { color: 'bg-info-500', icon: Crown, label: 'Huyền thoại' };
    } else if (points && points >= 1800) {
      return { color: 'bg-warning-500', icon: Crown, label: 'Vua break' };
    } else if (points && points >= 1600) {
      return { color: 'bg-primary-500', icon: Star, label: 'Tay cơ số 1' };
    } else if (points && points >= 1400) {
      return { color: 'bg-success-500', icon: Zap, label: 'Thành thạo' };
    } else if (points && points >= 1200) {
      return { color: 'bg-warning-500', icon: Star, label: 'Triển vọng' };
    }
    
    return { color: 'bg-neutral-500', icon: User, label: rank || 'Tân binh' };
  };
  
  const rankConfig = getRankConfig(displayRank, displayPoints);

  return (
    <div className={`relative inline-block ${className}`} onClick={onClick}>
      {/* Main Avatar */}
      <Avatar className={`
        ${sizeConfig.className} 
        ${isWinner ? 'ring-4 ring-yellow-400' : 'ring-2 ring-background'} 
        ${onClick ? 'cursor-pointer hover:ring-primary/50 transition-all' : ''}
        ${onlineStatus && showOnlineStatus ? 'ring-green-500' : ''}
      `}>
        <AvatarImage 
          src={avatarSrc} 
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className={`
          bg-gradient-to-br from-primary/20 to-accent/20 
          text-foreground font-semibold
          ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}
        `}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Online Status Indicator */}
      {isOnline && (
        <div className={`
          absolute -bottom-1 -right-1 
          ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} 
          bg-success-500 border-2 border-background rounded-full
          animate-pulse
        `} />
      )}

      {/* Winner Crown */}
      {isWinner && (
        <div className={`
          absolute -top-2 -right-1 
          ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}
          bg-warning-500 rounded-full flex items-center justify-center
          border-2 border-background
        `}>
          <Crown className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Rank Badge */}
      {showBadge && rankConfig && (
        <div className={`
          absolute -bottom-2 left-1/2 transform -translate-x-1/2
          ${size === 'sm' ? 'scale-75' : ''}
        `}>
          <Badge 
            variant="secondary" 
            className={`
              ${rankConfig.color} text-white border-0
              px-2 py-0.5 text-caption font-bold
              flex items-center gap-1
            `}
          >
            <rankConfig.icon className="w-3 h-3" />
            {size !== 'sm' && <span>{rank || rankConfig.label}</span>}
          </Badge>
        </div>
      )}

      {/* Points Display (for larger sizes) */}
      {showRank && points && size !== 'sm' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-caption text-muted-foreground font-medium">
            {points.toLocaleString()} pts
          </span>
        </div>
      )}
    </div>
  );
};

// Loading skeleton for avatar
export const AvatarSkeleton: React.FC<{ size?: AvatarSize }> = ({ size = 'md' }) => {
  const sizeConfig = avatarSizeConfig[size];
  
  return (
    <div className={`${sizeConfig.className} rounded-full bg-muted animate-pulse`} />
  );
};

// Avatar group for multiple players
interface AvatarGroupProps {
  players: Array<{
    id: string;
    name?: string;
    avatar?: string;
    rank?: string;
    points?: number;
    isWinner?: boolean;
  }>;
  size?: AvatarSize;
  max?: number;
  showOverflow?: boolean;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  players,
  size = 'md',
  max = 3,
  showOverflow = true
}) => {
  const displayPlayers = players.slice(0, max);
  const overflowCount = players.length - max;

  return (
    <div className="flex -space-x-2">
      {displayPlayers.map((player, index) => (
        <EnhancedAvatar
          key={player.id}
          src={player.avatar}
          name={player.name}
          rank={player.rank}
          points={player.points}
          size={size}
          isWinner={player.isWinner}
          showBadge={index === 0} // Only show badge for first player
          showRank={false}
          className={`relative z-${10 - index} border-2 border-background`}
        />
      ))}
      
      {showOverflow && overflowCount > 0 && (
        <div className={`
          ${avatarSizeConfig[size].className}
          bg-muted border-2 border-background rounded-full
          flex items-center justify-center text-caption-medium text-muted-foreground
          relative z-0
        `}>
          +{overflowCount}
        </div>
      )}
    </div>
  );
};

export default EnhancedAvatar;
