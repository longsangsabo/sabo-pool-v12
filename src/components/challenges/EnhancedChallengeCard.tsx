import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, DollarSign, Trophy, Users, 
  Eye, MessageCircle, Heart, Share2, Bookmark 
} from 'lucide-react';

import { StandardChallengeCardProps } from '@/types/challengeCard';
import { EnhancedAvatar, AvatarGroup } from './EnhancedAvatar';
import { EnhancedStatusBadge, StatusBadgeGroup } from './EnhancedStatusBadge';
import EnhancedActionButton, { 
  ActionButtonGroup, 
  QuickActionButton, 
  SmartActionButton 
} from './EnhancedActionButton';

const EnhancedChallengeCard: React.FC<StandardChallengeCardProps> = ({
  challenge,
  variant = 'default',
  size = 'default',
  showQuickActions = true,
  showStats = true,
  showBadges = true,
  showActions = true,
  isInteractive = true,
  isSelected = false,
  isLoading = false,
  currentUserId,
  onAction,
  onCardClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // Card size configurations
  const sizeConfigs = {
    compact: {
      cardClass: 'p-3',
      headerClass: 'space-y-2',
      contentClass: 'space-y-2',
      footerClass: 'pt-2',
      avatarSize: 'sm' as const,
      titleClass: 'text-sm font-medium',
      subtitleClass: 'text-xs text-muted-foreground'
    },
    default: {
      cardClass: 'p-4',
      headerClass: 'space-y-3',
      contentClass: 'space-y-3',
      footerClass: 'pt-3',
      avatarSize: 'default' as const,
      titleClass: 'text-base font-semibold',
      subtitleClass: 'text-sm text-muted-foreground'
    },
    large: {
      cardClass: 'p-6',
      headerClass: 'space-y-4',
      contentClass: 'space-y-4',
      footerClass: 'pt-4',
      avatarSize: 'lg' as const,
      titleClass: 'text-lg font-semibold',
      subtitleClass: 'text-base text-muted-foreground'
    }
  };

  const config = sizeConfigs[size];

  // Variant styles
  const variantStyles = {
    default: 'border-border hover:border-primary/50',
    featured: 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent',
    urgent: 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-transparent',
    completed: 'border-muted-foreground/20 bg-muted/20',
    minimal: 'border-transparent shadow-none hover:shadow-sm'
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date/time
  const formatDateTime = (date: string | Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Calculate match stats
  const getMatchStats = () => {
    const stats = [];
    
    if (challenge.views_count) {
      stats.push({ icon: Eye, label: `${challenge.views_count}`, tooltip: 'Lượt xem' });
    }
    
    if (challenge.comments_count) {
      stats.push({ icon: MessageCircle, label: `${challenge.comments_count}`, tooltip: 'Bình luận' });
    }
    
    if (challenge.likes_count) {
      stats.push({ icon: Heart, label: `${challenge.likes_count}`, tooltip: 'Lượt thích' });
    }

    return stats;
  };

  const matchStats = getMatchStats();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={isInteractive ? { y: -2, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className={`
          relative overflow-hidden transition-all duration-300 cursor-pointer
          ${variantStyles[variant]}
          ${isSelected ? 'ring-2 ring-primary' : ''}
          ${isHovered ? 'shadow-lg' : 'shadow-sm'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onCardClick?.(challenge.id)}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions */}
        {showQuickActions && (
          <div className="absolute top-2 right-2 flex gap-1">
            <QuickActionButton
              action="bookmark"
              onClick={(e) => {
                e?.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              position="top-right"
              className={isBookmarked ? 'text-primary' : ''}
            />
            <QuickActionButton
              action="share"
              onClick={(e) => {
                e?.stopPropagation();
                // Handle share
              }}
              position="top-right"
            />
          </div>
        )}

        <CardHeader className={config.headerClass}>
          {/* Status badges */}
          {showBadges && (
            <div className="flex items-center justify-between">
              <StatusBadgeGroup
                status={challenge.status}
                startTime={challenge.start_time}
                urgency={challenge.urgency}
                size={size === 'compact' ? 'sm' : 'default'}
              />
              
              {challenge.type && (
                <Badge variant="outline" className="text-xs">
                  {challenge.type}
                </Badge>
              )}
            </div>
          )}

          {/* Title and description */}
          <div className="space-y-1">
            <h3 className={config.titleClass} title={challenge.title}>
              {challenge.title}
            </h3>
            {challenge.description && size !== 'compact' && (
              <p className={`${config.subtitleClass} line-clamp-2`}>
                {challenge.description}
              </p>
            )}
          </div>

          {/* Players */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {challenge.challenger && (
                <div className="flex items-center gap-2">
                  <EnhancedAvatar
                    user={challenge.challenger}
                    size={config.avatarSize}
                    showRank={true}
                    showOnlineStatus={true}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {challenge.challenger.full_name || challenge.challenger.username}
                    </p>
                    {challenge.challenger.rank && size !== 'compact' && (
                      <p className="text-xs text-muted-foreground">
                        Rank {challenge.challenger.rank}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {challenge.challenger && challenge.opponent && (
                <div className="text-muted-foreground text-lg font-bold">vs</div>
              )}

              {challenge.opponent ? (
                <div className="flex items-center gap-2">
                  <EnhancedAvatar
                    user={challenge.opponent}
                    size={config.avatarSize}
                    showRank={true}
                    showOnlineStatus={true}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {challenge.opponent.full_name || challenge.opponent.username}
                    </p>
                    {challenge.opponent.rank && size !== 'compact' && (
                      <p className="text-xs text-muted-foreground">
                        Rank {challenge.opponent.rank}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Chờ đối thủ</span>
                </div>
              )}
            </div>

            {/* Winner indicator */}
            {challenge.status === 'completed' && challenge.winner_id && (
              <div className="flex items-center gap-1 text-warning">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {challenge.winner_id === challenge.challenger_id ? 'Challenger' : 'Opponent'}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={config.contentClass}>
          {/* Match details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {challenge.bet_amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">
                  {formatCurrency(challenge.bet_amount)}
                </span>
              </div>
            )}

            {challenge.start_time && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDateTime(challenge.start_time)}</span>
              </div>
            )}

            {challenge.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{challenge.location}</span>
              </div>
            )}

            {challenge.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{challenge.duration} phút</span>
              </div>
            )}
          </div>

          {/* Score display for completed matches */}
          {challenge.status === 'completed' && (challenge.challenger_score !== null || challenge.opponent_score !== null) && (
            <>
              <Separator />
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4 font-mono text-lg font-bold">
                  <span className={challenge.winner_id === challenge.challenger_id ? 'text-primary' : ''}>
                    {challenge.challenger_score ?? '-'}
                  </span>
                  <span className="text-muted-foreground">:</span>
                  <span className={challenge.winner_id === challenge.opponent_id ? 'text-primary' : ''}>
                    {challenge.opponent_score ?? '-'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          {showStats && matchStats.length > 0 && size !== 'compact' && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {matchStats.map(({ icon: Icon, label, tooltip }, index) => (
                  <div key={index} className="flex items-center gap-1" title={tooltip}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>

        {/* Actions */}
        {showActions && (
          <CardFooter className={config.footerClass}>
            <SmartActionButton
              challenge={challenge}
              currentUserId={currentUserId}
              onAction={onAction}
              className="w-full"
            />
          </CardFooter>
        )}

        {/* Hover effects */}
        <AnimatePresence>
          {isHovered && isInteractive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// Grid layout component for challenge cards
interface ChallengeCardGridProps {
  challenges: any[];
  variant?: StandardChallengeCardProps['variant'];
  size?: StandardChallengeCardProps['size'];
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  currentUserId?: string;
  onAction?: StandardChallengeCardProps['onAction'];
  onCardClick?: StandardChallengeCardProps['onCardClick'];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export const ChallengeCardGrid: React.FC<ChallengeCardGridProps> = ({
  challenges,
  variant = 'default',
  size = 'default',
  columns = 2,
  gap = 'md',
  currentUserId,
  onAction,
  onCardClick,
  isLoading = false,
  emptyState,
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (!isLoading && challenges.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      <AnimatePresence mode="popLayout">
        {challenges.map((challenge) => (
          <EnhancedChallengeCard
            key={challenge.id}
            challenge={challenge}
            variant={variant}
            size={size}
            currentUserId={currentUserId}
            onAction={onAction}
            onCardClick={onCardClick}
            isLoading={isLoading}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedChallengeCard;
