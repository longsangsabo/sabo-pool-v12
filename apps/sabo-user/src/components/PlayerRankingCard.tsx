import React from 'react';
import { StandardCard, StandardButton, Heading, Text } from "@sabo/shared-ui";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { PlayerRanking, getRankingConfig } from '../types/qr';
import {
 Trophy,
 Target,
 Star,
 Award,
 CheckCircle,
 XCircle,
} from 'lucide-react';

interface PlayerRankingCardProps {
 player: PlayerRanking;
 showDetails?: boolean;
 onPromote?: (playerId: string) => void;
}

export const PlayerRankingCard: React.FC<PlayerRankingCardProps> = ({
 player,
 showDetails = false,
 onPromote,
}) => {
 const config = getRankingConfig(player.rank_code);

 const getRankColor = (rankCode: string) => {
  switch (rankCode) {
   case 'G':
    return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-var(--color-background)';
   case 'H+':
    return 'bg-gradient-to-r from-orange-400 to-orange-600 text-var(--color-background)';
   case 'H':
    return 'bg-gradient-to-r from-red-400 to-red-600 text-var(--color-background)';
   case 'I+':
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-var(--color-background)';
   case 'I':
    return 'bg-gradient-to-r from-green-400 to-green-600 text-var(--color-background)';
   case 'K+':
    return 'bg-gradient-to-r from-purple-400 to-purple-600 text-var(--color-background)';
   case 'K':
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-var(--color-background)';
   default:
    return 'bg-neutral-200 text-neutral-800';
  }
 };

 const getRankIcon = (rankCode: string) => {
  switch (rankCode) {
   case 'G':
    return <Trophy className='w-4 h-4' />;
   case 'H+':
    return <Award className='w-4 h-4' />;
   case 'H':
    return <Star className='w-4 h-4' />;
   case 'I+':
    return <Target className='w-4 h-4' />;
   case 'I':
    return <Target className='w-4 h-4' />;
   case 'K+':
    return <Target className='w-4 h-4' />;
   case 'K':
    return <Target className='w-4 h-4' />;
   default:
    return <Target className='w-4 h-4' />;
  }
 };

 return (
  <Card className='hover:shadow-lg transition-shadow'>
   <CardHeader className='pb-3'>
    <div className='flex items-center justify-between'>
     <div className='flex items-center gap-3'>
      <div
       className={`p-2 rounded-full ${getRankColor(player.rank_code)}`}
      >
       {getRankIcon(player.rank_code)}
      </div>
      <div>
       <CardTitle className='text-lg'>{player.nickname}</CardTitle>
       <CardDescription>
        {config?.description || `Hạng ${player.rank_code}`}
       </CardDescription>
      </div>
     </div>
     <div className='flex items-center gap-2'>
      <Badge variant={player.promotion_ready ? 'default' : 'secondary'}>
       {player.promotion_ready ? 'Sẵn sàng lên hạng' : 'Đang phát triển'}
      </Badge>
      {player.is_stable && (
       <Badge variant='outline' className='text-success-600'>
        <CheckCircle className='w-3 h-3 mr-1' />
        Ổn định
       </Badge>
      )}
     </div>
    </div>
   </CardHeader>

   <CardContent>
    <div className='space-y-3'>
     {/* Basic Stats */}
     <div className='grid grid-cols-2 gap-4'>
      <div className='text-center p-3 bg-neutral-50 rounded-lg'>
       <div className='text-heading-bold text-primary-600'>
        {player.balls_consistent}
       </div>
       <div className='text-body-small-neutral'>Bi ổn định</div>
      </div>
      <div className='text-center p-3 bg-neutral-50 rounded-lg'>
       <div className='text-heading-bold text-success-600'>
        {player.rank_code}
       </div>
       <div className='text-body-small-neutral'>Hạng hiện tại</div>
      </div>
     </div>

     {/* Skills */}
     <div className='space-y-2'>
      <h4 className='font-medium text-body-small text-neutral-700'>Kỹ năng:</h4>
      <div className='flex flex-wrap gap-2'>
       <Badge variant={player.can_do_cham_don ? 'default' : 'secondary'}>
        {player.can_do_cham_don ? (
         <CheckCircle className='w-3 h-3 mr-1' />
        ) : (
         <XCircle className='w-3 h-3 mr-1' />
        )}
        Chấm đơn
       </Badge>
       <Badge variant={player.can_do_cham_pha ? 'default' : 'secondary'}>
        {player.can_do_cham_pha ? (
         <CheckCircle className='w-3 h-3 mr-1' />
        ) : (
         <XCircle className='w-3 h-3 mr-1' />
        )}
        Chấm phá
       </Badge>
      </div>
     </div>

     {/* Tournament Achievement */}
     {player.tournament_achievement && (
      <div className='p-3 bg-warning-50 border border-warning rounded-lg'>
       <div className='flex items-center gap-2'>
        <Trophy className='w-4 h-4 text-warning-600' />
        <span className='text-body-small-medium text-warning-800'>
         Thành tích: {player.tournament_achievement}
        </span>
       </div>
      </div>
     )}

     {/* Club Notes */}
     {player.club_notes && (
      <div className='p-3 bg-primary-50 border border-primary-200 rounded-lg'>
       <div className='text-body-small text-primary-800'>
        <strong>Ghi chú CLB:</strong> {player.club_notes}
       </div>
      </div>
     )}

     {/* Requirements for next rank */}
     {showDetails && config && (
      <div className='mt-4 p-3 bg-neutral-50 rounded-lg'>
       <h4 className='font-medium text-body-small text-neutral-700 mb-2'>
        Yêu cầu lên hạng {getNextRank(player.rank_code)}:
       </h4>
       <ul className='text-body-small-neutral space-y-1'>
        {config.requirements.map((req, index) => (
         <li key={index} className='flex items-start gap-2'>
          <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0' />
          {req}
         </li>
        ))}
       </ul>
      </div>
     )}

     {/* Action Buttons */}
     {onPromote && player.promotion_ready && (
      <div className='flex gap-2 mt-4'>
       <Button
        onClick={() => onPromote(player.id)}
        variant="default"
       >
        Xem xét lên hạng
       </Button>
      </div>
     )}
    </div>
   </CardContent>
  </Card>
 );
};

