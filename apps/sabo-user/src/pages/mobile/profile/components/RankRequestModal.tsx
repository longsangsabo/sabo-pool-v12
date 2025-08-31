import React from 'react';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RANK_OPTIONS } from '@/types/profile';

interface RankRequestModalProps {
 open: boolean;
 onOpenChange: (v: boolean) => void;
 theme: 'light' | 'dark';
 clubs: { id: string; name: string; address?: string }[];
 selectedClubId: string;
 setSelectedClubId: (v: string) => void;
 requestedRank: string;
 setRequestedRank: (v: string) => void;
 rankReason: string;
 setRankReason: (v: string) => void;
 onSubmit: () => void;
 disabled?: boolean;
 changeType: 'up' | 'down';
 setChangeType: (v: 'up' | 'down') => void;
}

export const RankRequestModal: React.FC<RankRequestModalProps> = ({
 open,
 onOpenChange,
 theme,
 clubs,
 selectedClubId,
 setSelectedClubId,
 requestedRank,
 setRequestedRank,
 rankReason,
 setRankReason,
 onSubmit,
 disabled,
 changeType,
 setChangeType,
}) => {
 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent className='max-w-md'>
    <DialogHeader>
     <DialogTitle className='text-base'>Yêu cầu thay đổi hạng</DialogTitle>
    </DialogHeader>
    <div className='space-y-4'>
     <div className='flex gap-2'>
      <Button
       onClick={() => setChangeType('up')}
       className={`flex-1 py-2 text-body-small-medium rounded-md border transition ${
        changeType === 'up'
         ? theme === 'dark'
          ? 'bg-emerald-600 text-white border-emerald-500'
          : 'bg-emerald-500 text-white border-emerald-500'
         : theme === 'dark'
          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
       }`}
      >
       Tăng hạng
      </Button>
      <Button
       onClick={() => setChangeType('down')}
       className={`flex-1 py-2 text-body-small-medium rounded-md border transition ${
        changeType === 'down'
         ? theme === 'dark'
          ? 'bg-rose-600 text-white border-rose-500'
          : 'bg-rose-500 text-white border-rose-500'
         : theme === 'dark'
          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
       }`}
      >
       Giảm hạng
      </Button>
     </div>

     <div>
      <label className='text-caption-medium mb-1 block'>Chọn CLB</label>
      <select
       className={`w-full px-3 py-2 text-body-small rounded-md border outline-none transition ${
        theme === 'dark'
         ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-emerald-400'
         : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
       }`}
       value={selectedClubId}
       onChange={e => setSelectedClubId(e.target.value)}
      >
       <option value=''>-- Chọn CLB --</option>
       {clubs.map(c => (
        <option key={c.id} value={c.id}>
         {c.name}
        </option>
       ))}
      </select>
     </div>

     <div>
      <label className='text-caption-medium mb-1 block'>
       Chọn hạng mới
      </label>
      <select
       className={`w-full px-3 py-2 text-body-small rounded-md border outline-none transition ${
        theme === 'dark'
         ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-emerald-400'
         : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
       }`}
       value={requestedRank}
       onChange={e => setRequestedRank(e.target.value)}
      >
       <option value=''>-- Chọn --</option>
       {RANK_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>
         {o.label}
        </option>
       ))}
      </select>
     </div>

     <div>
      <label className='text-caption-medium mb-1 block'>Lý do</label>
      <textarea
       rows={3}
       className={`w-full px-3 py-2 text-body-small rounded-md border outline-none resize-none transition ${
        theme === 'dark'
         ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-emerald-400'
         : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
       }`}
       value={rankReason}
       onChange={e => setRankReason(e.target.value)}
       placeholder='Mô tả vì sao bạn muốn thay đổi hạng...'
      />
     </div>

     <div className='flex justify-end gap-2 pt-2'>
      <Button
       variant='outline'
       
       onClick={() => onOpenChange(false)}
      >
       Hủy
      </Button>
      <Button
       
       disabled={
        disabled || !requestedRank || !rankReason || !selectedClubId
       }
       onClick={onSubmit}
      >
       Gửi yêu cầu
      </Button>
     </div>
     <p className='text-[10px] text-muted-foreground'>
      Sau khi CLB phê duyệt, hạng của bạn sẽ được cập nhật và đồng bộ đến
      các khu vực liên quan.
     </p>
    </div>
   </DialogContent>
  </Dialog>
 );
};
