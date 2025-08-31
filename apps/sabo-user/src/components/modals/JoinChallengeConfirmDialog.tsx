import React from 'react';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Coins, Clock, User } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { formatVietnamTime } from "@sabo/shared-utils"

interface JoinChallengeConfirmDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 challenge: Challenge | null;
 onConfirm: () => void;
 loading?: boolean;
}

const JoinChallengeConfirmDialog: React.FC<JoinChallengeConfirmDialogProps> = ({
 open,
 onOpenChange,
 challenge,
 onConfirm,
 loading = false,
}) => {
 if (!challenge) return null;

 const formatTime = (timeString: string) => {
  return formatVietnamTime(timeString);
 };

 const getChallengeTypeLabel = (type: string) => {
  switch (type) {
   case 'casual': return 'Giải trí';
   case 'ranked': return 'Xếp hạng';
   case 'tournament': return 'Giải đấu';
   default: return 'Thách đấu';
  }
 };

 const getGameFormatLabel = (format: string) => {
  switch (format) {
   case '8-ball': return '8-Ball';
   case '9-ball': return '9-Ball';
   case '10-ball': return '10-Ball';
   case 'straight': return 'Straight Pool';
   default: return format || 'Không xác định';
  }
 };

 return (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
   <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
     <AlertDialogTitle className="flex items-center gap-2">
      <Trophy className="h-5 w-5 text-yellow-500" />
      Xác nhận tham gia thách đấu
     </AlertDialogTitle>
     <AlertDialogDescription asChild>
      <div className="space-y-4 text-left">
       <p className="text-body-small text-muted-foreground">
        Bạn có chắc chắn muốn tham gia thách đấu này không?
       </p>
       
       {/* Challenge Details */}
       <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
         <User className="h-4 w-4 text-blue-500" />
         <span className="text-body-small-medium">Đối thủ:</span>
         <span className="text-body-small">{challenge.challenger_name || 'Ẩn danh'}</span>
        </div>
        
        <div className="flex items-center gap-2">
         <Trophy className="h-4 w-4 text-yellow-500" />
         <span className="text-body-small-medium">Loại:</span>
         <Badge variant="outline" className="text-caption">
          {getChallengeTypeLabel(challenge.challenge_type)}
         </Badge>
        </div>
        
        <div className="flex items-center gap-2">
         <span className="text-body-small-medium">Định dạng:</span>
         <Badge variant="secondary" className="text-caption">
          {getGameFormatLabel(challenge.game_format)}
         </Badge>
        </div>
        
        {challenge.bet_points && challenge.bet_points > 0 && (
         <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-green-500" />
          <span className="text-body-small-medium">SPA cược:</span>
          <Badge variant="destructive" className="text-caption">
           {challenge.bet_points.toLocaleString()} SPA
          </Badge>
         </div>
        )}
        
        {challenge.scheduled_time && (
         <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-body-small-medium">Thời gian:</span>
          <span className="text-caption">{formatTime(challenge.scheduled_time)}</span>
         </div>
        )}
        
        {challenge.description && (
         <div className="space-y-1">
          <span className="text-body-small-medium">Mô tả:</span>
          <p className="text-caption text-muted-foreground bg-background p-2 rounded">
           {challenge.description}
          </p>
         </div>
        )}
       </div>
       
       {challenge.bet_points && challenge.bet_points > 0 && (
        <div className="p-2 bg-warning-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
         <p className="text-caption text-warning-800 dark:text-yellow-200">
          ⚠️ Lưu ý: Bạn sẽ bị trừ {challenge.bet_points.toLocaleString()} SPA Points khi tham gia.
         </p>
        </div>
       )}
      </div>
     </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
     <AlertDialogCancel disabled={loading}>
      Hủy bỏ
     </AlertDialogCancel>
     <AlertDialogAction 
      onClick={onConfirm}
      disabled={loading}
      className="bg-success-600 hover:bg-success-700"
     >
      {loading ? 'Đang xử lý...' : 'Tham gia ngay'}
     </AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 );
};

export default JoinChallengeConfirmDialog;
