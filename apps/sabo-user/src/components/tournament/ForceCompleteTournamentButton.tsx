import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ForceCompleteTournamentButtonProps {
 tournamentId: string;
 tournamentName: string;
 currentStatus: string;
 onStatusChanged?: () => void;
}

interface TournamentResultsResponse {
 success?: boolean;
 error?: string;
 tournament_id?: string;
 results_created?: number;
 champion_id?: string;
 runner_up_id?: string;
 multiplier?: number;
 message?: string;
}

const ForceCompleteTournamentButton: React.FC<
 ForceCompleteTournamentButtonProps
> = ({ tournamentId, tournamentName, currentStatus, onStatusChanged }) => {
 const [isCompleting, setIsCompleting] = useState(false);

 const calculateTournamentResults = async () => {
  console.log(
   '🏆 Starting tournament results calculation for:',
   tournamentId
  );

  try {
   // Use the new database function for accurate calculation
   const { data, error } = await supabase.rpc(
    'complete_tournament_automatically',
    {
     p_tournament_id: tournamentId,
    }
   );

   if (error) {
    console.error('❌ Error calculating tournament results:', error);
    throw error;
   }

   console.log('✅ Tournament results calculated:', data);

   // Type cast the response data
   const result = data as TournamentResultsResponse;

   if (result?.error) {
    throw new Error(result.error);
   }

   if (result?.success) {
    toast.success(
     `🎉 Đã tính toán kết quả cho ${result.results_created} người chơi`
    );
    console.log(
     `🏆 Champion: ${result.champion_id}, Runner-up: ${result.runner_up_id}`
    );
    console.log(`📊 Tournament multiplier: ${result.multiplier}x`);
   } else {
    throw new Error('Unknown error occurred during calculation');
   }
  } catch (error) {
   console.error('💥 Error calculating tournament results:', error);
   toast.error('Lỗi khi tính toán kết quả giải đấu');
   throw error;
  }
 };

 const handleCompleteTournament = async () => {
  try {
   setIsCompleting(true);
   console.log(`🎯 Force completing tournament: ${tournamentId}`);

   // The new function handles both result calculation and status update
   await calculateTournamentResults();

   toast.success(
    `🎉 Giải đấu "${tournamentName}" đã hoàn thành thành công!`
   );

   // Force refresh after successful completion
   if (onStatusChanged) {
    setTimeout(() => {
     onStatusChanged();
    }, 1000);
   }

   // Force page reload after a delay to ensure all data is refreshed
   setTimeout(() => {
    window.location.reload();
   }, 2000);
  } catch (error) {
   console.error('💥 Error completing tournament:', error);
   toast.error('Lỗi hệ thống khi hoàn thành giải đấu');
  } finally {
   setIsCompleting(false);
  }
 };

 // Don't show button if tournament is already completed
 if (currentStatus === 'completed') {
  return null;
 }

 return (
  <AlertDialog>
   <AlertDialogTrigger asChild>
    <Button
     variant='default'
     
     disabled={isCompleting}
     className='gap-2'
    >
     {isCompleting ? (
      <Loader2 className='h-4 w-4 animate-spin' />
     ) : (
      <Trophy className='h-4 w-4' />
     )}
     Hoàn thành giải đấu
    </Button>
   </AlertDialogTrigger>

   <AlertDialogContent>
    <AlertDialogHeader>
     <AlertDialogTitle>🏆 Xác nhận hoàn thành giải đấu</AlertDialogTitle>
     <AlertDialogDescription className='space-y-2'>
      <p>
       Bạn có chắc chắn muốn hoàn thành giải đấu{' '}
       <strong>"{tournamentName}"</strong>?
      </p>
      <div className='bg-primary-50 p-3 rounded-lg text-sm'>
       <p className='font-medium text-primary-800 mb-1'>
        Hệ thống sẽ tự động:
       </p>
       <ul className='list-disc list-inside text-primary-700 space-y-1'>
        <li>Tính toán kết quả cho tất cả 16 người tham gia</li>
        <li>Xác định chính xác vô địch và á quân</li>
        <li>Phân hạng từ 1-16 dựa trên kết quả bracket</li>
        <li>Trao điểm SPA và ELO cho các người chơi</li>
        <li>Cập nhật trạng thái giải đấu thành "Hoàn thành"</li>
       </ul>
      </div>
      <p className='text-amber-600 font-medium'>
       ⚠️ Hành động này không thể hoàn tác!
      </p>
     </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
     <AlertDialogCancel>Hủy</AlertDialogCancel>
     <AlertDialogAction
      onClick={handleCompleteTournament}
      disabled={isCompleting}
      variant="default"
     >
      {isCompleting ? (
       <>
        <Loader2 className='h-4 w-4 animate-spin mr-2' />
        Đang xử lý...
       </>
      ) : (
       <>
        <Trophy className='h-4 w-4 mr-2' />
        Hoàn thành giải đấu
       </>
      )}
     </AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 );
};

export default ForceCompleteTournamentButton;