const getNextRank = (currentRank: string): string => {
 const rankOrder = ['K', 'K+', 'I', 'I+', 'H', 'H+', 'G'];
 const currentIndex = rankOrder.indexOf(currentRank);
 return currentIndex < rankOrder.length - 1
  ? rankOrder[currentIndex + 1]
  : 'G';
};

export const PlayerRankingList: React.FC<{
 players: PlayerRanking[];
 showDetails?: boolean;
 onPromote?: (playerId: string) => void;
}> = ({ players, showDetails, onPromote }) => {
 const groupedPlayers = players.reduce(
  (acc, player) => {
   if (!acc[player.rank_code]) {
    acc[player.rank_code] = [];
   }
   acc[player.rank_code].push(player);
   return acc;
  },
  {} as Record<string, PlayerRanking[]>
 );

 const rankOrder = ['G', 'H+', 'H', 'I+', 'I', 'K+', 'K'];

 return (
  <div className='space-y-6'>
   {rankOrder.map(rankCode => {
    const rankPlayers = groupedPlayers[rankCode];
    if (!rankPlayers) return null;

    return (
     <div key={rankCode}>
      <h3 className='text-body-large-semibold mb-3 flex items-center gap-2'>
       {getRankingConfig(rankCode)?.description || `Hạng ${rankCode}`}
       <Badge variant='outline'>{rankPlayers.length} người chơi</Badge>
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
       {rankPlayers.map(player => (
        <PlayerRankingCard
         key={player.id}
         player={player}
         showDetails={showDetails}
         onPromote={onPromote}
        />
       ))}
      </div>
     </div>
    );
   })}
  </div>
 );
};
