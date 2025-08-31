import { Progress } from '@/components/ui/progress';
import { RankBadge } from './RankBadge';

interface RankProgressBarProps {
 current?: {
  code: string;
  name: string;
  level: number;
 };
 next?: {
  code: string;
  name: string;
  level: number;
 } | null;
 progress: number;
 pointsToNext: number;
 pointsNeeded: number;
}

export const RankProgressBar: React.FC<RankProgressBarProps> = ({
 current,
 next,
 progress,
 pointsToNext,
 pointsNeeded,
}) => {
 if (!current) {
  return (
   <div className='bg-card p-4 rounded-lg border'>
    <p className='text-center text-muted-foreground'>
     Chưa có thông tin hạng
    </p>
   </div>
  );
 }

 return (
  <div className='bg-card p-6 rounded-lg border'>
   <div className='flex items-center justify-between mb-4'>
    <div className='flex items-center gap-3'>
     <RankBadge rank={current} />
     <div>
      <h3 className='font-semibold text-lg'>{current.name}</h3>
      <p className='text-body-small text-muted-foreground'>Hạng hiện tại</p>
     </div>
    </div>

    {next && (
     <div className='flex items-center gap-3'>
      <div className='text-right'>
       <h3 className='font-semibold text-lg'>{next.name}</h3>
       <p className='text-body-small text-muted-foreground'>Hạng tiếp theo</p>
      </div>
      <RankBadge rank={next} />
     </div>
    )}
   </div>

   {next ? (
    <>
     <div className='mb-2 flex justify-between text-sm'>
      <span>Tiến độ thăng hạng</span>
      <span className='font-medium'>{Math.round(progress)}%</span>
     </div>

     <Progress value={progress} className='h-3 mb-3' />

     <div className='flex justify-between text-body-small text-muted-foreground'>
      <span>
       Cần thêm {pointsToNext.toLocaleString('vi-VN')} SPA points
      </span>
      <span>
       {pointsNeeded.toLocaleString('vi-VN')} points để thăng hạng
      </span>
     </div>
    </>
   ) : (
    <div className='text-center py-4'>
     <div className='text-heading mb-2'>🏆</div>
     <p className='font-semibold text-body-large text-warning-600'>
      Hạng cao nhất!
     </p>
     <p className='text-body-small text-muted-foreground'>
      Bạn đã đạt được hạng cao nhất trong hệ thống
     </p>
    </div>
   )}
  </div>
 );
};
