import React from 'react';
import { useTournamentResults } from '@/hooks/useTournamentResults';
import { TournamentResultWithPlayer } from '@/types/tournamentResults';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, Gift, Loader2, AlertCircle } from 'lucide-react';

interface TournamentResultsProps {
  tournamentId: string;
  showTitle?: boolean;
  maxResults?: number;
}

export const TournamentResults: React.FC<TournamentResultsProps> = ({
  tournamentId,
  showTitle = true,
  maxResults,
}) => {
  const { results, loading, error } = useTournamentResults(tournamentId);

  // Simple data formatting - no complex merging needed anymore
  const enhancedResults = results.map(result => ({
    ...result,
    verified_rank: result.verified_rank || 'Unranked',
    position_name:
      result.placement_type ||
      (result.final_position === 1
        ? 'Vô địch'
        : result.final_position === 2
          ? 'Á quân'
          : result.final_position === 3
            ? 'Hạng 3'
            : `Hạng ${result.final_position}`),
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin mr-2' />
            <span>Đang tải kết quả...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center gap-2 text-destructive'>
            <AlertCircle className='h-5 w-5' />
            <p>Lỗi tải kết quả: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-muted-foreground'>
            <Trophy className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>Chưa có kết quả giải đấu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayResults = maxResults
    ? enhancedResults.slice(0, maxResults)
    : enhancedResults;

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 2:
        return <Medal className='h-5 w-5 text-gray-400' />;
      case 3:
        return <Award className='h-5 w-5 text-amber-600' />;
      case 4:
        return <Award className='h-5 w-5 text-blue-500' />;
      default:
        return <Gift className='h-5 w-5 text-purple-500' />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-warning-100 text-warning-800 border-yellow-200';
      case 2:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-primary-50 text-primary-700 border-primary-200';
    }
  };

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Kết quả giải đấu
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className='p-0'>
        <div className='space-y-0'>
          {displayResults.map((result, index) => (
            <div
              key={result.user_id}
              className={`flex items-center justify-between p-4 border-b last:border-b-0 ${
                result.final_position === 1
                  ? 'bg-gradient-to-r from-yellow-50 to-transparent'
                  : result.final_position === 2
                    ? 'bg-gradient-to-r from-gray-50 to-transparent'
                    : result.final_position === 3
                      ? 'bg-gradient-to-r from-amber-50 to-transparent'
                      : index % 2 === 0
                        ? 'bg-muted/30'
                        : 'bg-background'
              }`}
            >
              {/* Left side: Position, Avatar, Name, Rank */}
              <div className='flex items-center gap-4 flex-1 min-w-0'>
                <div className='flex items-center gap-2 min-w-[60px]'>
                  {getPositionIcon(result.final_position)}
                  <span className='font-bold text-lg'>
                    #{result.final_position}
                  </span>
                </div>

                <Avatar className='h-10 w-10 shrink-0'>
                  <AvatarImage
                    src={result.avatar_url}
                    alt={result.display_name}
                  />
                  <AvatarFallback>
                    {result.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className='min-w-0 flex-1'>
                  <p className='font-semibold truncate'>
                    {result.display_name}
                  </p>
                  <p className='text-body-small-muted truncate'>
                    {result.full_name}
                  </p>
                </div>

                <Badge variant='outline' className='shrink-0 text-xs'>
                  {result.verified_rank}
                </Badge>
              </div>

              {/* Right side: Stats */}
              <div className='flex items-center gap-6 text-sm'>
                <div className='text-center min-w-[50px]'>
                  <p className='font-bold text-success-600 text-lg'>
                    {result.wins}W
                  </p>
                  <p className='text-caption-muted'>Thắng</p>
                </div>

                <div className='text-center min-w-[50px]'>
                  <p className='font-bold text-error-600 text-lg'>
                    {result.losses}L
                  </p>
                  <p className='text-caption-muted'>Thua</p>
                </div>

                <div className='text-center min-w-[60px]'>
                  <p className='font-bold text-primary-600 text-lg'>
                    {result.win_percentage?.toFixed(1) || '0.0'}%
                  </p>
                  <p className='text-caption-muted'>Tỷ lệ thắng</p>
                </div>

                <div className='text-center min-w-[60px]'>
                  <p className='font-bold text-info-600 text-lg'>
                    {result.spa_points_earned}
                  </p>
                  <p className='text-caption-muted'>SPA Points</p>
                </div>

                <div className='text-center min-w-[50px]'>
                  <p className='font-bold text-warning-600 text-lg'>
                    {result.elo_points_awarded}
                  </p>
                  <p className='text-caption-muted'>ELO</p>
                </div>

                <div className='text-center min-w-[80px]'>
                  <p className='font-bold text-success-700 text-lg'>
                    {result.prize_amount > 0
                      ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact',
                          minimumFractionDigits: 0,
                        }).format(result.prize_amount)
                      : '0₫'}
                  </p>
                  <p className='text-caption-muted'>Tiền thưởng</p>
                </div>

                {result.physical_rewards &&
                  result.physical_rewards.length > 0 && (
                    <div className='text-center min-w-[60px]'>
                      <Gift className='h-5 w-5 mx-auto text-amber-600 mb-1' />
                      <p className='text-caption-muted'>
                        {result.physical_rewards.length} phần thưởng
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {maxResults && enhancedResults.length > maxResults && (
          <div className='text-center text-body-small-muted p-4 border-t'>
            Hiển thị {maxResults} trong {enhancedResults.length} kết quả
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentResults;
