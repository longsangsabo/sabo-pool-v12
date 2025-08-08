import React, { useEffect, useMemo, useRef } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Activity, Loader2 } from 'lucide-react';
import ClubEmptyState from './ClubEmptyState';
import { useInfiniteClubActivities } from '@/hooks/club/useClubActivities';
import { Button } from '@/components/ui/button';

interface ClubActivitiesTabProps {
  clubId?: string;
  initialActivities?: Array<{
    id: string;
    type: string;
    content: string;
    created_at: string;
  }>;
  dark?: boolean;
}

export const ClubActivitiesTab: React.FC<ClubActivitiesTabProps> = ({
  clubId,
  initialActivities = [],
  dark,
}) => {
  const limit = 30;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteClubActivities(clubId, { limit }, !!clubId);

  const remote = useMemo(() => (data?.pages || []).flat(), [data]);
  const activities = clubId ? remote : initialActivities.slice(0, limit);

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) fetchNextPage();
        });
      },
      { rootMargin: '160px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, data]);

  return (
    <TabsContent value='activities'>
      <div
        className={`mobile-card-standard p-3 ${dark ? 'mobile-card-glass' : ''} mobile-spacing-group`}
      >
        <h3 className='mobile-heading-tertiary flex items-center gap-2'>
          <Activity className='mobile-icon-secondary text-blue-500' />
          Hoạt động gần đây
        </h3>
        {isLoading && (
          <div className='mobile-loading-section py-8'>
            <Loader2 className='mobile-icon-secondary animate-spin' />
            Đang tải...
          </div>
        )}
        {!isLoading && activities.length === 0 && (
          <ClubEmptyState
            title='Chưa có hoạt động'
            description='Các hoạt động của CLB sẽ xuất hiện tại đây.'
          />
        )}
        <div className='space-y-2'>
          {activities.map(a => (
            <div
              key={a.id}
              className={`mobile-list-item mobile-list-item-hover text-sm ${dark ? 'mobile-card-glass' : 'bg-white'}`}
            >
              <div className='w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex-shrink-0'>
                <Activity className='mobile-icon-secondary text-blue-500' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>{a.content}</p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {new Date(a.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
          {hasNextPage && (
            <div ref={loadMoreRef} className='py-6 flex justify-center'>
              {isFetchingNextPage && (
                <Loader2 className='mobile-icon-secondary animate-spin text-muted-foreground' />
              )}
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default ClubActivitiesTab;
