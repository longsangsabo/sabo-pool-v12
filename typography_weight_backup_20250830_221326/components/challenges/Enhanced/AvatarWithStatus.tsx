import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Crown, Star, Shield, Zap, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExtendedChallengeProfile } from '@/types/enhancedChallenge';

interface AvatarWithStatusProps {
  profile?: ExtendedChallengeProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  showRank?: boolean;
  showBadges?: boolean;
  animated?: boolean;
  isWinner?: boolean;
  className?: string;
  onClick?: () => void;
}

const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({
  profile,
  size = 'md',
  showStatus = true,
  showRank = true,
  showBadges = true,
  animated = true,
  isWinner = false,
  className,
  onClick
}) => {
  // Define sizeConfig FIRST before using it
  const sizeConfig = {
    sm: { avatar: 'w-8 h-8', status: 'w-2 h-2', badge: 'w-4 h-4' },
    md: { avatar: 'w-10 h-10', status: 'w-3 h-3', badge: 'w-5 h-5' },
    lg: { avatar: 'w-12 h-12', status: 'w-3 h-3', badge: 'w-6 h-6' },
    xl: { avatar: 'w-16 h-16', status: 'w-4 h-4', badge: 'w-8 h-8' }
  };

  // Handle empty or undefined profile
  if (!profile) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Avatar className={sizeConfig[size].avatar}>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="text-body-small-muted">Unknown Player</div>
      </div>
    );
  }

  const getRankIcon = (rank?: string, elo?: number) => {
    if (elo && elo >= 2000) return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (elo && elo >= 1800) return { icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-400/20' };
    if (elo && elo >= 1600) return { icon: Star, color: 'text-blue-400', bg: 'bg-blue-400/20' };
    if (elo && elo >= 1400) return { icon: Shield, color: 'text-green-400', bg: 'bg-green-400/20' };
    if (elo && elo >= 1200) return { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/20' };
    return { icon: Shield, color: 'text-gray-400', bg: 'bg-gray-400/20' };
  };

  const rankConfig = getRankIcon(profile.rank, profile.elo);
  const RankIcon = rankConfig.icon;

  const initials = (profile.full_name || profile.display_name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.05, rotate: 2 },
    tap: { scale: 0.95 },
    winner: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6, repeat: 2 }
    }
  };

  return (
    <motion.div
      className={cn('relative inline-block', className)}
      variants={animated ? avatarVariants : undefined}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isWinner ? "winner" : "initial"}
      onClick={onClick}
    >
      {/* Main Avatar */}
      <Avatar 
        className={cn(
          sizeConfig[size].avatar,
          'border-2 transition-all duration-300',
          // Dark mode optimized border colors
          isWinner 
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/25' 
            : profile.online_status 
              ? 'border-green-400 shadow-lg shadow-green-400/25' 
              : 'border-border/50 dark:border-border/30',
          onClick && 'cursor-pointer hover:shadow-lg dark:hover:shadow-primary/25',
          // Enhanced dark mode background
          'bg-background/80 dark:bg-card/50 backdrop-blur-sm'
        )}
      >
        <AvatarImage 
          src={profile.avatar_url} 
          alt={profile.full_name}
          className="object-cover"
        />
        <AvatarFallback 
          className={cn(
            'font-semibold',
            // Dark mode optimized fallback
            'bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30',
            'text-foreground dark:text-foreground',
            size === 'sm' ? 'text-xs' : 
            size === 'lg' ? 'text-base' : 
            size === 'xl' ? 'text-lg' : 'text-sm'
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Online Status Indicator */}
      {showStatus && (
        <motion.div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2',
            sizeConfig[size].status,
            profile.online_status 
              ? 'bg-green-400 border-background dark:border-card' 
              : 'bg-gray-400 border-background dark:border-card'
          )}
          animate={profile.online_status ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Rank Badge */}
      {showRank && profile.rank && (
        <motion.div
          className={cn(
            'absolute -top-1 -right-1 rounded-full p-1',
            sizeConfig[size].badge,
            rankConfig.bg,
            'border border-background dark:border-card',
            'backdrop-blur-sm'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <RankIcon className={cn('w-full h-full', rankConfig.color)} />
        </motion.div>
      )}

      {/* Achievement Badges */}
      {showBadges && profile.win_streak && profile.win_streak > 3 && (
        <motion.div
          className="absolute -top-2 -left-2"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <Badge 
            className={cn(
              'text-caption px-1 py-0.5 font-bold',
              'bg-gradient-to-r from-orange-400 to-red-400',
              'text-white border-0 shadow-lg',
              'dark:from-orange-500 dark:to-red-500'
            )}
          >
            <Flame className="w-3 h-3 mr-0.5" />
            {profile.win_streak}
          </Badge>
        </motion.div>
      )}

      {/* Premium Badge */}
      {profile.is_premium && (
        <motion.div
          className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          <div className={cn(
            'w-4 h-4 rounded-full',
            'bg-gradient-to-r from-yellow-400 to-orange-400',
            'border-2 border-background dark:border-card',
            'flex items-center justify-center'
          )}>
            <Crown className="w-2 h-2 text-white" />
          </div>
        </motion.div>
      )}

      {/* ELO Rating Tooltip */}
      {profile.elo && size !== 'sm' && (
        <motion.div
          className={cn(
            'absolute -bottom-8 left-1/2 transform -translate-x-1/2',
            'bg-card/90 dark:bg-card/95 backdrop-blur-sm',
            'border border-border/50 dark:border-border/30',
            'rounded px-2 py-1 text-caption font-medium',
            'opacity-0 pointer-events-none',
            'group-hover:opacity-100 transition-opacity',
            'shadow-lg dark:shadow-black/20'
          )}
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          ELO: {profile.elo}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="w-2 h-2 bg-card dark:bg-card rotate-45 border-l border-t border-border/50"></div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AvatarWithStatus;
