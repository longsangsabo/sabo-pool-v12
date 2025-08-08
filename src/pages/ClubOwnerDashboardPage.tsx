import React, { Suspense } from 'react';
import MobilePlayerLayout from '@/components/mobile/MobilePlayerLayout';
import ClubOwnerDashboardMobile from '@/components/club/mobile/ClubOwnerDashboardMobile';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useClubRole } from '@/hooks/club/useClubRole';
import { useClubProfile } from '@/hooks/club/useClubProfile';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchClubMembers } from '@/hooks/club/useClubMembers';
import { fetchClubActivities } from '@/hooks/club/useClubActivities';

// Page expects route: /clubs/:id/owner
const ClubOwnerDashboardPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const clubId = params.id as string | undefined;
  const { session } = useSession();
  const userId = session?.user?.id;
  const { data: roleData, isLoading: roleLoading } = useClubRole(
    clubId,
    userId,
    !!clubId && !!userId
  );
  const { data: club, isLoading: clubLoading } = useClubProfile(
    clubId,
    !!clubId
  );
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (clubId && userId) {
      queryClient.prefetchQuery({
        queryKey: [
          'club-members',
          clubId,
          { status: undefined, role: undefined, limit: 40 },
        ],
        queryFn: () => fetchClubMembers(clubId, { limit: 40 }),
      });
      queryClient.prefetchQuery({
        queryKey: ['club-activities', clubId, { limit: 30 }],
        queryFn: () => fetchClubActivities(clubId, { limit: 30 }),
      });
    }
  }, [clubId, userId, queryClient]);

  const loading = roleLoading || clubLoading;
  const notAllowed =
    !loading &&
    (!roleData || (roleData.role !== 'owner' && roleData.role !== 'moderator'));

  return (
    <MobilePlayerLayout pageTitle='Quản Trị CLB'>
      {loading && (
        <div className='flex flex-col items-center justify-center py-20 gap-3 text-sm text-muted-foreground'>
          <Loader2 className='w-6 h-6 animate-spin' /> Đang tải quyền truy
          cập...
        </div>
      )}
      {!loading && notAllowed && (
        <div className='py-20 text-center text-sm text-muted-foreground'>
          Bạn không có quyền truy cập trang quản trị CLB này.
        </div>
      )}
      {!loading && !notAllowed && clubId && (
        <ClubOwnerDashboardMobile
          clubId={clubId}
          onInvite={() => navigate(`/clubs/${clubId}?tab=members&invite=1`)}
          onNavigateMembers={() => navigate(`/clubs/${clubId}?tab=members`)}
          onNavigateActivities={() =>
            navigate(`/clubs/${clubId}?tab=activities`)
          }
          onSettings={() => navigate(`/clubs/${clubId}?tab=settings`)}
        />
      )}
    </MobilePlayerLayout>
  );
};

export default ClubOwnerDashboardPage;
