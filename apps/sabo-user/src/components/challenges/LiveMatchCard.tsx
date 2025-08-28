import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, MapPin, Clock } from 'lucide-react';

interface LiveMatchCardProps {
  match: {
    id: string;
    player1: {
      name: string;
      avatar?: string;
      rank: string;
    };
    player2: {
      name: string;
      avatar?: string;
      rank: string;
    };
    score: {
      player1: number;
      player2: number;
    };
    raceToTarget: number;
    location?: string;
    startTime: string;
    estimatedEndTime?: string;
    betPoints?: number;
  };
  onWatch?: (matchId: string) => void;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, onWatch }) => {
  const progress1 = (match.score.player1 / match.raceToTarget) * 100;
  const progress2 = (match.score.player2 / match.raceToTarget) * 100;

  return (
    <Card className='bg-slate-900/30 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-700/30 hover:border-slate-300/30 dark:hover:border-slate-600/40 transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/10'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <div className='w-3 h-3 bg-slate-500 rounded-full animate-pulse'></div>
              <div className='absolute inset-0 w-3 h-3 bg-slate-400 rounded-full animate-ping'></div>
            </div>
            <Badge
              variant='destructive'
              className='bg-slate-600 dark:bg-slate-700 text-slate-100 animate-pulse border-slate-400 dark:border-slate-600'
            >
              LIVE
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            {match.betPoints && (
              <Badge
                variant='outline'
                className='text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
              >
                {match.betPoints} SPA
              </Badge>
            )}
            <Button
              size='sm'
              variant='outline'
              onClick={() => onWatch?.(match.id)}
              className='gap-1 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            >
              <Eye className='w-4 h-4' />
              WATCH
            </Button>
          </div>
        </div>

        {/* Players and Score */}
        <div className='grid grid-cols-5 gap-3 items-center mb-4'>
          {/* Player 1 */}
          <div className='col-span-2 text-center'>
            <Avatar className='w-12 h-12 mx-auto mb-2'>
              <AvatarImage src={match.player1.avatar} />
              <AvatarFallback className='bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'>
                {match.player1.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className='text-sm font-semibold truncate text-slate-700 dark:text-slate-300'>
              {match.player1.name}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              {match.player1.rank}
            </div>
          </div>

          {/* Score */}
          <div className='text-center'>
            <div className='text-2xl font-bold text-slate-600 dark:text-slate-300'>
              {match.score.player1} - {match.score.player2}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              Race to {match.raceToTarget}
            </div>
          </div>

          {/* Player 2 */}
          <div className='col-span-2 text-center'>
            <Avatar className='w-12 h-12 mx-auto mb-2'>
              <AvatarImage src={match.player2.avatar} />
              <AvatarFallback className='bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'>
                {match.player2.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className='text-sm font-semibold truncate text-slate-700 dark:text-slate-300'>
              {match.player2.name}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              {match.player2.rank}
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div className='space-y-2 mb-4'>
          <div className='flex items-center gap-2'>
            <div className='text-xs font-medium w-20 truncate text-slate-700 dark:text-slate-300'>
              {match.player1.name}
            </div>
            <div className='flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-400 dark:to-slate-500 h-2 rounded-full transition-all duration-300'
                style={{ width: `${progress1}%` }}
              />
            </div>
            <div className='text-xs font-bold w-6 text-slate-700 dark:text-slate-300'>
              {match.score.player1}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <div className='text-xs font-medium w-20 truncate text-slate-700 dark:text-slate-300'>
              {match.player2.name}
            </div>
            <div className='flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 h-2 rounded-full transition-all duration-300'
                style={{ width: `${progress2}%` }}
              />
            </div>
            <div className='text-xs font-bold w-6 text-slate-700 dark:text-slate-300'>
              {match.score.player2}
            </div>
          </div>
        </div>

        {/* Match info */}
        <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-400'>
          <div className='flex items-center gap-1'>
            <Clock className='w-3 h-3' />
            <span>
              Bắt đầu: {new Date(match.startTime).toLocaleTimeString('vi-VN')}
            </span>
          </div>
          {match.location && (
            <div className='flex items-center gap-1'>
              <MapPin className='w-3 h-3' />
              <span className='truncate max-w-24'>{match.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveMatchCard;
