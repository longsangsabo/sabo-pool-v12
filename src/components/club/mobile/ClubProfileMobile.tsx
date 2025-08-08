import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  Users,
  Trophy,
  Edit3,
  UserPlus,
  Star,
  Calendar,
  Phone,
  MapPin,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import ClubStatCard from './ClubStatCard';
import { useClubProfile } from '@/hooks/club/useClubProfile';
import { useClubMembers } from '@/hooks/club/useClubMembers';
import { useClubActivities } from '@/hooks/club/useClubActivities';
import { ClubMembersTab } from './ClubMembersTab';
import { ClubActivitiesTab } from './ClubActivitiesTab';
import MemberActionSheet from './MemberActionSheet';
import { useClubRole } from '@/hooks/club/useClubRole';
import { useSession } from '@/hooks/useSession';
import { useNavigate } from 'react-router-dom';

// Club profile data type (simplified)
interface ClubProfileMobileProps {
  club?: {
    id: string;
    name: string;
    logo_url?: string;
    address?: string;
    member_count?: number;
    trust_score?: number;
    verified?: boolean;
    description?: string;
    phone?: string;
    created_at?: string;
    total_matches?: number;
    total_tournaments?: number;
  };
  members?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    rank?: string;
    status?: string;
  }>;
  activities?: Array<{
    id: string;
    type: string;
    content: string;
    created_at: string;
  }>;
  clubId?: string; // Allow passing only an ID and fetch internals
  onEditClub?: () => void;
  onInviteMember?: () => void;
  onViewAchievements?: () => void;
  onMemberClick?: (memberId: string) => void;
  loadingOverride?: boolean;
}

// Skeleton loader component
const SkeletonBlock: React.FC<{ className?: string }> = ({
  className = '',
}) => <div className={`animate-pulse rounded-md bg-muted/60 ${className}`} />;

