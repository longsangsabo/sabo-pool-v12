import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MatchScoreModal } from '@/components/challenges/MatchScoreModal';
import {
  Trophy,
  Target,
  Clock,
  DollarSign,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ActiveChallengeHighlightProps {
  challenges: any[];
  user: any;
  onChallengeClick?: (challenge: any) => void;
}

export const ActiveChallengeHighlight: React.FC<
  ActiveChallengeHighlightProps
> = ({ challenges, user, onChallengeClick }) => {
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  // Filter accepted challenges that user is part of - with null safety
  const acceptedChallenges = Array.isArray(challenges)
    ? challenges.filter(
        c =>
          c &&
          c.status === 'accepted' &&
          (c.challenger_id === user?.id || c.opponent_id === user?.id)
      )
    : [];

  // Debug log
  console.log('🔍 ActiveChallengeHighlight render:', {
    totalChallenges: challenges?.length || 0,
    acceptedChallenges: acceptedChallenges.length,
    userId: user?.id,
    challenges: challenges || 'null',
  });

  // Always show the component with a dedicated area
  const hasActiveChallenges = acceptedChallenges.length > 0;

  const handleScoreEntry = (challenge: any) => {
    setSelectedChallenge(challenge);
    setScoreModalOpen(true);
  };

  const getPlayerInfo = (challenge: any, isChallenger: boolean) => {
    if (isChallenger) {
      return {
        name:
          challenge.challenger_profile?.full_name ||
          challenge.challenger_profile?.display_name ||
          'Challenger',
        spa: challenge.challenger_profile?.spa_points || 0,
        avatar: challenge.challenger_profile?.avatar_url,
      };
    } else {
      return {
        name:
          challenge.opponent_profile?.full_name ||
          challenge.opponent_profile?.display_name ||
          'Opponent',
        spa: challenge.opponent_profile?.spa_points || 0,
        avatar: challenge.opponent_profile?.avatar_url,
      };
    }
  };

  return (
    <>
      <Card
        className={`${
          hasActiveChallenges
            ? 'bg-gradient-to-br from-green-50/80 via-emerald-50/70 to-green-100/60 dark:from-green-950/20 dark:via-emerald-950/15 dark:to-green-900/25 border border-green-200/50 dark:border-green-700/30 backdrop-blur-sm'
            : 'bg-gradient-to-br from-slate-50/80 via-slate-100/70 to-slate-200/60 dark:from-slate-900/20 dark:via-slate-800/15 dark:to-slate-700/25 border border-slate-200/50 dark:border-slate-700/30 backdrop-blur-sm'
        } shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <CardHeader className='pb-4'>
          <CardTitle
            className={`flex items-center gap-3 ${hasActiveChallenges ? 'text-green-800 dark:text-green-200' : 'text-slate-800 dark:text-slate-200'}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                hasActiveChallenges
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700'
                  : 'bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700'
              }`}
            >
              <Zap className='w-5 h-5 text-white drop-shadow-sm' />
            </div>
            <div>
              <h3 className='text-xl font-bold'>
                {hasActiveChallenges
                  ? 'Thách đấu đang chờ thi đấu'
                  : 'Khu vực thi đấu'}
              </h3>
              <p
                className={`text-sm font-normal ${
                  hasActiveChallenges
                    ? 'text-green-700/80 dark:text-green-300/80'
                    : 'text-slate-600/80 dark:text-slate-400/80'
                }`}
              >
                {hasActiveChallenges
                  ? `${acceptedChallenges.length} thách đấu sẵn sàng nhập tỷ số`
                  : 'Chưa có thách đấu nào đang chờ thi đấu'}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasActiveChallenges ? (
            <div className='space-y-4'>
              {acceptedChallenges.map(challenge => {
                const isChallenger = user?.id === challenge.challenger_id;
                const challenger = getPlayerInfo(challenge, true);
                const opponent = getPlayerInfo(challenge, false);
                const timeAgo = challenge.responded_at
                  ? formatDistanceToNow(parseISO(challenge.responded_at), {
                      addSuffix: true,
                      locale: vi,
                    })
                  : 'Vừa xong';

                return (
                  <Card
                    key={challenge.id}
                    className='bg-white/90 dark:bg-slate-800/90 border border-green-200/60 dark:border-green-700/40 hover:shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 transition-all duration-300 hover:border-green-300/80 dark:hover:border-green-600/60 backdrop-blur-sm'
                  >
                    <CardContent className='p-4'>
                      {/* Challenge Header */}
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant="outline"
                            className='bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm border-0'
                          >
                            <Target className='w-3 h-3 mr-1' />
                            Race to {challenge.race_to}
                          </Badge>
                          <Badge
                            variant='outline'
                            className='border-orange-300/60 bg-orange-50/80 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 dark:border-orange-600/40'
                          >
                            <DollarSign className='w-3 h-3 mr-1' />
                            {challenge.bet_points} SPA
                          </Badge>
                        </div>
                        <div className='text-xs text-slate-600/80 dark:text-slate-400/80 flex items-center gap-1'>
                          <Clock className='w-3 h-3' />
                          {timeAgo}
                        </div>
                      </div>

                      {/* Players */}
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                          <Avatar className='w-10 h-10 border-2 border-blue-200/60 dark:border-blue-600/40 shadow-sm'>
                            <AvatarImage src={challenger.avatar} />
                            <AvatarFallback className='bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'>
                              {challenger.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-semibold text-slate-800 dark:text-slate-200'>
                              {challenger.name}
                            </div>
                            <div className='text-xs text-slate-600/80 dark:text-slate-400/80'>
                              {challenger.spa} SPA
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col items-center'>
                          <ArrowRight className='w-5 h-5 text-slate-500/80 dark:text-slate-400/80' />
                          <span className='text-xs font-bold text-green-700 dark:text-green-300 bg-green-100/80 dark:bg-green-900/30 px-2 py-1 rounded shadow-sm'>
                            VS
                          </span>
                        </div>

                        <div className='flex items-center gap-3'>
                          <div className='text-right'>
                            <div className='font-semibold text-slate-800 dark:text-slate-200'>
                              {opponent.name}
                            </div>
                            <div className='text-xs text-slate-600/80 dark:text-slate-400/80'>
                              {opponent.spa} SPA
                            </div>
                          </div>
                          <Avatar className='w-10 h-10 border-2 border-red-200/60 dark:border-red-600/40 shadow-sm'>
                            <AvatarImage src={opponent.avatar} />
                            <AvatarFallback className='bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-300'>
                              {opponent.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-2'>
                        <Button
                          onClick={() => handleScoreEntry(challenge)}
                          className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200'
                        >
                          📊 Nhập Tỷ Số
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => onChallengeClick?.(challenge)}
                          className='px-4 border-green-300/60 dark:border-green-600/40 text-green-700 dark:text-green-300 hover:bg-green-50/80 dark:hover:bg-green-900/20 backdrop-blur-sm'
                        >
                          Chi tiết
                        </Button>
                      </div>

                      {/* Challenge Message */}
                      {challenge.message && (
                        <div className='mt-3 p-2 bg-slate-100/60 dark:bg-slate-700/40 rounded text-xs text-slate-700/80 dark:text-slate-300/80 border-l-2 border-green-300/80 dark:border-green-600/60 backdrop-blur-sm'>
                          💬 {challenge.message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3'>
                <Trophy className='w-6 h-6 text-muted-foreground' />
              </div>
              <p className='text-muted-foreground text-sm mb-2'>
                Chưa có thách đấu đang diễn ra
              </p>
              <div className='text-xs text-muted-foreground'>
                Khu vực này luôn hiển thị để theo dõi trận đấu
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Modal */}
      {selectedChallenge && (
        <MatchScoreModal
          open={scoreModalOpen}
          onOpenChange={setScoreModalOpen}
          challengeId={selectedChallenge.id}
          isChallenger={user?.id === selectedChallenge.challenger_id}
          raceTo={selectedChallenge.race_to}
          challengerName={
            selectedChallenge.challenger_profile?.full_name || 'Challenger'
          }
          opponentName={
            selectedChallenge.opponent_profile?.full_name || 'Opponent'
          }
        />
      )}
    </>
  );
};
