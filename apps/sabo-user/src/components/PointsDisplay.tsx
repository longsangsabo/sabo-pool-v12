
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckIn } from '@/hooks/useCheckIn';
import { Trophy, Star } from 'lucide-react';

const PointsDisplay = () => {
 const { userStreak, isLoading } = useCheckIn();

 if (isLoading) {
  return (
   <Card className='mb-4'>
    <CardContent className='p-4'>
     <div className='animate-pulse'>
      <div className='h-6 bg-neutral-200 rounded w-32 mb-2'></div>
      <div className='h-4 bg-neutral-200 rounded w-24'></div>
     </div>
    </CardContent>
   </Card>
  );
 }

 if (!userStreak) return null;

 return (
  <Card className='mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-warning'>
   <CardContent className='p-4'>
    <div className='flex items-center justify-between'>
     <div className='flex items-center gap-3'>
      <div className='w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center'>
       <Trophy className='w-5 h-5 text-warning-600' />
      </div>
      <div>
       <h3 className='font-semibold text-neutral-900'>
        Điểm của bạn: {userStreak.total_points}
       </h3>
       <div className='flex items-center gap-2 mt-1'>
        <Badge variant='secondary' className='text-xs'>
         🔥 Streak: {userStreak.current_streak} ngày
        </Badge>
        <Badge variant='outline' className='text-xs'>
         <Star className='w-3 h-3 mr-1' />
         Cao nhất: {userStreak.longest_streak}
        </Badge>
       </div>
      </div>
     </div>

     <div className='text-right'>
      <div className='text-body-small text-neutral-500'>Hôm nay</div>
      <div className='text-body-large font-bold text-warning-600'>
       +{userStreak.current_streak >= 7 ? '20' : '10'} điểm
      </div>
     </div>
    </div>

    {/* Milestone progress */}
    <div className='mt-4 space-y-2'>
     <div className='text-caption-neutral mb-1'>Cột mốc tiếp theo:</div>
     {userStreak.current_streak < 30 && (
      <div className='flex items-center gap-2'>
       <div className='flex-1 bg-neutral-200 rounded-full h-2'>
        <div
         className='bg-yellow-400 h-2 rounded-full transition-all duration-300'
         style={{
          width: `${(userStreak.current_streak / 30) * 100}%`,
         }}
        />
       </div>
       <span className='text-caption-neutral'>30 ngày (+50 điểm)</span>
      </div>
     )}
     {userStreak.current_streak >= 30 &&
      userStreak.current_streak < 60 && (
       <div className='flex items-center gap-2'>
        <div className='flex-1 bg-neutral-200 rounded-full h-2'>
         <div
          className='bg-orange-400 h-2 rounded-full transition-all duration-300'
          style={{
           width: `${((userStreak.current_streak - 30) / 30) * 100}%`,
          }}
         />
        </div>
        <span className='text-caption-neutral'>
         60 ngày (+50 điểm)
        </span>
       </div>
      )}
     {userStreak.current_streak >= 60 &&
      userStreak.current_streak < 90 && (
       <div className='flex items-center gap-2'>
        <div className='flex-1 bg-neutral-200 rounded-full h-2'>
         <div
          className='bg-red-400 h-2 rounded-full transition-all duration-300'
          style={{
           width: `${((userStreak.current_streak - 60) / 30) * 100}%`,
          }}
         />
        </div>
        <span className='text-caption-neutral'>
         90 ngày (+50 điểm)
        </span>
       </div>
      )}
    </div>
   </CardContent>
  </Card>
 );
};

export default PointsDisplay;