export const ClubProfileMobile: React.FC<ClubProfileMobileProps> = ({
  club: initialClub,
  members: initialMembers = [],
  activities: initialActivities = [],
  clubId,
  onEditClub,
  onInviteMember,
  onViewAchievements,
  onMemberClick,
  loadingOverride,
}) => {
  const { theme } = useTheme();
  const [club, setClub] = useState(initialClub || null);
  const [members, setMembers] = useState(initialMembers);
  const [activities, setActivities] = useState(initialActivities);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Member action sheet state
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);

  // Replace internal state-driven fetch with react-query hooks if clubId passed
  const {
    data: fetchedClub,
    isLoading: profileLoading,
    error: profileError,
  } = useClubProfile(clubId || club?.id, !!clubId && !initialClub);
  const { data: fetchedMembers = [], isLoading: membersLoading } =
    useClubMembers(
      clubId || club?.id,
      {},
      !!clubId && initialMembers.length === 0
    );
  const { data: fetchedActivities = [], isLoading: activitiesLoading } =
    useClubActivities(
      clubId || club?.id,
      { limit: 20 },
      !!clubId && initialActivities.length === 0
    );
  const { session } = useSession();
  const userId = session?.user?.id;
  const navigate = useNavigate();
  const { data: roleData } = useClubRole(
    clubId || initialClub?.id || club?.id,
    userId,
    !!(clubId || club?.id) && !!userId
  );
  const currentUserRole = roleData?.role;

  useEffect(() => {
    if (fetchedClub) setClub(fetchedClub as any);
  }, [fetchedClub]);
  useEffect(() => {
    if (fetchedMembers.length) setMembers(fetchedMembers as any);
  }, [fetchedMembers]);
  useEffect(() => {
    if (fetchedActivities.length) setActivities(fetchedActivities as any);
  }, [fetchedActivities]);

  const combinedLoading =
    (loadingOverride ?? false) ||
    loading ||
    profileLoading ||
    membersLoading ||
    activitiesLoading;
  const anyError =
    fetchError || (profileError ? 'Không thể tải dữ liệu club.' : null);

  const dark = theme === 'dark';

  // Stats memo
  const stats = useMemo(
    () => [
      {
        label: 'Thành viên',
        value: club?.member_count ?? members.length,
        icon: Users,
        accent: 'text-emerald-500',
      },
      {
        label: 'Trận tổ chức',
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

  // Derived selected member object
  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find(m => m.id === selectedMemberId) || null;
  }, [selectedMemberId, members]);

  const handleMemberClick = (id: string) => {
    setSelectedMemberId(id);
    setMemberSheetOpen(true);
    onMemberClick?.(id);
  };

  const handleViewProfile = (id: string) => {
    navigate(`/players/${id}`);
  };

  if (combinedLoading) {
    return (
      <div className='min-h-screen p-4 space-y-4'>
        {/* Simplified skeleton using shared stat card placeholder */}
        <div className='flex flex-col items-center gap-4'>
          <SkeletonBlock className='w-24 h-24 rounded-full' />
          <SkeletonBlock className='w-40 h-6' />
          <SkeletonBlock className='w-64 h-4' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className='h-20 rounded-xl' />
          ))}
        </div>
        <SkeletonBlock className='h-10 w-full rounded-md' />
        <SkeletonBlock className='h-40 w-full rounded-md' />
      </div>
    );
  }

  if (anyError) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-6 text-center'>
        <Building className='w-10 h-10 text-muted-foreground mb-3' />
        <p className='text-sm text-muted-foreground mb-4'>{anyError}</p>
        <Button
          variant='outline'
          size='sm'
          onClick={() => window.location.reload()}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!club) {
    return (
      <div className='p-6 text-center text-sm text-muted-foreground'>
        Chưa có dữ liệu câu lạc bộ.
      </div>
    );
  }

  return (
    <div className='mobile-container pb-24 px-4'>
      {/* Header */}
      <Card className={`${dark ? 'mobile-card-glass' : 'bg-white/80'} mb-4`}>
        <CardContent className='flex flex-col items-center p-5'>
          <div className='relative'>
            <Avatar className='w-24 h-24 mb-3 ring-2 ring-primary/30 shadow-md'>
              <AvatarImage src={club.logo_url} />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 text-white text-3xl font-bold'>
                {club.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {club.verified && (
              <div className='absolute -bottom-1 -right-1'>
                <span className='inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow'>
                  <CheckCircle2 className='mobile-icon-small' /> VERIFIED
                </span>
              </div>
            )}
          </div>
          <h2 className='text-2xl font-bold tracking-wide mobile-heading-primary'>
            {club.name}
          </h2>
          <div className='flex items-center gap-2 text-xs mt-1 text-muted-foreground'>
            {club.address && (
              <>
                <MapPin className='mobile-icon-small' />{' '}
                <span className='truncate max-w-[180px]'>{club.address}</span>
              </>
            )}
            {club.created_at && (
              <>
                <span>•</span>
                <Calendar className='mobile-icon-small' />
                <span>Since {new Date(club.created_at).getFullYear()}</span>
              </>
            )}
          </div>
          {club.phone && (
            <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
              <Phone className='mobile-icon-small' /> {club.phone}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-5'>
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

      {/* Quick Actions */}
      <div className='flex justify-center gap-2 mb-5'>
        <Button
          size='sm'
          variant='outline'
          onClick={onEditClub}
          className='gap-1 mobile-button-secondary'
        >
          <Edit3 className='mobile-icon-secondary' /> Sửa
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={onInviteMember}
          className='gap-1 mobile-button-secondary'
        >
          <UserPlus className='mobile-icon-secondary' /> Mời
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={onViewAchievements}
          className='gap-1 mobile-button-secondary'
        >
          <Trophy className='mobile-icon-secondary' /> Thành tích
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList
          className={`grid grid-cols-3 mb-3 ${dark ? 'bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm' : ''}`}
        >
          <TabsTrigger value='overview' className='mobile-tab-standard'>
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value='members' className='mobile-tab-standard'>
            Thành viên
          </TabsTrigger>
          <TabsTrigger value='activities' className='mobile-tab-standard'>
            Hoạt động
          </TabsTrigger>
        </TabsList>
        <TabsContent value='overview'>
          <Card className={dark ? 'mobile-card-glass' : ''}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base mobile-heading-secondary'>
                Giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-0 text-sm'>
              <p className='leading-relaxed'>
                {club.description || 'Chưa có mô tả.'}
              </p>
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div className='flex items-center gap-2'>
                  <Users className='mobile-icon-small text-emerald-500' />
                  <span>{club.member_count ?? members.length} thành viên</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Trophy className='mobile-icon-small text-purple-500' />
                  <span>{club.total_tournaments ?? 0} giải đấu</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Target className='mobile-icon-small text-blue-500' />
                  <span>{club.total_matches ?? 0} trận</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Star className='mobile-icon-small text-amber-500' />
                  <span>Uy tín: {club.trust_score ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab (refactored) */}
        <ClubMembersTab
          clubId={club.id}
          initialMembers={members}
          dark={dark}
          onMemberClick={handleMemberClick}
          onInvite={onInviteMember}
          currentUserId={userId}
          currentUserRole={currentUserRole}
        />

        {/* Activities Tab (refactored) */}
        <ClubActivitiesTab
          clubId={club.id}
          initialActivities={activities}
          dark={dark}
        />
      </Tabs>

      {/* Member Action Sheet */}
      <MemberActionSheet
        open={memberSheetOpen}
        onOpenChange={setMemberSheetOpen}
        member={selectedMember as any}
        onPromote={async () => {
          /* handled internally in sheet */
        }}
        onDemote={async () => {
          /* handled internally in sheet */
        }}
        onRemove={async () => {
          /* handled internally in sheet */
        }}
        onViewProfile={handleViewProfile}
        canManage={
          currentUserRole === 'owner' || currentUserRole === 'moderator'
        }
      />
    </div>
  );
};

export default ClubProfileMobile;
