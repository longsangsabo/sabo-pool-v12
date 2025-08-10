import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Trophy, Star, Users } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OpenChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
  currentUser?: any;
  isJoining?: boolean;
  winRateInfo?: {
    winRate: number;
    wins: number;
    losses: number;
    total: number;
  } | null;
}

export const OpenChallengeCard: React.FC<OpenChallengeCardProps> = ({
  challenge,
  onJoin,
  currentUser,
  isJoining = false,
  winRateInfo,
}) => {
  const canJoin = currentUser && challenge.challenger_id !== currentUser.id;
  const isExpired =
    challenge.expires_at && new Date(challenge.expires_at) < new Date();

  const handleJoin = () => {
    if (canJoin && !isExpired) {
      onJoin(challenge.id);
    }
  };

  return (
    <Card className='bg-white/70 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/70 dark:hover:border-slate-600/70 transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/20 shadow-lg'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <Avatar className='w-10 h-10'>
              <AvatarImage src={challenge.challenger_profile?.avatar_url} />
              <AvatarFallback className='bg-slate-700/50 text-slate-300 dark:bg-slate-600/50 dark:text-slate-200'>
                {challenge.challenger_profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-sm text-slate-800 dark:text-slate-200 truncate'>
                {challenge.challenger_profile?.full_name || 'Unknown Player'}
              </h3>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
                  <span>
                    Rank: {challenge.challenger_profile?.current_rank || 'K'}
                  </span>
                  <span>•</span>
                  <span>
                    {(challenge.challenger_profile as any)?.spa_points || 0} SPA
                  </span>
                </div>
                {winRateInfo && winRateInfo.total >= 5 && (
                  <div className='text-[10px] text-emerald-600 dark:text-emerald-400 font-medium'>
                    Win rate: {(winRateInfo.winRate * 100).toFixed(0)}% (
                    {winRateInfo.wins}-{winRateInfo.losses})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badge positioned to avoid overlap with absolute positioned CountdownChip */}
          <div className='flex-shrink-0 ml-3'>
            <Badge
              variant={isExpired ? 'destructive' : 'secondary'}
              className='text-xs whitespace-nowrap'
            >
              {isExpired ? 'Hết hạn' : 'Mở'}
            </Badge>
          </div>
        </div>

        {/* Challenge Details */}
        <div className='space-y-2 mb-4'>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-1 text-slate-600 dark:text-slate-300'>
              <Star className='w-4 h-4' />
              <span className='font-semibold'>{challenge.bet_points} SPA</span>
            </div>
            <div className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
              <Trophy className='w-4 h-4' />
              <span>Race to {challenge.race_to}</span>
            </div>
          </div>

          {challenge.message && (
            <p className='text-sm text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/70 backdrop-blur-sm p-2 rounded text-center italic'>
              "{challenge.message}"
            </p>
          )}

          <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-400'>
            <div className='flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              <span>
                {formatDistanceToNow(new Date(challenge.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
            {challenge.expires_at && (
              <span
                className={
                  isExpired ? 'text-slate-400 dark:text-slate-500' : ''
                }
              >
                Hết hạn{' '}
                {formatDistanceToNow(new Date(challenge.expires_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleJoin}
          disabled={!canJoin || isExpired || isJoining}
          className={`w-full relative ${isJoining ? 'opacity-90 cursor-wait' : ''}`}
          variant={canJoin && !isExpired ? 'default' : 'secondary'}
          size='sm'
        >
          {isJoining ? (
            <span className='flex items-center gap-2'>
              <span className='w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin'></span>
              <span>Đang tham gia...</span>
            </span>
          ) : !canJoin ? (
            challenge.challenger_id === currentUser?.id ? (
              'Thách đấu của bạn'
            ) : (
              'Không thể tham gia'
            )
          ) : isExpired ? (
            'Đã hết hạn'
          ) : (
            <>
              <Users className='w-4 h-4 mr-1' />
              Tham gia thách đấu
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
