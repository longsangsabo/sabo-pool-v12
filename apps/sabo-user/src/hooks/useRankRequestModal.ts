import { useState } from 'react';
import { useRankRequests } from '@/hooks/useRankRequests';
import { toast } from 'sonner';
// import { User } from '@supabase/supabase-js';

export const useRankRequestModal = (
  user: User | null | undefined,
  clubs: { id: string; name: string; address?: string }[]
) => {
  const [open, setOpen] = useState(false);
  const [changeType, setChangeType] = useState<'up' | 'down'>('up');
  const [requestedRank, setRequestedRank] = useState('');
  const [rankReason, setRankReason] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const { createRankRequest, checkExistingPendingRequest } = useRankRequests();

  const reset = () => {
    setRequestedRank('');
    setRankReason('');
    setSelectedClubId('');
    setChangeType('up');
  };

  const submit = async () => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!selectedClubId || !requestedRank || !rankReason) {
      toast.error('Thiếu dữ liệu');
      return;
    }
    try {
      const existing = await checkExistingPendingRequest(
        user.id,
        selectedClubId
      );
      if (existing) {
        toast.error('Bạn đã có yêu cầu đang chờ tại CLB này');
        return;
      }
      await createRankRequest({
        requested_rank: requestedRank,
        club_id: selectedClubId,
        user_id: user.id,
        evidence_files: [
          {
            id: 'reason',
            name: 'reason.txt',
            url: '',
            size: rankReason.length,
            type: 'text/plain',
          },
        ],
      });
      toast.success('Đã gửi yêu cầu thay đổi hạng');
      setOpen(false);
      reset();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi gửi yêu cầu');
    }
  };

  return {
    open,
    setOpen,
    changeType,
    setChangeType,
    requestedRank,
    setRequestedRank,
    rankReason,
    setRankReason,
    selectedClubId,
    setSelectedClubId,
    submit,
    clubs,
  };
};
