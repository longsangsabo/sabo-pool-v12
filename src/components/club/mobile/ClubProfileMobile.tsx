import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Trophy, Edit3, UserPlus, Activity, Star, Calendar, Phone, MapPin, Loader2, Target } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';

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
const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-muted/60 ${className}`} />
);

// Activity icon map
const activityIconMap: Record<string, React.ElementType> = {
  match: Target,
  tournament: Trophy,
  member_joined: Users,
  default: Activity,
};

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

  // Fetch club data if only ID provided
  useEffect(() => {
    const shouldFetch = (!initialClub && clubId) || (!club && clubId);
    if (!shouldFetch) return;
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const { data: clubData, error: clubErr } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', clubId)
          .maybeSingle();
        if (clubErr) throw clubErr;
        if (isMounted && clubData) {
          setClub({
            id: clubData.id,
            name: clubData.name,
            logo_url: clubData.logo_url,
            address: clubData.address,
            member_count: clubData.member_count,
            trust_score: clubData.trust_score,
            verified: clubData.status === 'active',
            description: clubData.description,
            phone: clubData.contact_info,
            created_at: clubData.created_at,
            total_matches: clubData.total_matches,
            total_tournaments: clubData.total_tournaments,
          });
        }
        // Fetch members (simplified)
        const { data: membersData } = await supabase
          .from('club_members')
          .select('user_id, profiles(full_name, display_name, avatar_url, verified_rank)')
          .eq('club_id', clubId)
          .limit(20);
        if (isMounted && membersData) {
          const mapped = membersData.map((m: any) => ({
            id: m.user_id,
            name: m.profiles?.display_name || m.profiles?.full_name || 'Người chơi',
            avatar_url: m.profiles?.avatar_url,
            rank: m.profiles?.verified_rank,
            status: 'Thành viên',
          }));
          setMembers(mapped);
        }
      } catch (e: any) {
        console.error(e);
        if (isMounted) setFetchError('Không thể tải dữ liệu club.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [clubId, initialClub]);

  const dark = theme === 'dark';

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

  if (loadingOverride ?? loading) {
    return (
      <div className='min-h-screen p-4 space-y-4'>
        <div className='flex flex-col items-center gap-4'>
          <SkeletonBlock className='w-24 h-24 rounded-full' />
          <SkeletonBlock className='w-40 h-6' />
          <SkeletonBlock className='w-64 h-4' />
        </div>
        <div className='grid grid-cols-4 gap-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className='h-16 rounded-lg' />
          ))}
        </div>
        <SkeletonBlock className='h-10 w-full rounded-md' />
        <SkeletonBlock className='h-40 w-full rounded-md' />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-6 text-center'>
        <Building className='w-10 h-10 text-muted-foreground mb-3' />
        <p className='text-sm text-muted-foreground mb-4'>{fetchError}</p>
        <Button variant='outline' size='sm' onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  if (!club) {
    return (
      <div className='p-6 text-center text-sm text-muted-foreground'>Chưa có dữ liệu câu lạc bộ.</div>
    );
  }

  return (
    <div className='min-h-screen bg-background pb-24 px-4'>
      {/* Header */}
      <Card className={`${dark ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-sm' : 'bg-white/80 border-slate-200'} mb-4`}>
        <CardContent className='flex flex-col items-center p-5'>
          <div className='relative'>
            <Avatar className='w-24 h-24 mb-3 ring-2 ring-primary/30 shadow-md'>
              <AvatarImage src={club.logo_url} />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 text-white text-3xl font-bold'>
                {club.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {club.verified && (
              <Badge className='absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] tracking-wide shadow'>VERIFIED</Badge>
            )}
          </div>
          <h2 className={`text-2xl font-bold tracking-wide ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{club.name}</h2>
          <div className='flex items-center gap-2 text-xs mt-1 text-muted-foreground'>
            {club.address && <><MapPin className='w-3 h-3' /> <span className='truncate max-w-[180px]'>{club.address}</span></>}
            {club.created_at && <>
              <span>•</span>
              <Calendar className='w-3 h-3' />
              <span>Since {new Date(club.created_at).getFullYear()}</span>
            </>}
          </div>
          {club.phone && (
            <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
              <Phone className='w-3 h-3' /> {club.phone}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-5'>
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-xl border p-3 flex items-center gap-3 group ${
                dark
                  ? 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              } transition-colors`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-inner`}>                
                <Icon className={`w-5 h-5 ${s.accent}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{s.label}</p>
                <p className={`text-lg font-semibold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className='flex justify-center gap-2 mb-5'>
        <Button size='sm' variant='outline' onClick={onEditClub} className='gap-1'>
          <Edit3 className='w-4 h-4' /> Sửa
        </Button>
        <Button size='sm' variant='outline' onClick={onInviteMember} className='gap-1'>
          <UserPlus className='w-4 h-4' /> Mời
        </Button>
        <Button size='sm' variant='outline' onClick={onViewAchievements} className='gap-1'>
            <Trophy className='w-4 h-4' /> Thành tích
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className={`grid grid-cols-3 mb-3 ${dark ? 'bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm' : ''}`}>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='members'>Thành viên</TabsTrigger>
            <TabsTrigger value='activities'>Hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value='overview'>
          <Card className={dark ? 'bg-slate-900/50 border-slate-700/50 backdrop-blur-sm' : ''}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-0 text-sm'>
              <p className='leading-relaxed'>{club.description || 'Chưa có mô tả.'}</p>
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div className='flex items-center gap-2'><Users className='w-3 h-3 text-emerald-500' /><span>{club.member_count ?? members.length} thành viên</span></div>
                <div className='flex items-center gap-2'><Trophy className='w-3 h-3 text-purple-500' /><span>{club.total_tournaments ?? 0} giải đấu</span></div>
                <div className='flex items-center gap-2'><Target className='w-3 h-3 text-blue-500' /><span>{club.total_matches ?? 0} trận</span></div>
                <div className='flex items-center gap-2'><Star className='w-3 h-3 text-amber-500' /><span>Uy tín: {club.trust_score ?? 0}</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='members'>
          <Card className={dark ? 'bg-slate-900/50 border-slate-700/50 backdrop-blur-sm' : ''}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Thành viên ({members.length})</CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                {members.length === 0 && (
                  <div className='text-sm text-muted-foreground py-4 text-center'>Chưa có thành viên.</div>
                )}
                {members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => onMemberClick?.(m.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${
                      dark
                        ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Avatar className='w-11 h-11'>
                      <AvatarImage src={m.avatar_url} />
                      <AvatarFallback>{m.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium truncate'>{m.name}</div>
                      <div className='text-[11px] text-muted-foreground'>Rank: {m.rank || 'N/A'}</div>
                    </div>
                    <Badge variant='secondary' className='text-[10px] px-2 py-0.5'>
                      {m.status || 'Thành viên'}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activities'>
          <Card className={dark ? 'bg-slate-900/50 border-slate-700/50 backdrop-blur-sm' : ''}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                {activities.length === 0 && (
                  <div className='text-sm text-muted-foreground py-4 text-center'>Chưa có hoạt động.</div>
                )}
                {activities.map(a => {
                  const Icon = activityIconMap[a.type] || activityIconMap.default;
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border text-sm ${
                        dark
                          ? 'bg-slate-800/40 border-slate-700/60'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className='w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600'>
                        <Icon className='w-4 h-4 text-blue-500' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='truncate'>{a.content}</p>
                        <p className='text-[11px] text-muted-foreground mt-0.5'>
                          {new Date(a.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubProfileMobile;
