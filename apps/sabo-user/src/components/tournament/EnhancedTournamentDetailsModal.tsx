import { useState } from 'react';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
 Calendar,
 MapPin,
 Users,
 Trophy,
 Star,
 Clock,
 DollarSign,
 Target,
 Award,
 Gift,
 BarChart3,
 Activity,
 Zap,
 TrendingUp,
 FileText,
} from 'lucide-react';
import { Tournament } from '@/types/tournament';
import { TournamentParticipantsTab } from './TournamentParticipantsTab';
import { TournamentBracket } from './TournamentBracket';
import { TournamentResults } from './TournamentResults';
import { TournamentRealTimeSync } from './TournamentRealTimeSync';
import { useTournamentRegistrations } from '@/hooks/useTournamentRegistrations';
import { useTournamentMatches } from '@/hooks/useTournamentMatches';
import { useTournamentResults } from '@/hooks/useTournamentResults';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
 calculateTotalPrizePool,
 formatPrizeDistribution,
 formatCurrency,
} from "@sabo/shared-utils"
import { formatSafeDate as formatSafeDateUtil } from "@sabo/shared-utils"

export interface EnhancedTournamentDetailsModalProps {
 tournament: Tournament | null;
 open: boolean;
 onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: string) => {
 switch (status?.toLowerCase()) {
  case 'upcoming':
  case 'registration_open':
   return 'bg-primary-500';
  case 'registration_closed':
   return 'bg-warning-500';
  case 'ongoing':
   return 'bg-success-500';
  case 'completed':
   return 'bg-neutral-500';
  case 'cancelled':
   return 'bg-error-500';
  default:
   return 'bg-gray-400';
 }
};

const getStatusText = (status: string) => {
 switch (status?.toLowerCase()) {
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
  case 'cancelled':
   return 'Đã hủy';
  default:
   return status || 'Không xác định';
 }
};

const formatSafeDate = (dateString: string | undefined | undefined) => {
 if (!dateString) return 'Chưa xác định';

 const date = new Date(dateString);

 // Check if the date is valid and not the epoch date (1970-01-01)
 if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
  return 'Chưa xác định';
 }

 return date.toLocaleString('vi-VN');
};

export const EnhancedTournamentDetailsModal: React.FC<
 EnhancedTournamentDetailsModalProps
