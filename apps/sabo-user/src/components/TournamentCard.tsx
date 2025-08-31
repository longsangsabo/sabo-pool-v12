import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
 Calendar,
 MapPin,
 Users,
 Trophy,
 DollarSign,
 Info,
 Eye,
} from 'lucide-react';
import { EnhancedTournament } from '@/types/tournament-extended';
import { EnhancedTournamentDetailsModal } from './tournament/EnhancedTournamentDetailsModal';
import { calculateTotalPrizePool } from "@sabo/shared-utils"
import { formatCurrency } from '@sabo/shared-utils';
import { formatSafeDate } from "@sabo/shared-utils"

interface TournamentCardProps {
 tournament: EnhancedTournament;
 onView: (tournament: EnhancedTournament) => void;
 showViewButton?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
 tournament,
 onView,
 showViewButton = true,
}) => {
 const [showDetailsModal, setShowDetailsModal] = useState(false);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'upcoming':
    return 'bg-primary-100 text-primary-800';
   case 'registration_open':
    return 'bg-success-100 text-success-800';
   case 'registration_closed':
    return 'bg-warning-100 text-warning-800';
   case 'ongoing':
    return 'bg-warning-100 text-orange-800';
   case 'completed':
    return 'bg-neutral-100 text-neutral-800';
   default:
    return 'bg-neutral-100 text-neutral-800';
  }
 };

 const getStatusText = (status: string) => {
  switch (status) {
   case 'upcoming':
    return 'Sắp diễn ra';
   case 'registration_open':
    return 'Đang mở đăng ký';
   case 'registration_closed':
    return 'Đã đóng đăng ký';
   case 'ongoing':
    return 'Đang diễn ra';
   case 'completed':
    return 'Đã kết thúc';
   default:
    return status;
  }
 };

 const getTournamentTypeText = (tournamentType: string) => {
  switch (tournamentType) {
   case 'single_elimination':
    return 'Loại trực tiếp';
   case 'double_elimination':
    return 'Loại kép';
   case 'round_robin':
    return 'Vòng tròn';
   case 'swiss':
    return 'Swiss';
   default:
    return tournamentType;
  }
 };

 const getTournamentTypeIcon = (tournamentType: string) => {
  switch (tournamentType) {
   case 'single_elimination':
    return '🏆';
   case 'double_elimination':
    return '⚡';
   case 'round_robin':
    return '🔄';
   case 'swiss':
    return '🎯';
   default:
    return '🏆';
  }
 };

 const totalPrizePool = tournament.prize_pool || 0;

 return (
  <>
   <Card className='hover:shadow-lg transition-shadow duration-200'>
    <CardHeader className='pb-3'>
     <div className='flex justify-between items-start'>
      <CardTitle className='text-body-large font-bold line-clamp-2'>
       {tournament.name}
      </CardTitle>
      <Badge className={getStatusColor(tournament.status || 'upcoming')}>
       {getStatusText(tournament.status || 'upcoming')}
      </Badge>
     </div>
    </CardHeader>

    <CardContent className='space-y-4'>
     {/* Tournament Details */}
     <div className='grid grid-cols-2 gap-3 text-sm'>
      <div className='flex items-center gap-2'>
       <Calendar className='w-4 h-4 text-muted-foreground' />
       <span className='text-muted-foreground'>
        {formatSafeDate(
         tournament.tournament_start,
         (tournament as any).start_date
        )}
       </span>
      </div>

      <div className='flex items-center gap-2'>
       <Users className='w-4 h-4 text-muted-foreground' />
       <span className='text-muted-foreground'>
        {tournament.max_participants || 'Không giới hạn'} người
       </span>
      </div>

      <div className='flex items-center gap-2'>
       <DollarSign className='w-4 h-4 text-muted-foreground' />
       <span className='text-muted-foreground'>
        {formatCurrency(tournament.entry_fee || 0)}
       </span>
      </div>

      <div className='flex items-center gap-2'>
       <MapPin className='w-4 h-4 text-muted-foreground' />
       <span className='text-muted-foreground truncate'>
        {tournament.venue_address || 'Chưa xác định'}
       </span>
      </div>
     </div>

     {/* Tournament Type Display - FIXED */}
     <div className='flex items-center gap-2 p-2 bg-muted/30 rounded-lg'>
      <span className='text-lg'>
       {getTournamentTypeIcon(tournament.tournament_type)}
      </span>
      <span className='text-body-small-medium text-foreground'>
       {getTournamentTypeText(tournament.tournament_type)}
      </span>
     </div>

     {/* Prize Pool */}
     {totalPrizePool > 0 && (
      <div className='bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg'>
       <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
         <Trophy className='w-4 h-4 text-tournament-gold' />
         <span className='text-body-small-medium'>Tổng giải thưởng</span>
        </div>
        <span className='font-bold text-tournament-gold'>
         {formatCurrency(totalPrizePool)}
        </span>
       </div>
      </div>
     )}

     {/* Description */}
     {tournament.description && (
      <p className='text-body-small text-muted-foreground line-clamp-2'>
       {tournament.description}
      </p>
     )}

     {/* Action Buttons */}
     <div className='flex gap-2 pt-2'>
      <Button
       variant='outline'
       
       onClick={() => setShowDetailsModal(true)}
       className='flex items-center gap-2'
      >
       <Info className='w-4 h-4' />
       Chi tiết
      </Button>

      {showViewButton && (
       <Button
        
        onClick={() => onView(tournament)}
        className='flex items-center gap-2 flex-1'
       >
        <Eye className='w-4 h-4' />
        Xem giải đấu
       </Button>
      )}
     </div>
    </CardContent>
   </Card>

   {/* Details Modal */}
   <EnhancedTournamentDetailsModal
    tournament={
     {
      ...tournament,
      first_prize: tournament.prize_pool
       ? tournament.prize_pool * 0.5
       : 0,
      second_prize: tournament.prize_pool
       ? tournament.prize_pool * 0.3
       : 0,
      third_prize: tournament.prize_pool
       ? tournament.prize_pool * 0.2
       : 0,
     } as any
    }
    open={showDetailsModal}
    onOpenChange={(open) => setShowDetailsModal(open)}
   />
  </>
 );
};

export default TournamentCard;
