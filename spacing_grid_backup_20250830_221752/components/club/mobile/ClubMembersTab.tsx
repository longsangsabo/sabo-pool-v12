import { useMemo, useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { Users, Search, Loader2, Crown, Shield } from 'lucide-react';
import ClubStatusBadge from './ClubStatusBadge';
import ClubEmptyState from './ClubEmptyState';
import { useInfiniteClubMembers } from '@/hooks/club/useClubMembers';
import { performanceUtils } from '@sabo/shared-utils';
import { clubRoleUtils } from "@sabo/shared-utils"
import { useSocialProfile } from '@/hooks/useSocialProfile';

interface MemberItem {
  id: string;
  name: string;
  avatar_url?: string;
  rank?: string;
  status?: string;
  role?: string;
}

interface ClubMembersTabProps {
  clubId?: string;
  initialMembers?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    rank?: string;
    status?: string;
    role?: string;
  }>;
  dark?: boolean;
  onMemberClick?: (id: string) => void;
  onInvite?: () => void;
  currentUserId?: string;
  currentUserRole?: string; // owner | moderator | member
}

export const ClubMembersTab: React.FC<ClubMembersTabProps> = ({
  clubId,
  initialMembers = [],
  dark,
  onMemberClick,
  onInvite,
  currentUserId,
  currentUserRole,
}) => {
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'member'
  >('all');
  const { navigateToSocialProfile } = useSocialProfile();
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'owner' | 'moderator' | 'member'
  >('all');
  const limit = 40;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteClubMembers(
    clubId,
    {
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      role: roleFilter === 'all' ? undefined : roleFilter,
      search: searchDebounced || undefined,
    },
    !!clubId
  );

  // Flatten pages
  const remoteMembers = useMemo(
    () => (data?.pages || []).flat() as MemberItem[],
    [data]
  );
  const sourceMembers = clubId
    ? remoteMembers
    : (initialMembers as MemberItem[]);

  const filtered = useMemo(() => {
    return (sourceMembers as MemberItem[]).filter((m: MemberItem) => {
      if (
        searchDebounced &&
        !m.name.toLowerCase().includes(searchDebounced.toLowerCase())
      )
        return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (roleFilter !== 'all' && (m.role || 'member') !== roleFilter)
        return false;
      return true;
    });
  }, [sourceMembers, searchDebounced, statusFilter, roleFilter]);

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
      { rootMargin: '120px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, data]);

  const isOwner = currentUserRole === 'owner';

  return (
    <TabsContent value='members'>
      <div
        className={`mobile-card-standard p-3 ${dark ? 'mobile-card-glass' : ''} mobile-spacing-group`}
      >
        {' '}
        {/* container standardized */}
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Users className='mobile-icon-secondary text-emerald-500' />
              {filtered.length > 0 && (
                <span className='absolute -top-1 -right-1 bg-error-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center'>
                  {filtered.length}
                </span>
              )}
            </div>
            <h3 className='mobile-heading-tertiary'>Thành viên</h3>
          </div>
          {isOwner && (
            <button
              onClick={onInvite}
              className='text-[11px] font-medium text-primary hover:underline px-2 py-1 rounded-md'
            >
              + Mời
            </button>
          )}
        </div>
        {/* Filters */}
        <div className='space-y-1'>
          <div className='mobile-filter-bar'>
            <button
              onClick={() => setStatusFilter('all')}
              className={`mobile-filter-chip ${statusFilter === 'all' ? 'mobile-filter-chip-active' : ''}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('member')}
              className={`mobile-filter-chip ${statusFilter === 'member' ? 'mobile-filter-chip-active' : ''}`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`mobile-filter-chip ${statusFilter === 'pending' ? 'mobile-filter-chip-active' : ''}`}
            >
              Chờ duyệt
            </button>
          </div>
          <div className='mobile-filter-bar'>
            <button
              onClick={() => setRoleFilter('all')}
              className={`mobile-filter-chip ${roleFilter === 'all' ? 'mobile-filter-chip-alt-active' : ''}`}
            >
              Role: All
            </button>
            <button
              onClick={() => setRoleFilter('owner')}
              className={`mobile-filter-chip ${roleFilter === 'owner' ? 'mobile-filter-chip-alt-active' : ''}`}
            >
              Owner
            </button>
            <button
              onClick={() => setRoleFilter('moderator')}
              className={`mobile-filter-chip ${roleFilter === 'moderator' ? 'mobile-filter-chip-alt-active' : ''}`}
            >
              Mod
            </button>
            <button
              onClick={() => setRoleFilter('member')}
              className={`mobile-filter-chip ${roleFilter === 'member' ? 'mobile-filter-chip-alt-active' : ''}`}
            >
              Member
            </button>
          </div>
        </div>
        {/* Search */}
        <div className='relative'>
          <Search className='mobile-icon-secondary absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Tìm thành viên...'
            className='pl-8 text-body-small h-9 mobile-input-standard'
          />
        </div>
        {/* List */}
        <div className='space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar'>
          {isLoading && (
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 p-2'>
                  <div className='skeleton-avatar w-10 h-10' />
                  <div className='flex-1 space-y-2'>
                    <div className='skeleton-line w-1/2' />
                    <div className='skeleton-line w-1/3' />
                  </div>
                  <div className='skeleton-line w-12 h-4' />
                </div>
              ))}
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <ClubEmptyState
              title='Không tìm thấy'
              description='Không có thành viên phù hợp bộ lọc.'
              actionLabel={
                statusFilter === 'pending' ? 'Mời thành viên' : undefined
              }
              onAction={onInvite}
            />
          )}
          {filtered.map((m: MemberItem) => {
            const role = (m.role || 'member').toLowerCase();
            return (
              <button
                key={m.id}
                onClick={() => {
                  // Navigate to social profile instead of member sheet
                  navigateToSocialProfile(m.id, m.name);
                  // Keep original callback for backward compatibility
                  onMemberClick?.(m.id);
                }}
                className={`mobile-list-item mobile-list-item-hover w-full text-left group ${dark ? 'mobile-card-glass' : 'bg-white'}`}
              >
                <Avatar className='mobile-avatar-medium cursor-pointer'>
                  <AvatarImage src={m.avatar_url} />
                  <AvatarFallback>
                    {m.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-1'>
                    <div className='font-medium truncate text-sm'>{m.name}</div>
                    {role === 'owner' && (
                      <Crown className='mobile-icon-small text-amber-400' />
                    )}
                    {role === 'moderator' && (
                      <Shield className='mobile-icon-small text-blue-400' />
                    )}
                  </div>
                  <div className='text-[10px] text-muted-foreground flex items-center gap-1'>
                    Rank: {m.rank || 'N/A'}
                  </div>
                </div>
                <ClubStatusBadge status={m.status} role={m.role} size='sm' />
              </button>
            );
          })}
          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className='py-4 flex justify-center'>
              {isFetchingNextPage && (
                <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
              )}
            </div>
          )}
        </div>
        {/* Invite CTA */}
        <div className='pt-2 flex justify-center'>
          <button
            onClick={onInvite}
            className='text-[12px] font-medium text-primary hover:underline flex items-center gap-1 mobile-touch-target'
          >
            + Mời thành viên
          </button>
        </div>
      </div>
    </TabsContent>
  );
};

export default ClubMembersTab;
