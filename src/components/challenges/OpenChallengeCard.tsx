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
}

export const OpenChallengeCard: React.FC<OpenChallengeCardProps> = ({
  challenge,
  onJoin,
  currentUser,
  isJoining = false,
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
    <Card className='bg-slate-900/30 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-700/30 hover:border-slate-300/30 dark:hover:border-slate-600/40 transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/10'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <Avatar className='w-10 h-10'>
              <AvatarImage src={challenge.challenger_profile?.avatar_url} />
              <AvatarFallback className='bg-slate-700/50 text-slate-300 dark:bg-slate-600/50 dark:text-slate-200'>
                {challenge.challenger_profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-semibold text-sm text-slate-800 dark:text-slate-200'>
                {challenge.challenger_profile?.full_name || 'Unknown Player'}
              </h3>
              <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
                <span>
                  Rank: {challenge.challenger_profile?.current_rank || 'K'}
                </span>
                <span>•</span>
                <span>
                  {(challenge.challenger_profile as any)?.spa_points || 0} SPA
                </span>
              </div>
            </div>
          </div>

          <Badge
            variant={isExpired ? 'destructive' : 'secondary'}
            className='text-xs'
          >
            {isExpired ? 'Hết hạn' : 'Mở'}
          </Badge>
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
            <p className='text-sm text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 p-2 rounded text-center italic'>
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
          className='w-full'
          variant={canJoin && !isExpired ? 'default' : 'secondary'}
          size='sm'
        >
          {isJoining ? (
            'Đang tham gia...'
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
