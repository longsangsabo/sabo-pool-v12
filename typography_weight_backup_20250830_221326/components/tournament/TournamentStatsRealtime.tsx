import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, Percent } from 'lucide-react';
import { useTournamentRealtime } from '@/hooks/useTournamentRealtime';

interface TournamentStatsRealtimeProps {
  tournament: {
    id: string;
    name: string;
    max_participants: number;
    current_participants?: number;
  };
}

export const TournamentStatsRealtime: React.FC<
  TournamentStatsRealtimeProps
> = ({ tournament }) => {
  const { stats, loading } = useTournamentRealtime(tournament.id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Thống kê tham gia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse'>
            <div className='grid grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='h-16 bg-neutral-200 rounded'></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const participationPercentage =
    tournament.max_participants > 0
      ? Math.round(
          (stats.current_participants / tournament.max_participants) * 100
        )
      : 0;

  const remainingSlots =
    tournament.max_participants - stats.current_participants;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Thống kê tham gia
          <span className='ml-auto text-caption text-neutral-500'>
            Cập nhật: {stats.last_updated.toLocaleTimeString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-4 gap-4'>
          {/* Confirmed Participants */}
          <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border'>
            <div className='flex items-center justify-center mb-2'>
              <UserCheck className='h-5 w-5 text-primary-600' />
            </div>
            <div className='text-heading font-bold text-primary-600 animate-pulse'>
              {stats.confirmed}
            </div>
            <div className='text-caption text-primary-700 font-medium'>Đã xác nhận</div>
          </div>

          {/* Pending Participants */}
          <div className='text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border'>
            <div className='flex items-center justify-center mb-2'>
              <Clock className='h-5 w-5 text-warning-600' />
            </div>
            <div className='text-heading font-bold text-warning-600'>
              {stats.pending}
            </div>
            <div className='text-caption text-warning-700 font-medium'>
              Chờ xác nhận
            </div>
          </div>

          {/* Remaining Slots */}
          <div className='text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border'>
            <div className='flex items-center justify-center mb-2'>
              <Users className='h-5 w-5 text-success-600' />
            </div>
            <div className='text-heading font-bold text-success-600'>
              {remainingSlots}
            </div>
            <div className='text-caption text-success-700 font-medium'>Còn lại</div>
          </div>

          {/* Participation Percentage */}
          <div className='text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border'>
            <div className='flex items-center justify-center mb-2'>
              <Percent className='h-5 w-5 text-info-600' />
            </div>
            <div className='text-heading font-bold text-info-600'>
              {participationPercentage}%
            </div>
            <div className='text-caption text-info-700 font-medium'>Đã đầy</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='mt-4'>
          <div className='flex justify-between text-body-small mb-2'>
            <span>Tiến độ đăng ký</span>
            <span className='font-medium'>
              {stats.current_participants}/{tournament.max_participants}
            </span>
          </div>
          <div className='w-full bg-neutral-200 rounded-full h-3'>
            <div
              className='bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out'
              style={{
                width: `${participationPercentage}%`,
              }}
            />
          </div>
          <div className='flex justify-between text-caption text-neutral-500 mt-1'>
            <span>0%</span>
            <span className='font-medium text-neutral-700'>
              {participationPercentage}% hoàn thành
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className='flex items-center justify-between mt-4 p-3 bg-neutral-50 rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-success-500 rounded-full animate-pulse'></div>
            <span className='text-body-small font-medium text-neutral-700'>
              Live Updates
            </span>
          </div>
          <div className='text-caption text-neutral-500'>
            {remainingSlots > 0 ? (
              <span className='text-success-600 font-medium'>
                🟢 Còn chỗ trống
              </span>
            ) : (
              <span className='text-error-600 font-medium'>🔴 Đã đầy</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
