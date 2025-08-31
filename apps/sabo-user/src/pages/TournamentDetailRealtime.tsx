import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TournamentStatsRealtime } from '@/components/tournament/TournamentStatsRealtime';
import { ParticipantListRealtime } from '@/components/tournament/ParticipantListRealtime';
import AutomationMonitor from '@/components/tournament/AutomationMonitor';
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getTournament } from "../services/tournamentService";
import { getWalletBalance } from "../services/walletService";
import { getCurrentUser } from '../services/userService';
import { formatDate } from '@sabo/shared-utils';
import { toast } from 'sonner';
import {
 Users,
 Trophy,
 Calendar,
 MapPin,
 DollarSign,
 Clock,
 Shield,
 Zap,
} from 'lucide-react';

interface Tournament {
 id: string;
 name: string;
 description?: string;
 status: string;
 max_participants: number;
 current_participants: number;
 entry_fee: number;
 tournament_start: string;
 tournament_end: string;
 registration_start: string;
 registration_end: string;
 venue_address?: string;
 tournament_type: string;
 created_at: string;
}

export const TournamentDetailRealtime: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const [tournament, setTournament] = useState<Tournament | null>(null);
 const [loading, setLoading] = useState(true);
 const [registering, setRegistering] = useState(false);
 const [currentUser, setCurrentUser] = useState<any>(null);

 useEffect(() => {
  if (id) {
   loadTournament();
   loadCurrentUser();
  }
 }, [id]);

 const loadCurrentUser = async () => {
  const {
   data: { user },
  } = await getCurrentUser();
  setCurrentUser(user);
 };

 const loadTournament = async () => {
  try {
   // TODO: Replace with service call - const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

   if (error) {
    console.error('Error loading tournament:', error);
    toast.error('Lỗi khi tải thông tin giải đấu');
    return;
   }

   setTournament(data);
  } catch (error) {
   console.error('Error in loadTournament:', error);
   toast.error('Lỗi khi tải thông tin giải đấu');
  } finally {
   setLoading(false);
  }
 };

 const handleRegister = async () => {
  if (!currentUser || !tournament) {
   toast.error('Vui lòng đăng nhập để tham gia');
   return;
  }

  setRegistering(true);
  try {
// // //    // TODO: Replace with service call - const { error } = // TODO: Replace with service call - await // TODO: Replace with service call - supabase.from('tournament_registrations').create({
    tournament_id: tournament.id,
    user_id: currentUser.id,
    registration_status: 'confirmed',
    registration_date: new Date().toISOString(),
   });

   if (error) {
    console.error('Registration error:', error);
    toast.error('Lỗi khi đăng ký: ' + error.message);
    return;
   }

   toast.success('🎉 Đăng ký thành công!');
  } catch (error) {
   console.error('Error in handleRegister:', error);
   toast.error('Lỗi khi đăng ký giải đấu');
  } finally {
   setRegistering(false);
  }
 };

 const getStatusBadge = (status: string) => {
  const configs = {
   registration_open: {
    text: 'Đang mở ĐK',
    className: 'bg-success-100 text-success-800',
   },
   upcoming: {
    text: 'Sắp diễn ra',
    className: 'bg-warning-100 text-orange-800',
   },
   ongoing: {
    text: 'Đang diễn ra',
    className: 'bg-info-100 text-purple-800',
   },
   completed: {
    text: 'Đã kết thúc',
    className: 'bg-neutral-100 text-neutral-600',
   },
  };

  const config = configs[status as keyof typeof configs] || configs.upcoming;
  return <Badge className={config.className}>{config.text}</Badge>;
 };

 if (loading) {
  return (
   <div className='container mx-auto p-6'>
    <div className='animate-pulse space-y-6'>
     <div className='h-8 bg-neutral-200 rounded w-1/3'></div>
     <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='lg:col-span-2 space-y-6'>
       <div className='h-64 bg-neutral-200 rounded'></div>
       <div className='h-96 bg-neutral-200 rounded'></div>
      </div>
      <div className='space-y-6'>
       <div className='h-48 bg-neutral-200 rounded'></div>
       <div className='h-64 bg-neutral-200 rounded'></div>
      </div>
     </div>
    </div>
   </div>
  );
 }

 if (!tournament) {
  return (
   <div className='container mx-auto p-6'>
    <Card>
     <CardContent className='p-8 text-center'>
      <Trophy className='mx-auto h-16 w-16 text-gray-400 mb-4' />
      <h2 className='text-title-semibold text-neutral-900 mb-2'>
       Không tìm thấy giải đấu
      </h2>
      <p className='text-neutral-500'>
       Giải đấu có thể đã bị xóa hoặc không tồn tại.
      </p>
     </CardContent>
    </Card>
   </div>
  );
 }

 const canRegister =
  ['registration_open', 'upcoming'].includes(tournament.status) &&
  tournament.current_participants < tournament.max_participants;

 return (
  <div className='container mx-auto p-6 space-y-6'>
   {/* Header */}
   <div className='flex items-start justify-between'>
    <div>
     <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
      {tournament.name}
     </h1>
     <div className='flex items-center gap-4'>
      {getStatusBadge(tournament.status)}
      <span className='text-body-small text-neutral-500'>
       Tạo ngày {formatDate(tournament.created_at)}
      </span>
     </div>
    </div>
    {canRegister && currentUser && (
     <Button
      onClick={handleRegister}
      disabled={registering}
      variant="default"
     >
      {registering ? (
       <>
        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
        Đang đăng ký...
       </>
      ) : (
       <>
        <Users className='mr-2 h-4 w-4' />
        Đăng ký ngay
       </>
      )}
     </Button>
    )}
   </div>

   <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
    {/* Main Content */}
    <div className='lg:col-span-2 space-y-6'>
     {/* Tournament Info */}
     <Card>
      <CardHeader>
       <CardTitle className='flex items-center gap-2'>
        <Trophy className='h-5 w-5' />
        Thông tin giải đấu
       </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
       {tournament.description && (
        <div>
         <h4 className='font-medium mb-2'>Mô tả</h4>
         <p className='text-neutral-600'>{tournament.description}</p>
        </div>
       )}

       <div className='grid grid-cols-2 gap-4'>
        <div className='flex items-center gap-3'>
         <Calendar className='h-5 w-5 text-blue-500' />
         <div>
          <div className='font-medium'>Thời gian thi đấu</div>
          <div className='text-body-small text-neutral-500'>
           {formatDate(tournament.tournament_start)}
          </div>
         </div>
        </div>

        {tournament.venue_address && (
         <div className='flex items-center gap-3'>
          <MapPin className='h-5 w-5 text-red-500' />
          <div>
           <div className='font-medium'>Địa điểm</div>
           <div className='text-body-small text-neutral-500'>
            {tournament.venue_address}
           </div>
          </div>
         </div>
        )}

        <div className='flex items-center gap-3'>
         <DollarSign className='h-5 w-5 text-green-500' />
         <div>
          <div className='font-medium'>Phí tham gia</div>
          <div className='text-body-small text-neutral-500'>
           {tournament.entry_fee.toLocaleString('vi-VN')} VNĐ
          </div>
         </div>
        </div>

        <div className='flex items-center gap-3'>
         <Clock className='h-5 w-5 text-orange-500' />
         <div>
          <div className='font-medium'>Hạn đăng ký</div>
          <div className='text-body-small text-neutral-500'>
           {formatDate(tournament.registration_end)}
          </div>
         </div>
        </div>
       </div>
      </CardContent>
     </Card>

     {/* Real-time Stats */}
     <TournamentStatsRealtime tournament={tournament} />

     {/* Participant List */}
     <ParticipantListRealtime
      tournamentId={tournament.id}
      maxParticipants={tournament.max_participants}
     />
    </div>

    {/* Sidebar */}
    <div className='space-y-6'>
     {/* Quick Stats */}
     <Card>
      <CardHeader>
       <CardTitle className='flex items-center gap-2'>
        <Shield className='h-5 w-5' />
        Thống kê nhanh
       </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
       <div className='flex justify-between'>
        <span className='text-neutral-600'>Loại giải:</span>
        <span className='font-medium'>
         {tournament.tournament_type}
        </span>
       </div>
       <div className='flex justify-between'>
        <span className='text-neutral-600'>Tổng chỗ:</span>
        <span className='font-medium'>
         {tournament.max_participants}
        </span>
       </div>
       <div className='flex justify-between'>
        <span className='text-neutral-600'>Đã đăng ký:</span>
        <span className='font-medium text-primary-600'>
         {tournament.current_participants}
        </span>
       </div>
       <div className='flex justify-between'>
        <span className='text-neutral-600'>Còn lại:</span>
        <span className='font-medium text-success-600'>
         {tournament.max_participants -
          tournament.current_participants}
        </span>
       </div>
      </CardContent>
     </Card>

     {/* Automation Monitor */}
     <AutomationMonitor />

     {/* Live Updates Status */}
     <Card>
      <CardHeader>
       <CardTitle className='flex items-center gap-2'>
        <Zap className='h-5 w-5' />
        Real-time Status
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className='space-y-3'>
        <div className='flex items-center justify-between'>
         <span className='text-body-small-neutral'>Live Updates</span>
         <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-success-500 rounded-full animate-pulse'></div>
          <span className='text-body-small-medium text-success-600'>
           Active
          </span>
         </div>
        </div>
        <div className='flex items-center justify-between'>
         <span className='text-body-small-neutral'>Auto Sync</span>
         <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-success-500 rounded-full animate-pulse'></div>
          <span className='text-body-small-medium text-success-600'>
           Running
          </span>
         </div>
        </div>
        <div className='flex items-center justify-between'>
         <span className='text-body-small-neutral'>Database</span>
         <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-success-500 rounded-full animate-pulse'></div>
          <span className='text-body-small-medium text-success-600'>
           Connected
          </span>
         </div>
        </div>
       </div>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 );
};
