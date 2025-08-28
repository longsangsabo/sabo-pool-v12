import React from 'react';
import { clsx } from 'clsx';
import { 
  Play, 
  Pause, 
  Clock, 
  Users, 
  Eye, 
  MessageCircle, 
  Trophy,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';

interface LiveMatchStatusProps {
  matchId: string;
  status: 'waiting' | 'in-progress' | 'paused' | 'completed' | 'cancelled';
  player1: {
    id: string;
    name: string;
    avatar?: string;
    score?: number;
  };
  player2: {
    id: string;
    name: string;
    avatar?: string;
    score?: number;
  };
  spectatorCount?: number;
  chatEnabled?: boolean;
  estimatedDuration?: number; // in minutes
  elapsedTime?: number; // in seconds
  round?: string;
  table?: string;
  onJoinSpectate?: () => void;
  onJoinChat?: () => void;
  className?: string;
}

export const LiveMatchStatus: React.FC<LiveMatchStatusProps> = ({
  matchId,
  status,
  player1,
  player2,
  spectatorCount = 0,
  chatEnabled = true,
  estimatedDuration,
  elapsedTime = 0,
  round,
  table,
  onJoinSpectate,
  onJoinChat,
  className
}) => {
  const statusConfig = {
    'waiting': {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: Clock,
      label: 'Waiting to Start',
      pulse: false
    },
    'in-progress': {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: Play,
      label: 'Live',
      pulse: true
    },
    'paused': {
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: Pause,
      label: 'Paused',
      pulse: false
    },
    'completed': {
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Trophy,
      label: 'Completed',
      pulse: false
    },
    'cancelled': {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      label: 'Cancelled',
      pulse: false
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!estimatedDuration || estimatedDuration === 0) return 0;
    return Math.min((elapsedTime / (estimatedDuration * 60)) * 100, 100);
  };

  return (
    <div className={clsx(
      'bg-white rounded-lg border shadow-sm overflow-hidden',
      config.border,
      className
    )}>
      {/* Header */}
      <div className={clsx('px-4 py-3 border-b', config.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <StatusIcon className={clsx('w-5 h-5', config.color)} />
              {config.pulse && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className={clsx('font-semibold', config.color)}>
              {config.label}
            </span>
            {round && (
              <span className="text-sm text-gray-600">
                • {round}
              </span>
            )}
            {table && (
              <span className="text-sm text-gray-600">
                • Table {table}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            {spectatorCount > 0 && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{spectatorCount}</span>
              </div>
            )}
            
            {elapsedTime > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="font-mono">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        {estimatedDuration && status === 'in-progress' && (
          <div className="mt-2">
            <div className="w-full bg-white bg-opacity-50 rounded-full h-1">
              <div 
                className={clsx(
                  'h-1 rounded-full transition-all duration-1000',
                  'bg-gradient-to-r from-blue-500 to-green-500'
                )}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Match Content */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Player 1 */}
          <div className="text-center">
            <div className="flex flex-col items-center space-y-2">
              {player1.avatar ? (
                <img 
                  src={player1.avatar} 
                  alt={player1.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 text-sm truncate max-w-full">
                  {player1.name}
                </h4>
                {player1.score !== undefined && (
                  <p className="text-lg font-bold text-blue-600">
                    {player1.score}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">VS</div>
          </div>

          {/* Player 2 */}
          <div className="text-center">
            <div className="flex flex-col items-center space-y-2">
              {player2.avatar ? (
                <img 
                  src={player2.avatar} 
                  alt={player2.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 text-sm truncate max-w-full">
                  {player2.name}
                </h4>
                {player2.score !== undefined && (
                  <p className="text-lg font-bold text-red-600">
                    {player2.score}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(status === 'in-progress' || status === 'waiting') && (
          <div className="mt-4 flex space-x-2">
            {onJoinSpectate && (
              <button
                onClick={onJoinSpectate}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Watch Live</span>
              </button>
            )}
            
            {chatEnabled && onJoinChat && (
              <button
                onClick={onJoinChat}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Live matches grid component
interface LiveMatchesGridProps {
  matches: Array<{
    id: string;
    status: 'waiting' | 'in-progress' | 'paused' | 'completed' | 'cancelled';
    player1: { id: string; name: string; avatar?: string; score?: number };
    player2: { id: string; name: string; avatar?: string; score?: number };
    spectatorCount?: number;
    elapsedTime?: number;
    round?: string;
    table?: string;
  }>;
  onMatchClick?: (matchId: string) => void;
  className?: string;
}

export const LiveMatchesGrid: React.FC<LiveMatchesGridProps> = ({
  matches,
  onMatchClick,
  className
}) => {
  const liveMatches = matches.filter(m => m.status === 'in-progress');
  const waitingMatches = matches.filter(m => m.status === 'waiting');
  const otherMatches = matches.filter(m => !['in-progress', 'waiting'].includes(m.status));

  if (matches.length === 0) {
    return (
      <div className={clsx('text-center p-8 text-gray-500', className)}>
        <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Active Matches</h3>
        <p>Check back later for live tournament action!</p>
      </div>
    );
  }

  const sortedMatches = [...liveMatches, ...waitingMatches, ...otherMatches];

  return (
    <div className={clsx('space-y-4', className)}>
      {liveMatches.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Live Now</h3>
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {liveMatches.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((match) => (
              <div 
                key={match.id}
                onClick={() => onMatchClick?.(match.id)}
                className="cursor-pointer transform hover:scale-105 transition-transform"
              >
                <LiveMatchStatus {...match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {waitingMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Starting Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingMatches.map((match) => (
              <div 
                key={match.id}
                onClick={() => onMatchClick?.(match.id)}
                className="cursor-pointer"
              >
                <LiveMatchStatus {...match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {otherMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMatches.map((match) => (
              <div 
                key={match.id}
                onClick={() => onMatchClick?.(match.id)}
                className="cursor-pointer"
              >
                <LiveMatchStatus {...match} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