> = ({ tournament, open, onOpenChange }) => {
 const [activeTab, setActiveTab] = useState('overview');
 const { theme } = useTheme();
 const isMobile = useIsMobile();

 // Real-time data hooks
 const { registrations, loading: registrationsLoading } =
  useTournamentRegistrations(tournament?.id || '');
 const { matches, loading: matchesLoading } = useTournamentMatches(
  tournament?.id || null
 );
 const { results, loading: resultsLoading } = useTournamentResults(
  tournament?.id
 );

 if (!tournament) {
  return null;
 }

 const confirmedParticipants = registrations.filter(reg =>
  ['confirmed', 'paid'].includes(reg.registration_status.toLowerCase())
 ).length;

 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh] p-3' : 'max-w-6xl max-h-[90vh]'} overflow-y-auto ${
    theme === 'dark' 
     ? 'bg-neutral-900/95 border-gray-700 backdrop-blur-lg' 
     : 'bg-var(--color-background)/95 border-neutral-200 backdrop-blur-lg'
   }`}>
    <DialogHeader className={`space-y-4 ${isMobile ? 'space-y-2' : ''}`}>
     <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
      <div className='space-y-2'>
       <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold ${
        theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
       }`}>
        {tournament.name}
       </DialogTitle>
       <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'} ${isMobile ? 'text-xs' : 'text-sm'} ${
        theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
       }`}>
        <div className='flex items-center gap-1'>
         <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
         <span className={`${isMobile ? 'text-xs' : ''}`}>
          {formatSafeDateUtil(
           tournament.tournament_start,
           (tournament as any).start_date
          )}
         </span>
        </div>
        <div className='flex items-center gap-1'>
         <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
         <span className={`${isMobile ? 'text-caption truncate' : ''}`}>
          {tournament.venue_address}
         </span>
        </div>
        <div className='flex items-center gap-1'>
         <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
         <span className={`${isMobile ? 'text-xs' : ''}`}>
          {confirmedParticipants}/{tournament.max_participants}
         </span>
        </div>
       </div>
      </div>
      <Badge
       className={`${getStatusColor(tournament.status)} text-var(--color-background) ${isMobile ? 'self-start text-xs' : ''}`}
      >
       {getStatusText(tournament.status)}
      </Badge>
     </div>

     {/* Real-time sync indicator */}
     <TournamentRealTimeSync
      tournamentId={tournament.id}
      onTournamentUpdate={() => {}}
      onParticipantUpdate={() => {}}
      onResultsUpdate={() => {}}
     />
    </DialogHeader>

    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
     {/* Desktop: All tabs in one row */}
     {!isMobile && (
      <TabsList className={`grid w-full grid-cols-4 ${
       theme === 'dark' 
        ? 'bg-neutral-800/50 border-gray-600' 
        : 'bg-neutral-100/50 border-neutral-200'
      }`}>
       <TabsTrigger 
        value='overview'
        className={`${
         theme === 'dark' 
          ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-var(--color-background)' 
          : 'data-[state=active]:bg-var(--color-background) data-[state=active]:text-neutral-900'
        }`}
       >
        Tổng quan
       </TabsTrigger>
       <TabsTrigger 
        value='participants'
        className={`${
         theme === 'dark' 
          ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-var(--color-background)' 
          : 'data-[state=active]:bg-var(--color-background) data-[state=active]:text-neutral-900'
        }`}
       >
        Người tham gia
        {!registrationsLoading && (
         <span className="ml-1">
          ({confirmedParticipants})
         </span>
        )}
       </TabsTrigger>
       <TabsTrigger 
        value='bracket'
        className={`${
         theme === 'dark' 
          ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-var(--color-background)' 
          : 'data-[state=active]:bg-var(--color-background) data-[state=active]:text-neutral-900'
        }`}
       >
        Bảng đấu{' '}
        {!matchesLoading && matches.length > 0 && `(${matches.length})`}
       </TabsTrigger>
       <TabsTrigger 
        value='results'
        className={`${
         theme === 'dark' 
          ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-var(--color-background)' 
          : 'data-[state=active]:bg-var(--color-background) data-[state=active]:text-neutral-900'
        }`}
       >
        Kết quả{' '}
        {!resultsLoading && results.length > 0 && `(${results.length})`}
       </TabsTrigger>
      </TabsList>
     )}

     {/* Mobile: Simplified single row with key tabs */}
     {isMobile && (
      <TabsList className={`grid w-full grid-cols-2 h-auto ${
       theme === 'dark' 
        ? 'bg-neutral-800/50 border-gray-600' 
        : 'bg-neutral-100/50 border-neutral-200'
      }`}>
       <TabsTrigger 
        value='overview'
        className={`text-caption py-2 px-2 ${
         theme === 'dark' 
          ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-var(--color-background)' 
          : 'data-[state=active]:bg-var(--color-background) data-[state=active]:text-neutral-900'
        }`}
       >
        Tổng quan
       </TabsTrigger>
       <TabsTrigger 
        value='participants'
        className={`text-caption py-2 px-2 ${
         theme === 'dark' 
          ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-var(--color-background)' 
          : 'data-[state=active]:bg-var(--color-background) data-[state=active]:text-neutral-900'
        }`}
       >
        Thành viên
        {!registrationsLoading && (
         <span className="ml-1 text-[10px]">
          ({confirmedParticipants})
         </span>
        )}
       </TabsTrigger>
      </TabsList>
     )}

     <TabsContent value='overview' className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-6'}`}>
       {/* Tournament Information */}
       <div className={`space-y-4 p-3 ${isMobile ? 'p-3' : 'p-4'} border rounded-lg ${
        theme === 'dark' 
         ? 'border-gray-600 bg-neutral-800/30' 
         : 'border-neutral-200 bg-neutral-50/30'
       }`}>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 ${
         theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
        }`}>
         <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-amber-500`} />
         Thông tin giải đấu
        </h3>
        <div className={`space-y-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
         <div className='flex items-center gap-2'>
          <Target className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Loại giải:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'}`}>
           {tournament.tournament_type}
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <Activity className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-purple-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Hình thức:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'}`}>
           {tournament.game_format}
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <Star className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-indigo-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Cấp độ:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'}`}>
           Tier {tournament.tier_level}
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <DollarSign className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-success-600`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Lệ phí:</span>
          <span className={`font-medium text-success-600 ml-auto`}>
           {tournament.entry_fee.toLocaleString('vi-VN')} VNĐ
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <Gift className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-amber-600`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
           Tổng giải thưởng:
          </span>
          <span className={`font-medium text-warning-600 ml-auto`}>
           {formatCurrency(calculateTotalPrizePool(tournament))}
          </span>
         </div>
        </div>
       </div>

       {/* Schedule */}
       <div className={`space-y-4 p-3 ${isMobile ? 'p-3' : 'p-4'} border rounded-lg ${
        theme === 'dark' 
         ? 'border-gray-600 bg-neutral-800/30' 
         : 'border-neutral-200 bg-neutral-50/30'
       }`}>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 ${
         theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
        }`}>
         <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-success-500`} />
         Lịch trình
        </h3>
        <div className={`space-y-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
         <div className='flex items-center gap-2'>
          <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Mở đăng ký:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'} ${isMobile ? 'text-[10px]' : ''}`}>
           {formatSafeDate(tournament.registration_start)}
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-orange-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Đóng đăng ký:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'} ${isMobile ? 'text-[10px]' : ''}`}>
           {formatSafeDate(tournament.registration_end)}
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <Zap className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-success-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Bắt đầu:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'} ${isMobile ? 'text-[10px]' : ''}`}>
           {formatSafeDate(tournament.tournament_start)}
          </span>
         </div>
         <div className='flex items-center gap-2'>
          <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-amber-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Kết thúc:</span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'} ${isMobile ? 'text-[10px]' : ''}`}>
           {formatSafeDate(tournament.tournament_end)}
          </span>
         </div>
        </div>
       </div>

       {/* Stats */}
       <div className={`space-y-4 p-3 ${isMobile ? 'p-3' : 'p-4'} border rounded-lg ${
        theme === 'dark' 
         ? 'border-gray-600 bg-neutral-800/30' 
         : 'border-neutral-200 bg-neutral-50/30'
       }`}>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 ${
         theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
        }`}>
         <BarChart3 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-indigo-500`} />
         Thống kê
        </h3>
        <div className={`space-y-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
         <div className='flex items-center gap-2'>
          <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary-500`} />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
           Người tham gia:
          </span>
          <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'}`}>
           {confirmedParticipants} / {tournament.max_participants}
          </span>
         </div>
         {matches.length > 0 && (
          <>
           <div className='flex items-center gap-2'>
            <Award className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-500`} />
            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Trận đấu:</span>
            <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'}`}>
             {matches.filter(m => m.status === 'completed').length}{' '}
             / {matches.length}
            </span>
           </div>
           <div className='flex items-center gap-2'>
            <TrendingUp className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-success-500`} />
            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>Tiến độ:</span>
            <span className={`font-medium ml-auto ${theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'}`}>
             {matches.length > 0
              ? Math.round(
                (matches.filter(m => m.status === 'completed')
                 .length /
                 matches.length) *
                 100
               )
              : 0}
             %
            </span>
           </div>
          </>
         )}
        </div>
       </div>

       {/* Location */}
       <div className={`space-y-4 p-3 ${isMobile ? 'p-3' : 'p-4'} border rounded-lg ${
        theme === 'dark' 
         ? 'border-gray-600 bg-neutral-800/30' 
         : 'border-neutral-200 bg-neutral-50/30'
       }`}>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 ${
         theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
        }`}>
         <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-error-500`} />
         Địa điểm
        </h3>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'} ${isMobile ? 'text-xs' : ''}`}>
         {tournament.venue_address}
        </p>
        {tournament.contact_info && (
         <div className='pt-2 border-t border-neutral-200 dark:border-gray-600'>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1 ${
           theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
          }`}>Liên hệ:</p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} ${
           theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
          }`}>
           {tournament.contact_info}
          </p>
         </div>
        )}
       </div>
      </div>

      {/* Description & Rules */}
      {(tournament.description || tournament.rules) && (
       <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-2' : ''} gap-4 ${isMobile ? 'gap-3' : 'gap-6'}`}>
        {tournament.description && (
         <div className={`space-y-2 p-3 ${isMobile ? 'p-3' : 'p-4'} border rounded-lg ${
          theme === 'dark' 
           ? 'border-gray-600 bg-neutral-800/30' 
           : 'border-neutral-200 bg-neutral-50/30'
         }`}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 ${
           theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
          }`}>
           <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-slate-500`} />
           Mô tả
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'} var(--color-background)space-pre-wrap ${
           isMobile ? 'text-caption leading-relaxed' : ''
          }`}>
           {tournament.description}
          </p>
         </div>
        )}

        {tournament.rules && (
         <div className={`space-y-2 p-3 ${isMobile ? 'p-3' : 'p-4'} border rounded-lg ${
          theme === 'dark' 
           ? 'border-gray-600 bg-neutral-800/30' 
           : 'border-neutral-200 bg-neutral-50/30'
         }`}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2 ${
           theme === 'dark' ? 'text-var(--color-background)' : 'text-neutral-900'
          }`}>
           <Award className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-orange-500`} />
           Luật chơi
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'} var(--color-background)space-pre-wrap ${
           isMobile ? 'text-caption leading-relaxed' : ''
          }`}>
           {tournament.rules}
          </p>
         </div>
        )}
       </div>
      )}

      {/* Mobile: Quick action buttons for other tabs */}
      {isMobile && (
       <div className={`grid grid-cols-2 gap-3 p-4 border rounded-lg ${
        theme === 'dark' 
         ? 'border-gray-600 bg-neutral-800/30' 
         : 'border-neutral-200 bg-neutral-50/30'
       }`}>
        <Button
         onClick={() => setActiveTab('bracket')}
         className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
          theme === 'dark'
           ? 'bg-gray-700 hover:bg-gray-600 text-var(--color-background)'
           : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
         }`}
        >
         <Target className="h-4 w-4" />
         <span className="text-body-small-medium">Bảng đấu</span>
         {matches.length > 0 && (
          <span className="text-caption bg-primary-500 text-var(--color-background) rounded-full px-2 py-0.5">
           {matches.length}
          </span>
         )}
        </Button>
        <Button
         onClick={() => setActiveTab('results')}
         className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
          theme === 'dark'
           ? 'bg-gray-700 hover:bg-gray-600 text-var(--color-background)'
           : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
         }`}
        >
         <Trophy className="h-4 w-4" />
         <span className="text-body-small-medium">Kết quả</span>
         {results.length > 0 && (
          <span className="text-caption bg-success-500 text-var(--color-background) rounded-full px-2 py-0.5">
           {results.length}
          </span>
         )}
        </Button>
       </div>
      )}
     </TabsContent>

     <TabsContent value='participants'>
      <TournamentParticipantsTab
       tournamentId={tournament.id}
       maxParticipants={tournament.max_participants}
      />
     </TabsContent>

     <TabsContent value='bracket'>
      <TournamentBracket tournamentId={tournament.id} adminMode={false} />
     </TabsContent>

     <TabsContent value='results'>
      <TournamentResults tournamentId={tournament.id} />
     </TabsContent>
    </Tabs>
   </DialogContent>
  </Dialog>
 );
};
