import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Users,
  Target,
  Star,
  Activity,
  UserPlus,
  Settings2,
  ShieldCheck,
  BarChart3,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import ClubStatCard from './ClubStatCard';
import { useClubProfile } from '@/hooks/club/useClubProfile';
import { useClubMembers } from '@/hooks/club/useClubMembers';
import { useClubActivities } from '@/hooks/club/useClubActivities';
import ClubEmptyState from './ClubEmptyState';
import { MobileSectionHeader } from '@/components/ui/mobile-section-header';
import { MobileCard } from '@/components/ui/mobile-card';

interface ClubOwnerDashboardMobileProps {
  clubId: string;
  onNavigateMembers?: () => void;
  onNavigateActivities?: () => void;
  onInvite?: () => void;
  onSettings?: () => void;
}

export const ClubOwnerDashboardMobile: React.FC<
  ClubOwnerDashboardMobileProps
> = ({
  clubId,
  onNavigateMembers,
  onNavigateActivities,
  onInvite,
  onSettings,
}) => {
  const { data: club } = useClubProfile(clubId, true);
  const { data: members = [] } = useClubMembers(clubId, {}, true);
  const { data: activities = [] } = useClubActivities(
    clubId,
    { limit: 10 },
    true
  );

  const stats = useMemo(
    () => [
      {
        label: 'Thành viên',
        value: club?.member_count ?? members.length,
        icon: Users,
        accent: 'text-emerald-500',
      },
      {
        label: 'Trận',
        value: club?.total_matches ?? 0,
        icon: Target,
        accent: 'text-blue-500',
      },
      {
        label: 'Giải đấu',
        value: club?.total_tournaments ?? 0,
        icon: Trophy,
        accent: 'text-purple-500',
      },
      {
        label: 'Uy tín',
        value: club?.trust_score ?? 0,
        icon: Star,
        accent: 'text-amber-500',
      },
    ],
    [club, members.length]
  );

  return (
    <div className='min-h-screen pb-24 px-4 pt-4 space-y-6'>
      {/* Header using shared component */}
      <MobileSectionHeader title='Quản trị CLB' icon={ShieldCheck} />

      {/* Stat Grid */}
      <div className='grid grid-cols-2 gap-3'>
        {stats.map(s => (
          <ClubStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            accentClass={s.accent}
          />
        ))}
      </div>

      {/* Quick Owner Actions */}
      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='outline'
          className='justify-start gap-2 h-12 text-left'
          onClick={onInvite}
        >
          <UserPlus className='w-4 h-4 text-emerald-500 flex-shrink-0' />
          <span className='text-body-small-medium'>Mời thành viên</span>
        </Button>
        <Button
          variant='outline'
          className='justify-start gap-2 h-12 text-left'
          onClick={onSettings}
        >
          <Settings2 className='w-4 h-4 text-blue-500 flex-shrink-0' />
          <span className='text-body-small-medium'>Cài đặt CLB</span>
        </Button>
        <Button
          variant='outline'
          className='justify-start gap-2 h-12 text-left'
          onClick={onNavigateMembers}
        >
          <Users className='w-4 h-4 text-indigo-500 flex-shrink-0' />
          <span className='text-body-small-medium'>Quản lý thành viên</span>
        </Button>
        <Button
          variant='outline'
          className='justify-start gap-2 h-12 text-left'
          onClick={onNavigateActivities}
        >
          <Activity className='w-4 h-4 text-purple-500 flex-shrink-0' />
          <span className='text-body-small-medium'>Hoạt động gần đây</span>
        </Button>
      </div>

      {/* Recent Activities Card using shared component */}
      <MobileCard title='Hoạt động mới' icon={TrendingUp}>
        <div className='space-y-2'>
          {activities.length === 0 && (
            <ClubEmptyState
              title='Chưa có hoạt động'
              description='Hoạt động quản trị gần đây sẽ hiển thị tại đây.'
              className='border-0 py-4'
            />
          )}
          {activities.slice(0, 5).map(a => (
            <div
              key={a.id}
              className='flex items-center gap-3 p-2 rounded-md border text-body-small bg-muted/40 dark:bg-slate-800/40'
            >
              <Activity className='w-4 h-4 text-blue-500 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>{a.content}</p>
                <p className='text-caption text-muted-foreground mt-0.5'>
                  {new Date(a.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileCard>

      {/* Performance Overview Card using shared component */}
      <MobileCard title='Hiệu suất CLB' icon={BarChart3}>
        <p className='text-body-small text-muted-foreground'>
          Thống kê chi tiết về hiệu suất hoạt động CLB sẽ được cập nhật trong
          phiên bản tới.
        </p>
      </MobileCard>
    </div>
  );
};

export default ClubOwnerDashboardMobile;
