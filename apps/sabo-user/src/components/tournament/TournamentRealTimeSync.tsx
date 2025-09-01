import { useEffect, useState } from 'react';
import { getCurrentUser } from "../services/userService";
import { getUserProfile } from "../services/profileService";
import { getTournament } from "../services/tournamentService";
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface TournamentRealTimeSyncProps {
 tournamentId?: string;
 onTournamentUpdate?: (tournament: any) => void;
 onParticipantUpdate?: (participant: any) => void;
 onResultsUpdate?: () => void;
}

export const TournamentRealTimeSync: React.FC<TournamentRealTimeSyncProps> = ({
 tournamentId,
 onTournamentUpdate,
 onParticipantUpdate,
 onResultsUpdate,
}) => {
 const [isConnected, setIsConnected] = useState(false);
 const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

 useEffect(() => {
  if (!tournamentId) return;

  console.log(
   '🔄 Setting up comprehensive real-time sync for tournament:',
   tournamentId
  );

  // Tournament changes subscription
//   const tournamentChannel = supabase
   .channel(`tournament_sync_${tournamentId}`)
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'tournaments',
     filter: `id=eq.${tournamentId}`,
    },
    payload => {
     console.log('🏆 Tournament update:', payload);
     setLastUpdate(new Date());
     onTournamentUpdate?.(payload.new);

     if (payload.eventType === 'UPDATE') {
      const oldRecord = payload.old as any;
      const newRecord = payload.new as any;

      // Tournament status changes
      if (oldRecord?.status !== newRecord?.status) {
       switch (newRecord.status) {
        case 'completed':
         toast.success(
          '🎉 Giải đấu đã hoàn thành! Kết quả đã được tính toán.'
         );
         onResultsUpdate?.();
         break;
        case 'ongoing':
         toast.info('🚀 Giải đấu đã bắt đầu!');
         break;
        case 'cancelled':
         toast.warning('❌ Giải đấu đã bị hủy');
         break;
       }
      }
     }
    }
   )
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'tournament_registrations',
     filter: `tournament_id=eq.${tournamentId}`,
    },
    payload => {
     console.log('👥 Registration update:', payload);
     setLastUpdate(new Date());
     onParticipantUpdate?.(payload.new);

     if (payload.eventType === 'INSERT') {
      toast.success('Có người tham gia mới');
     }
    }
   )
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'tournament_results',
     filter: `tournament_id=eq.${tournamentId}`,
    },
    payload => {
     console.log('🏆 Tournament results update:', payload);
     setLastUpdate(new Date());
     onResultsUpdate?.();

     if (payload.eventType === 'INSERT') {
      toast.success('🏆 Kết quả giải đấu đã được cập nhật!');
     } else if (payload.eventType === 'UPDATE') {
      toast.info('📊 Kết quả giải đấu đã được điều chỉnh');
     }
    }
   )
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'tournament_matches',
     filter: `tournament_id=eq.${tournamentId}`,
    },
    payload => {
     console.log('⚔️ Tournament match updated:', payload);
     setLastUpdate(new Date());

     const newRecord = payload.new as any;
     const oldRecord = payload.old as any;

     // Match completion
     if (
      oldRecord?.status !== 'completed' &&
      newRecord?.status === 'completed'
     ) {
      if (
       newRecord.bracket_type === 'finals' ||
       newRecord.round_number === 300
      ) {
       // SABO_REBUILD: Updated bracket type and round
       toast.success('🏁 Trận chung kết đã kết thúc!');
      } else {
       toast.info('✅ Một trận đấu đã hoàn thành');
      }
     }
    }
   )
   .on(
    'postgres_changes',
    {
     event: 'INSERT',
     schema: 'public',
     table: 'spa_points_log',
     filter: 'source_type=eq.tournament',
    },
    payload => {
     const newRecord = payload.new as any;
     if (!tournamentId || newRecord.source_id === tournamentId) {
      console.log('💎 SPA points awarded:', payload);
      setLastUpdate(new Date());
      toast.success(`💎 +${newRecord.points_earned} SPA Points!`);
     }
    }
   )
   .subscribe(status => {
    console.log(`🔗 Tournament sync status: ${status}`);
    setIsConnected(status === 'SUBSCRIBED');

    if (status === 'SUBSCRIBED') {
     console.log('✅ Real-time sync connected successfully');
    } else if (status === 'CHANNEL_ERROR') {
     console.error('❌ Real-time sync connection error');
     toast.error('❌ Lỗi kết nối realtime');
    }
   });

  return () => {
   console.log('🔌 Cleaning up tournament sync');
   // removeChannel(tournamentChannel);
  };
 }, [tournamentId, onTournamentUpdate, onParticipantUpdate, onResultsUpdate]);

 if (!tournamentId) return null;

 return (
  <div className='flex items-center gap-2 text-xs'>
   <Badge
    variant={isConnected ? 'secondary' : 'destructive'}
    className='gap-1'
   >
    {isConnected ? (
     <Wifi className='h-3 w-3' />
    ) : (
     <WifiOff className='h-3 w-3' />
    )}
    {isConnected ? 'Đang đồng bộ' : 'Mất kết nối'}
   </Badge>
   {lastUpdate && (
    <span className='text-muted-foreground'>
     Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
    </span>
   )}
  </div>
 );
};

export default TournamentRealTimeSync;
