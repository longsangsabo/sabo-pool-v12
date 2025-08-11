import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Clock,
  Trophy,
  Coins,
  Calendar,
  Users,
  MapPin,
  Zap,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/challenge';
import { EnhancedChallengeCardProps, ExtendedChallenge, toExtendedChallenge } from '@/types/enhancedChallenge';
import AvatarWithStatus from './Enhanced/AvatarWithStatus';
import StatusBadge from './Enhanced/StatusBadge';

// Modified props to accept both Challenge and ExtendedChallenge
interface FlexibleEnhancedChallengeCardProps extends Omit<EnhancedChallengeCardProps, 'challenge'> {
  challenge: Challenge | ExtendedChallenge;
}

const EnhancedChallengeCard: React.FC<FlexibleEnhancedChallengeCardProps> = ({
  challenge: originalChallenge,
  variant = 'default',
  size = 'default',
  showQuickActions = true,
  showStats = true,
  showBadges = true,
  isInteractive = true,
  isSelected = false,
  onAction,
  onCardClick,
  className = ''
}) => {
  // Convert to ExtendedChallenge for enhanced features
  const challenge = toExtendedChallenge(originalChallenge);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const handleCardClick = () => {
    if (onCardClick && isInteractive) {
      onCardClick(challenge.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'live':
      case 'ongoing': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'live': 
        return 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 shadow-lg shadow-red-500/10 dark:shadow-red-500/25';
      case 'completed': 
        return 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20 shadow-lg shadow-green-500/10 dark:shadow-green-500/25';
      case 'upcoming': 
        return 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/25';
      case 'open': 
        return 'border-yellow-200 dark:border-yellow-800/50 bg-yellow-50/50 dark:bg-yellow-950/20 shadow-lg shadow-yellow-500/10 dark:shadow-yellow-500/25';
      default: 
        return 'border-border/50 dark:border-border/30 bg-card/80 dark:bg-card/90 backdrop-blur-sm';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn('w-full', className)}
    >
      <Card 
        className={cn(
          'transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/25 cursor-pointer',
          'border backdrop-blur-sm',
          getVariantStyles(),
          isSelected && 'ring-2 ring-primary/50 dark:ring-primary/60',
          // Enhanced dark mode support
          'hover:border-primary/30 dark:hover:border-primary/40'
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 relative overflow-hidden">
          {/* Subtle background pattern for dark mode */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
          </div>

          {/* Header with enhanced status */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              {showBadges && (
                <StatusBadge 
                  status={challenge.status}
                  variant={variant as any}
                  size={size === 'compact' ? 'sm' : 'md'}
                  animated={variant === 'live' || challenge.status === 'ongoing'}
                  showCountdown={variant === 'upcoming'}
                  startTime={challenge.scheduled_time}
                />
              )}
              {challenge.type && (
                <Badge 
                  variant="outline" 
                  className="border-border/50 dark:border-border/30 bg-background/50 dark:bg-card/50"
                >
                  {challenge.type}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground/80 dark:text-muted-foreground/60">
              {formatDateTime(challenge.created_at)}
            </div>
          </div>
          {/* Enhanced Challenge Content */}
          <div className="space-y-4 relative z-10">
            {/* Challenge Title and Reward */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground dark:text-foreground/95 mb-1 line-clamp-2">
                  {challenge.title || challenge.message || 'Thách đấu'}
                </h3>
                {challenge.description && size !== 'compact' && (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 line-clamp-2">
                    {challenge.description}
                  </p>
                )}
              </div>
              {challenge.bet_amount && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  {challenge.bet_amount.toLocaleString()} Credits
                </div>
              )}
            </div>

            {/* Enhanced Players Section */}
            <div className="flex items-center justify-between">
              <AvatarWithStatus
                profile={challenge.challenger_profile}
                size={size === 'compact' ? 'sm' : 'md'}
                showStatus={variant === 'live'}
                showRank={true}
                className="flex-1"
              />

              <div className="mx-4 text-center">
                <div className="text-muted-foreground dark:text-muted-foreground/80 text-lg font-bold">
                  vs
                </div>
                {challenge.bet_amount && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    {challenge.bet_amount.toLocaleString()} Credits
                  </div>
                )}
              </div>

              <AvatarWithStatus
                profile={challenge.opponent_profile}
                size={size === 'compact' ? 'sm' : 'md'}
                showStatus={variant === 'live'}
                showRank={true}
                className="flex-1"
              />
            </div>

            {/* Enhanced Challenge Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {challenge.bet_amount && (
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground dark:text-muted-foreground/80" />
                  <span className="text-foreground dark:text-foreground/90">
                    {challenge.bet_amount.toLocaleString()} Credits
                  </span>
                </div>
              )}

              {challenge.race_to && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground dark:text-muted-foreground/80" />
                  <span className="text-foreground dark:text-foreground/90">Race to {challenge.race_to}</span>
                </div>
              )}

              {challenge.scheduled_time && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground dark:text-muted-foreground/80" />
                  <span className="text-foreground dark:text-foreground/90">
                    {formatDateTime(challenge.scheduled_time)}
                  </span>
                </div>
              )}

              {challenge.location && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground dark:text-muted-foreground/80" />
                  <span className="text-foreground dark:text-foreground/90">{challenge.location}</span>
                </div>
              )}
            </div>

            {/* Enhanced Score Section */}
            {challenge.status === 'completed' && (challenge.challenger_final_score || challenge.opponent_final_score) && (
              <div className="flex items-center justify-center gap-4 p-3 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border/50 dark:border-border/30">
                <div className="text-center">
                  <div className="font-bold text-xl text-foreground dark:text-foreground/95">
                    {challenge.challenger_final_score || 0}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                    Challenger
                  </div>
                </div>
                <div className="text-muted-foreground dark:text-muted-foreground/80 text-lg">-</div>
                <div className="text-center">
                  <div className="font-bold text-xl text-foreground dark:text-foreground/95">
                    {challenge.opponent_final_score || 0}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                    Opponent
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Actions */}
            {showQuickActions && (
              <div className="flex gap-2 pt-2">
                {challenge.status === 'pending' && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(challenge.id, 'join');
                    }}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Tham gia
                  </Button>
                )}
                {challenge.status === 'ongoing' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-600 hover:bg-red-50 dark:border-red-400/50 dark:text-red-400 dark:hover:bg-red-950/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(challenge.id, 'watch');
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Xem trực tiếp
                  </Button>
                )}
                {challenge.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground dark:text-muted-foreground/80 dark:hover:text-foreground/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(challenge.id, 'view');
                    }}
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    Xem chi tiết
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Grid component for multiple cards
interface EnhancedChallengeCardGridProps {
  challenges: (Challenge | ExtendedChallenge)[];
  variant?: FlexibleEnhancedChallengeCardProps['variant'];
  size?: FlexibleEnhancedChallengeCardProps['size'];
  onAction?: FlexibleEnhancedChallengeCardProps['onAction'];
  onCardClick?: FlexibleEnhancedChallengeCardProps['onCardClick'];
  className?: string;
}

const EnhancedChallengeCardGrid: React.FC<EnhancedChallengeCardGridProps> = ({
  challenges,
  variant,
  size,
  onAction,
  onCardClick,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {challenges.map((challenge) => (
        <EnhancedChallengeCard
          key={challenge.id}
          challenge={challenge}
          variant={variant}
          size={size}
          onAction={onAction}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};

export { EnhancedChallengeCard, EnhancedChallengeCardGrid };
export default EnhancedChallengeCard;
