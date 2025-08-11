import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, ChevronUp, MoreVertical, 
  Calendar, Clock, MapPin, DollarSign, Users, Trophy 
} from 'lucide-react';

import { StandardChallengeCardProps } from '@/types/challengeCard';
import { EnhancedAvatar } from './EnhancedAvatar';
import { EnhancedStatusBadge } from './EnhancedStatusBadge';
import { SmartActionButton } from './EnhancedActionButton';

interface MobileChallengeCardProps extends Omit<StandardChallengeCardProps, 'size'> {
  layout?: 'compact' | 'list' | 'expanded';
  swipeActions?: {
    left?: { action: string; color: string; icon: React.ReactNode };
    right?: { action: string; color: string; icon: React.ReactNode };
  };
  onSwipeAction?: (challengeId: string, action: string) => void;
}

const MobileChallengeCard: React.FC<MobileChallengeCardProps> = ({
  challenge,
  variant = 'default',
  layout = 'compact',
  showQuickActions = true,
  showStats = true,
  showBadges = true,
  showActions = true,
  isInteractive = true,
  isSelected = false,
  isLoading = false,
  currentUserId,
  swipeActions,
  onAction,
  onCardClick,
  onSwipeAction,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [dragX, setDragX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Format currency for mobile
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  // Format time for mobile
  const formatTime = (date: string | Date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return 'Now';
  };

  // Handle swipe gestures
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x > threshold && swipeActions?.right) {
      onSwipeAction?.(challenge.id, swipeActions.right.action);
    } else if (info.offset.x < -threshold && swipeActions?.left) {
      onSwipeAction?.(challenge.id, swipeActions.left.action);
    }
    
    setDragX(0);
  };

  // Compact layout (default mobile view)
  const CompactLayout = () => (
    <div className="flex items-center gap-3 p-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <EnhancedAvatar
          user={challenge.challenger}
          size="sm"
          showRank={false}
          showOnlineStatus={true}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium truncate">{challenge.title}</h3>
          {showBadges && (
            <EnhancedStatusBadge
              status={challenge.status}
              startTime={challenge.start_time}
              size="sm"
            />
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {challenge.bet_amount && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>{formatCurrency(challenge.bet_amount)}</span>
            </div>
          )}
          
          {challenge.start_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(challenge.start_time)}</span>
            </div>
          )}

          {!challenge.opponent_id && (
            <div className="flex items-center gap-1 text-warning">
              <Users className="w-3 h-3" />
              <span>Open</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick action */}
      {showActions && (
        <div className="flex-shrink-0">
          <SmartActionButton
            challenge={challenge}
            currentUserId={currentUserId}
            onAction={onAction}
          />
        </div>
      )}
    </div>
  );

  // List layout (more details)
  const ListLayout = () => (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <EnhancedAvatar
            user={challenge.challenger}
            size="default"
            showRank={true}
            showOnlineStatus={true}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{challenge.title}</h3>
            <p className="text-xs text-muted-foreground">
              vs {challenge.opponent?.full_name || 'Open Challenge'}
            </p>
          </div>
        </div>
        
        {showBadges && (
          <EnhancedStatusBadge
            status={challenge.status}
            startTime={challenge.start_time}
            size="sm"
          />
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {challenge.bet_amount && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-medium">{formatCurrency(challenge.bet_amount)} VND</span>
          </div>
        )}

        {challenge.start_time && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formatTime(challenge.start_time)}</span>
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
            <span>{challenge.duration}min</span>
          </div>
        )}
      </div>

      {/* Action */}
      {showActions && (
        <SmartActionButton
          challenge={challenge}
          currentUserId={currentUserId}
          onAction={onAction}
          className="w-full"
        />
      )}
    </div>
  );

  // Expanded layout (full details)
  const ExpandedLayout = () => (
    <div className="p-4 space-y-4">
      {/* Header with expand/collapse */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <EnhancedAvatar
            user={challenge.challenger}
            size="lg"
            showRank={true}
            showOnlineStatus={true}
            showWinner={challenge.winner_id === challenge.challenger_id}
          />
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-1">{challenge.title}</h3>
            {challenge.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {challenge.description}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* VS section */}
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <EnhancedAvatar
              user={challenge.challenger}
              size="default"
              showRank={false}
              showWinner={challenge.winner_id === challenge.challenger_id}
            />
            <p className="text-xs mt-1 font-medium">
              {challenge.challenger?.full_name || 'Player 1'}
            </p>
          </div>
          
          <div className="text-lg font-bold text-muted-foreground">VS</div>
          
          <div className="text-center">
            {challenge.opponent ? (
              <>
                <EnhancedAvatar
                  user={challenge.opponent}
                  size="default"
                  showRank={false}
                  showWinner={challenge.winner_id === challenge.opponent_id}
                />
                <p className="text-xs mt-1 font-medium">
                  {challenge.opponent.full_name || 'Player 2'}
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs mt-1 text-muted-foreground">Open</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator className="mb-4" />
            
            {/* Detailed info */}
            <div className="space-y-3">
              {challenge.bet_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bet Amount</span>
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(challenge.bet_amount)} VND
                  </span>
                </div>
              )}

              {challenge.start_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start Time</span>
                  <span className="text-sm">{formatTime(challenge.start_time)}</span>
                </div>
              )}

              {challenge.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm">{challenge.location}</span>
                </div>
              )}

              {/* Score for completed matches */}
              {challenge.status === 'completed' && (
                <div className="text-center py-2">
                  <div className="text-2xl font-mono font-bold">
                    <span className={challenge.winner_id === challenge.challenger_id ? 'text-primary' : ''}>
                      {challenge.challenger_score ?? 0}
                    </span>
                    <span className="text-muted-foreground mx-2">:</span>
                    <span className={challenge.winner_id === challenge.opponent_id ? 'text-primary' : ''}>
                      {challenge.opponent_score ?? 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Final Score</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {showActions && (
        <SmartActionButton
          challenge={challenge}
          currentUserId={currentUserId}
          onAction={onAction}
          className="w-full"
        />
      )}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'compact': return <CompactLayout />;
      case 'list': return <ListLayout />;
      case 'expanded': return <ExpandedLayout />;
      default: return <CompactLayout />;
    }
  };

  return (
    <motion.div
      drag={swipeActions ? 'x' : false}
      dragConstraints={{ left: -150, right: 150 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onDrag={(event, info) => setDragX(info.offset.x)}
      className={`relative ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      {/* Swipe action backgrounds */}
      {swipeActions && (
        <>
          {/* Left swipe action */}
          {swipeActions.left && dragX < -20 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(Math.abs(dragX) / 100, 1) }}
              className={`absolute inset-y-0 right-0 flex items-center justify-end pr-4 ${swipeActions.left.color}`}
              style={{ width: Math.min(Math.abs(dragX), 150) }}
            >
              {swipeActions.left.icon}
            </motion.div>
          )}

          {/* Right swipe action */}
          {swipeActions.right && dragX > 20 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(dragX / 100, 1) }}
              className={`absolute inset-y-0 left-0 flex items-center justify-start pl-4 ${swipeActions.right.color}`}
              style={{ width: Math.min(dragX, 150) }}
            >
              {swipeActions.right.icon}
            </motion.div>
          )}
        </>
      )}

      {/* Main card */}
      <Card 
        className={`
          relative transition-all duration-200 cursor-pointer
          ${isDragging ? 'shadow-lg' : 'shadow-sm'}
          ${isSelected ? 'ring-2 ring-primary' : ''}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => onCardClick?.(challenge.id)}
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <CardContent className="p-0">
          {renderLayout()}
        </CardContent>
      </Card>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg"
          >
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Mobile-optimized list component
interface MobileChallengeListProps {
  challenges: any[];
  layout?: MobileChallengeCardProps['layout'];
  variant?: MobileChallengeCardProps['variant'];
  currentUserId?: string;
  enableSwipeActions?: boolean;
  onAction?: MobileChallengeCardProps['onAction'];
  onCardClick?: MobileChallengeCardProps['onCardClick'];
  onSwipeAction?: MobileChallengeCardProps['onSwipeAction'];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export const MobileChallengeList: React.FC<MobileChallengeListProps> = ({
  challenges,
  layout = 'compact',
  variant = 'default',
  currentUserId,
  enableSwipeActions = true,
  onAction,
  onCardClick,
  onSwipeAction,
  isLoading = false,
  emptyState,
  className = ''
}) => {
  const swipeActions = enableSwipeActions ? {
    left: { 
      action: 'delete', 
      color: 'bg-destructive/10', 
      icon: <div className="text-destructive">Delete</div> 
    },
    right: { 
      action: 'bookmark', 
      color: 'bg-primary/10', 
      icon: <div className="text-primary">Bookmark</div> 
    }
  } : undefined;

  if (!isLoading && challenges.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
          >
            <MobileChallengeCard
              challenge={challenge}
              layout={layout}
              variant={variant}
              currentUserId={currentUserId}
              swipeActions={swipeActions}
              onAction={onAction}
              onCardClick={onCardClick}
              onSwipeAction={onSwipeAction}
              isLoading={isLoading}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MobileChallengeCard;
