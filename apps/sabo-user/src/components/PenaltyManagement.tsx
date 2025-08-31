import { useState, useEffect } from 'react';
import { Typography } from '@sabo/shared-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { toast } from 'sonner';
import {
 AlertTriangle,
 Clock,
 CheckCircle,
 XCircle,
 Calendar,
 FileText,
} from 'lucide-react';
import PenaltyAppealModal from './PenaltyAppealModal';

interface Penalty {
 id: string;
 penalty_type: string;
 severity: string;
 start_date: string;
 end_date: string | undefined;
 reason: string;
 status: string;
 appeal_reason: string | undefined;
 appeal_date: string | undefined;
 appeal_decision: string | undefined;
 appeal_decision_date: string | undefined;
}

const PenaltyManagement = () => {
 const { user } = useAuth();
 const [penalties, setPenalties] = useState<Penalty[]>([]);
 const [loading, setLoading] = useState(true);
 const [appealModal, setAppealModal] = useState<{
  isOpen: boolean;
  penaltyId: string;
  reason: string;
 }>({
  isOpen: false,
  penaltyId: '',
  reason: '',
 });

 useEffect(() => {
  if (user) {
   fetchPenalties();
  }
 }, [user]);

 const fetchPenalties = async () => {
  if (!user) return;

  try {
//    const { data, error } = await (supabase as any)
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

   if (error) throw error;
   setPenalties((data as any) || []);
  } catch (error) {
   console.error('Error fetching penalties:', error);
  } finally {
   setLoading(false);
  }
 };

 const getPenaltyTypeLabel = (type: string) => {
  switch (type) {
   case 'warning':
    return 'Cảnh báo';
   case 'match_restriction':
    return 'Hạn chế thi đấu';
   case 'temporary_ban':
    return 'Cấm tạm thời';
   case 'permanent_ban':
    return 'Cấm vĩnh viễn';
   default:
    return type;
  }
 };

 const getSeverityLabel = (severity: string) => {
  switch (severity) {
   case 'minor':
    return 'Nhẹ';
   case 'major':
    return 'Nghiêm trọng';
   case 'severe':
    return 'Rất nghiêm trọng';
   default:
    return severity;
  }
 };

 const getStatusBadge = (penalty: Penalty) => {
  const now = new Date();
  const endDate = penalty.end_date ? new Date(penalty.end_date) : null;

  if (penalty.status === 'appealed') {
   return (
    <Badge className='bg-primary-100 text-primary-800'>
     <Clock className='w-3 h-3 mr-1' />
     Đang kháng cáo
    </Badge>
   );
  }

  if (penalty.status === 'overturned') {
   return (
    <Badge className='bg-success-100 text-success-800'>
     <CheckCircle className='w-3 h-3 mr-1' />
     Đã hủy bỏ
    </Badge>
   );
  }

  if (penalty.status === 'expired' || (endDate && now > endDate)) {
   return (
    <Badge className='bg-neutral-100 text-neutral-800'>
     <CheckCircle className='w-3 h-3 mr-1' />
     Đã hết hạn
    </Badge>
   );
  }

  return (
   <Badge className='bg-error-100 text-error-800'>
    <AlertTriangle className='w-3 h-3 mr-1' />
    Đang hiệu lực
   </Badge>
  );
 };

 const canAppeal = (penalty: Penalty) => {
  return (
   penalty.status === 'active' &&
   !penalty.appeal_reason &&
   penalty.penalty_type !== 'warning'
  );
 };

 const openAppealModal = (penaltyId: string, reason: string) => {
  setAppealModal({
   isOpen: true,
   penaltyId,
   reason,
  });
 };

 const closeAppealModal = () => {
  setAppealModal({
   isOpen: false,
   penaltyId: '',
   reason: '',
  });
 };

 if (loading) {
  return (
   <Card>
    <CardContent className='pt-6'>
     <div className='text-center'>
      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2'></div>
      <p className='text-body-small-neutral'>Đang tải...</p>
     </div>
    </CardContent>
   </Card>
  );
 }

 return (
  <>
   <Card>
    <CardHeader>
     <CardTitle className='flex items-center'>
      <AlertTriangle className='w-5 h-5 mr-2' />
      Hình phạt & Kháng cáo ({penalties.length})
     </CardTitle>
    </CardHeader>
    <CardContent>
     {penalties.length === 0 ? (
      <div className='text-center text-neutral-500 py-8'>
       <CheckCircle className='w-12 h-12 mx-auto mb-4 text-gray-300' />
       <Typography variant="body" >Không có hình phạt nào</Typography>
       <p className='text-sm'>Giữ vững phong độ chơi công bằng!</p>
      </div>
     ) : (
      <div className='space-y-4'>
       {penalties.map(penalty => (
        <div key={penalty.id} className='border rounded-lg p-4'>
         <div className='flex items-center justify-between mb-3'>
          <div>
           <h3 className='font-semibold'>
            {getPenaltyTypeLabel(penalty.penalty_type)}
           </h3>
           <p className='text-body-small-neutral'>
            Mức độ: {getSeverityLabel(penalty.severity)}
           </p>
          </div>
          {getStatusBadge(penalty)}
         </div>

         <div className='space-y-2 text-sm'>
          <div className='flex items-center text-neutral-600'>
           <Calendar className='w-4 h-4 mr-2' />
           Từ:{' '}
           {new Date(penalty.start_date).toLocaleDateString('vi-VN')}
           {penalty.end_date && (
            <span className='ml-2'>
             đến:{' '}
             {new Date(penalty.end_date).toLocaleDateString(
              'vi-VN'
             )}
            </span>
           )}
          </div>

          <div className='bg-neutral-50 p-3 rounded'>
           <strong>Lý do:</strong>
           <p className='mt-1'>{penalty.reason}</p>
          </div>

          {/* Appeal Information */}
          {penalty.appeal_reason && (
           <div className='bg-primary-50 p-3 rounded'>
            <div className='flex items-center mb-2'>
             <FileText className='w-4 h-4 mr-2 text-primary-600' />
             <strong className='text-blue-900'>Kháng cáo:</strong>
            </div>
            <p className='text-primary-800 mb-2'>
             {penalty.appeal_reason}
            </p>
            {penalty.appeal_date && (
             <p className='text-caption text-primary-600'>
              Gửi ngày:{' '}
              {new Date(penalty.appeal_date).toLocaleDateString(
               'vi-VN'
              )}
             </p>
            )}

            {penalty.appeal_decision && (
             <div
              className={`mt-2 p-2 rounded ${
               penalty.appeal_decision === 'approved'
                ? 'bg-success-100 text-success-800'
                : 'bg-error-100 text-error-800'
              }`}
             >
              <strong>
               Kết quả:{' '}
               {penalty.appeal_decision === 'approved'
                ? 'Chấp nhận'
                : 'Từ chối'}
              </strong>
              {penalty.appeal_decision_date && (
               <p className='text-caption mt-1'>
                Ngày quyết định:{' '}
                {new Date(
                 penalty.appeal_decision_date
                ).toLocaleDateString('vi-VN')}
               </p>
              )}
             </div>
            )}
           </div>
          )}
         </div>

         {/* Appeal Button */}
         {canAppeal(penalty) && (
          <div className='mt-3 pt-3 border-t'>
           <Button
            
            variant='outline'
            onClick={() =>
             openAppealModal(penalty.id, penalty.reason)
            }
            className='text-primary-600 border-primary-300 hover:bg-primary-50'
           >
            <FileText className='w-4 h-4 mr-1' />
            Kháng cáo
           </Button>
           <p className='text-caption-neutral mt-1'>
            Bạn có thể kháng cáo nếu cho rằng hình phạt không công
            bằng
           </p>
          </div>
         )}
        </div>
       ))}
      </div>
     )}
    </CardContent>
   </Card>

   <PenaltyAppealModal
    isOpen={appealModal.isOpen}
    onClose={closeAppealModal}
    penaltyId={appealModal.penaltyId}
    penaltyReason={appealModal.reason}
    onAppealSubmitted={fetchPenalties}
   />
  </>
 );
};

export default PenaltyManagement;
