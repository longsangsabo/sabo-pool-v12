import React from 'react';
import { Challenge } from '@/types/challenge';

// Temporary simplified component for immediate fixing
interface SimpleChallengeCardProps {
  challenge: Challenge;
  variant?: 'open' | 'live' | 'upcoming' | 'completed';
  size?: 'compact' | 'default' | 'large';
  currentUserId?: string;
  onAction?: (challengeId: string, action: string) => void;
  onCardClick?: (challengeId: string) => void;
  isLoading?: boolean;
}

const SimpleChallengeCard: React.FC<SimpleChallengeCardProps> = ({
  challenge,
  variant = 'open',
  currentUserId,
  onAction,
  onCardClick,
  isLoading = false,
}) => {
  const handleClick = () => {
    onCardClick?.(challenge.id);
  };

  const handleAction = (action: string) => {
    onAction?.(challenge.id, action);
  };

  return (
    <div 
      className={`
        p-4 bg-white rounded-lg border shadow-sm cursor-pointer
        hover:shadow-md transition-shadow
        ${isLoading ? 'opacity-50' : ''}
        ${variant === 'completed' ? 'bg-gray-50' : ''}
        ${variant === 'live' ? 'border-red-200 bg-red-50' : ''}
        ${variant === 'upcoming' ? 'border-yellow-200 bg-yellow-50' : ''}
      `}
      onClick={handleClick}
    >
      {/* Basic challenge info */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              {challenge.message || 'Thách đấu'}
            </h3>
            <p className="text-sm text-gray-500">
              {challenge.challenger_profile?.full_name || 'Player'}
            </p>
          </div>
          <span className={`
            px-2 py-1 text-xs rounded-full
            ${variant === 'live' ? 'bg-red-100 text-red-800' : ''}
            ${variant === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${variant === 'completed' ? 'bg-green-100 text-green-800' : ''}
            ${variant === 'open' ? 'bg-blue-100 text-blue-800' : ''}
          `}>
            {variant === 'open' && 'Mở'}
            {variant === 'live' && 'Đang chơi'}
            {variant === 'upcoming' && 'Sắp tới'}
            {variant === 'completed' && 'Hoàn thành'}
          </span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          {challenge.bet_points && (
            <div>Tiền cược: {challenge.bet_points.toLocaleString()} điểm</div>
          )}
          {challenge.status && (
            <div>Trạng thái: {challenge.status}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {variant === 'open' && !challenge.opponent_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('join');
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              Tham gia
            </button>
          )}
          {variant === 'live' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('watch');
              }}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Xem
            </button>
          )}
          {variant === 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('view');
              }}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Grid component
interface SimpleChallengeCardGridProps {
  challenges: Challenge[];
  variant?: 'open' | 'live' | 'upcoming' | 'completed';
  size?: 'compact' | 'default' | 'large';
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  currentUserId?: string;
  onAction?: (challengeId: string, action: string) => void;
  onCardClick?: (challengeId: string) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export const SimpleChallengeCardGrid: React.FC<SimpleChallengeCardGridProps> = ({
  challenges,
  variant = 'open',
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
      {challenges.map((challenge) => (
        <SimpleChallengeCard
          key={challenge.id}
          challenge={challenge}
          variant={variant}
          currentUserId={currentUserId}
          onAction={onAction}
          onCardClick={onCardClick}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export { SimpleChallengeCard };
export default SimpleChallengeCard;
