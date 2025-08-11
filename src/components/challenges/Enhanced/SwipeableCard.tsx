import React, { useState, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SwipeRight, 
  SwipeLeft, 
  Eye, 
  Zap, 
  X, 
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/challenge';
import { ChallengeAction } from '@/types/challengeCard';
import AvatarWithStatus from './AvatarWithStatus';
import StatusBadge from './StatusBadge';
import { toExtendedChallenge } from '@/types/enhancedChallenge';

interface SwipeableCardProps {
  challenge: Challenge;
  variant?: 'open' | 'live' | 'upcoming' | 'completed';
  onSwipe?: (challengeId: string, action: ChallengeAction, direction: 'left' | 'right') => void;
  onTap?: (challengeId: string) => void;
  swipeThreshold?: number;
  disabled?: boolean;
  className?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  challenge,
  variant = 'open',
  onSwipe,
  onTap,
  swipeThreshold = 100,
  disabled = false,
  className
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const rotate = useTransform(x, [-150, 0, 150], [-5, 0, 5]);

  const extendedChallenge = toExtendedChallenge(challenge);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      const direction = offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      
      // Determine action based on variant and direction
      let action: ChallengeAction;
      if (variant === 'open') {
        action = direction === 'right' ? 'join' : 'decline';
      } else if (variant === 'live') {
        action = direction === 'right' ? 'watch' : 'view';
      } else if (variant === 'upcoming') {
        action = direction === 'right' ? 'view' : 'cancel';
      } else {
        action = direction === 'right' ? 'view' : 'share';
      }
      
      onSwipe?.(challenge.id, action, direction);
      
      // Reset after animation
      setTimeout(() => {
        setSwipeDirection(null);
        x.set(0);
      }, 300);
    } else {
      // Snap back
      x.set(0);
    }
  }, [challenge.id, variant, onSwipe, swipeThreshold, x]);

  const getSwipeActions = () => {
    switch (variant) {
      case 'open':
        return {
          left: { icon: X, label: 'Từ chối', color: 'text-red-500', bg: 'bg-red-500/10' },
          right: { icon: Zap, label: 'Tham gia', color: 'text-green-500', bg: 'bg-green-500/10' }
        };
      case 'live':
        return {
          left: { icon: Eye, label: 'Xem', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          right: { icon: Zap, label: 'Live', color: 'text-red-500', bg: 'bg-red-500/10' }
        };
      case 'upcoming':
        return {
          left: { icon: X, label: 'Hủy', color: 'text-red-500', bg: 'bg-red-500/10' },
          right: { icon: Eye, label: 'Xem', color: 'text-blue-500', bg: 'bg-blue-500/10' }
        };
      default:
        return {
          left: { icon: ArrowLeft, label: 'Chia sẻ', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          right: { icon: Eye, label: 'Xem', color: 'text-blue-500', bg: 'bg-blue-500/10' }
        };
    }
  };

  const swipeActions = getSwipeActions();

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {/* Left Action */}
        <motion.div
          className={cn(
            'flex-1 flex items-center justify-start pl-6',
            swipeActions.left.bg,
            'dark:bg-opacity-20'
          )}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: swipeDirection === 'left' ? 1 : 0,
            scale: swipeDirection === 'left' ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <swipeActions.left.icon className={cn('w-6 h-6', swipeActions.left.color)} />
            <span className={cn('font-medium', swipeActions.left.color)}>
              {swipeActions.left.label}
            </span>
          </div>
        </motion.div>

        {/* Right Action */}
        <motion.div
          className={cn(
            'flex-1 flex items-center justify-end pr-6',
            swipeActions.right.bg,
            'dark:bg-opacity-20'
          )}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: swipeDirection === 'right' ? 1 : 0,
            scale: swipeDirection === 'right' ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className={cn('font-medium', swipeActions.right.color)}>
              {swipeActions.right.label}
            </span>
            <swipeActions.right.icon className={cn('w-6 h-6', swipeActions.right.color)} />
          </div>
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        drag={!disabled ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, scale, rotate }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10"
      >
        <Card 
          className={cn(
            'transition-all duration-200 cursor-grab active:cursor-grabbing',
            'border-border/50 dark:border-border/30',
            'bg-card/80 dark:bg-card/90 backdrop-blur-sm',
            'shadow-lg dark:shadow-black/20',
            // Variant-specific styling
            variant === 'live' && 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
            variant === 'upcoming' && 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20',
            variant === 'completed' && 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20',
            variant === 'open' && 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20'
          )}
          onClick={() => onTap?.(challenge.id)}
        >
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <StatusBadge 
                status={challenge.status} 
                size="sm" 
                animated={variant === 'live'}
                showCountdown={variant === 'upcoming'}
                startTime={challenge.scheduled_time}
              />
              <div className="text-xs text-muted-foreground">
                {formatDateTime(challenge.created_at)}
              </div>
            </div>

            {/* Players */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AvatarWithStatus
                  profile={extendedChallenge.challenger_profile!}
                  size="sm"
                  showStatus={false}
                  animated={false}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {extendedChallenge.challenger_profile?.full_name || 'Challenger'}
                  </p>
                  {extendedChallenge.challenger_profile?.elo && (
                    <p className="text-xs text-muted-foreground">
                      ELO: {extendedChallenge.challenger_profile.elo}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-muted-foreground font-bold">vs</div>

              <div className="flex items-center gap-2">
                <div className="min-w-0 text-right">
                  <p className="text-sm font-medium truncate">
                    {extendedChallenge.opponent_profile?.full_name || 'Đối thủ'}
                  </p>
                  {extendedChallenge.opponent_profile?.elo && (
                    <p className="text-xs text-muted-foreground">
                      ELO: {extendedChallenge.opponent_profile.elo}
                    </p>
                  )}
                </div>
                <AvatarWithStatus
                  profile={extendedChallenge.opponent_profile!}
                  size="sm"
                  showStatus={false}
                  animated={false}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {challenge.bet_points && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Cược:</span>
                  <span>{challenge.bet_points} điểm</span>
                </div>
              )}
              {challenge.race_to && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Race:</span>
                  <span>{challenge.race_to}</span>
                </div>
              )}
              {challenge.location && (
                <div className="flex items-center gap-1 col-span-2">
                  <span className="font-medium">Địa điểm:</span>
                  <span className="truncate">{challenge.location}</span>
                </div>
              )}
            </div>

            {/* Swipe Hint */}
            {!disabled && (
              <motion.div
                className="flex items-center justify-center mt-3 gap-4 text-xs text-muted-foreground"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  <span>{swipeActions.left.label}</span>
                </div>
                <div className="w-2 h-0.5 bg-muted-foreground/30 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <span>{swipeActions.right.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Swipeable List Component
interface SwipeableListProps {
  challenges: Challenge[];
  variant?: 'open' | 'live' | 'upcoming' | 'completed';
  onSwipe?: (challengeId: string, action: ChallengeAction, direction: 'left' | 'right') => void;
  onTap?: (challengeId: string) => void;
  className?: string;
}

const SwipeableList: React.FC<SwipeableListProps> = ({
  challenges,
  variant,
  onSwipe,
  onTap,
  className
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence>
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ delay: index * 0.1 }}
          >
            <SwipeableCard
              challenge={challenge}
              variant={variant}
              onSwipe={onSwipe}
              onTap={onTap}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { SwipeableCard, SwipeableList };
export default SwipeableCard;
