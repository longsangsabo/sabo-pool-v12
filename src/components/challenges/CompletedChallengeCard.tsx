import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Calendar, Target, Star } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CompletedChallengeCardProps {
  challenge: any;
  onView: () => void;
}

export const CompletedChallengeCard: React.FC<CompletedChallengeCardProps> = ({
  challenge,
  onView,
}) => {
  const timeAgo = challenge.completed_at
    ? formatDistanceToNow(parseISO(challenge.completed_at), {
        addSuffix: true,
        locale: vi,
      })
    : 'Vừa xong';

  const isWinner = (userId: string) => challenge.winner_id === userId;

  const challengerWon = isWinner(challenge.challenger_id);
  const opponentWon = isWinner(challenge.opponent_id);

  return (
    <Card className='bg-slate-900/30 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-700/30 hover:border-slate-300/30 dark:hover:border-slate-600/40 transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/10'>
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <Badge
              variant='default'
              className='bg-slate-600 dark:bg-slate-700 text-slate-100'
            >
              <Trophy className='w-3 h-3 mr-1' />
              Hoàn thành
            </Badge>
            <Badge
              variant='outline'
              className='border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            >
              <Target className='w-3 h-3 mr-1' />
              Race to {challenge.race_to}
            </Badge>
          </div>
          <div className='text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1'>
            <Calendar className='w-3 h-3' />
            {timeAgo}
          </div>
        </div>

        {/* Players and Score */}
        <div className='flex items-center justify-between mb-4'>
          {/* Challenger */}
          <div className='flex items-center gap-3'>
            <Avatar
              className={`w-10 h-10 border-2 ${challengerWon ? 'border-slate-400 dark:border-slate-500' : 'border-slate-200 dark:border-slate-600'}`}
            >
              <AvatarImage src={challenge.challenger_profile?.avatar_url} />
              <AvatarFallback
                className={
                  challengerWon
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }
              >
                {challenge.challenger_profile?.full_name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div
                className={`font-semibold ${challengerWon ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}
              >
                {challenge.challenger_profile?.full_name || 'Challenger'}
                {challengerWon && ' 🏆'}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400'>
                Challenger
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className='flex flex-col items-center'>
            <div className='text-2xl font-bold text-slate-700 dark:text-slate-300'>
              {challenge.challenger_score} - {challenge.opponent_score}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded'>
              Tỷ số cuối
            </div>
          </div>

          {/* Opponent */}
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <div
                className={`font-semibold ${opponentWon ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}
              >
                {opponentWon && '🏆 '}
                {challenge.opponent_profile?.full_name || 'Opponent'}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400'>
                Opponent
              </div>
            </div>
            <Avatar
              className={`w-10 h-10 border-2 ${opponentWon ? 'border-slate-400 dark:border-slate-500' : 'border-slate-200 dark:border-slate-600'}`}
            >
              <AvatarImage src={challenge.opponent_profile?.avatar_url} />
              <AvatarFallback
                className={
                  opponentWon
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }
              >
                {challenge.opponent_profile?.full_name?.charAt(0) || 'O'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Bet Points Display */}
        {challenge.bet_points && (
          <div className='flex items-center justify-center mb-3'>
            <Badge
              variant='outline'
              className='border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            >
              <Star className='w-3 h-3 mr-1' />
              {challenge.bet_points} SPA
            </Badge>
          </div>
        )}

        {/* Winner Display */}
        <div className='text-center mb-3'>
          <div className='text-sm font-medium text-green-700 dark:text-green-400'>
            🎉 Người thắng:{' '}
            {challenge.winner_profile?.full_name || 'Chưa xác định'}
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant='outline'
          onClick={onView}
          className='w-full border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950'
        >
          Xem chi tiết kết quả
        </Button>

        {/* Challenge Message */}
        {challenge.message && (
          <div className='mt-3 p-2 bg-green-50 dark:bg-green-950 rounded text-xs text-green-700 dark:text-green-400 border-l-2 border-green-400 dark:border-green-600'>
            💬 {challenge.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
