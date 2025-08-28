import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Target, Zap, Trophy, Timer, Users } from 'lucide-react';

interface ScoreTrackerProps {
  player1: {
    id: string;
    name: string;
    avatar?: string;
    score: number;
  };
  player2: {
    id: string;
    name: string;
    avatar?: string;
    score: number;
  };
  matchType: 'race-to' | 'timed' | 'best-of';
  target: number;
  timeLimit?: number; // in seconds
  isLive?: boolean;
  onScoreUpdate?: (playerId: string, newScore: number) => void;
  className?: string;
}

export const ScoreTracker: React.FC<ScoreTrackerProps> = ({
  player1,
  player2,
  matchType,
  target,
  timeLimit,
  isLive = false,
  onScoreUpdate,
  className
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [isActive, setIsActive] = useState(isLive);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLimit && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (score: number) => {
    if (matchType === 'timed') return 0;
    return Math.min((score / target) * 100, 100);
  };

  const isWinner = (score: number) => {
    if (matchType === 'race-to') return score >= target;
    if (matchType === 'best-of') return score > target / 2;
    return false;
  };

  const leadingPlayer = player1.score > player2.score ? player1 : player2.score > player1.score ? player2 : null;

  return (
    <div className={clsx(
      'bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden',
      isLive && 'ring-2 ring-green-500 ring-opacity-50',
      className
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span className="font-semibold">
              {matchType === 'race-to' && `Race to ${target}`}
              {matchType === 'best-of' && `Best of ${target}`}
              {matchType === 'timed' && `Timed Match`}
            </span>
          </div>
          
          {isLive && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        {timeLimit && (
          <div className="mt-2 flex items-center space-x-2">
            <Timer className="w-4 h-4" />
            <div className="flex-1">
              <div className="bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-mono">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Player 1 */}
          <div className={clsx(
            'text-center space-y-3 p-4 rounded-lg transition-all',
            isWinner(player1.score) && 'bg-green-50 border border-green-200',
            leadingPlayer?.id === player1.id && !isWinner(player1.score) && 'bg-blue-50 border border-blue-200'
          )}>
            <div className="flex flex-col items-center space-y-2">
              {player1.avatar ? (
                <img 
                  src={player1.avatar} 
                  alt={player1.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900 truncate max-w-full">
                {player1.name}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className={clsx(
                'text-4xl font-bold',
                isWinner(player1.score) ? 'text-green-600' : 'text-gray-900'
              )}>
                {player1.score}
              </div>
              
              {matchType !== 'timed' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={clsx(
                      'h-2 rounded-full transition-all duration-500',
                      isWinner(player1.score) ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${getProgress(player1.score)}%` }}
                  />
                </div>
              )}
            </div>
            
            {isWinner(player1.score) && (
              <div className="flex items-center justify-center space-x-1 text-green-600">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">Winner!</span>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <div className="relative">
              <div className="text-2xl font-bold text-gray-400">VS</div>
              {leadingPlayer && !isWinner(player1.score) && !isWinner(player2.score) && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 text-xs text-blue-600">
                    <Zap className="w-3 h-3" />
                    <span>Leading</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Player 2 */}
          <div className={clsx(
            'text-center space-y-3 p-4 rounded-lg transition-all',
            isWinner(player2.score) && 'bg-green-50 border border-green-200',
            leadingPlayer?.id === player2.id && !isWinner(player2.score) && 'bg-blue-50 border border-blue-200'
          )}>
            <div className="flex flex-col items-center space-y-2">
              {player2.avatar ? (
                <img 
                  src={player2.avatar} 
                  alt={player2.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900 truncate max-w-full">
                {player2.name}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className={clsx(
                'text-4xl font-bold',
                isWinner(player2.score) ? 'text-green-600' : 'text-gray-900'
              )}>
                {player2.score}
              </div>
              
              {matchType !== 'timed' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={clsx(
                      'h-2 rounded-full transition-all duration-500',
                      isWinner(player2.score) ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${getProgress(player2.score)}%` }}
                  />
                </div>
              )}
            </div>
            
            {isWinner(player2.score) && (
              <div className="flex items-center justify-center space-x-1 text-green-600">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">Winner!</span>
              </div>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>Target: {target}</span>
            </div>
            {timeLimit && (
              <div className="flex items-center space-x-1">
                <Timer className="w-4 h-4" />
                <span>Time: {formatTime(timeLimit)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
