import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserCheck,
  Bell,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Eye,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClubRole } from '@/hooks/useClubRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustScoreBadge from '@/components/TrustScoreBadge';

interface ClubMember {
  id: string;
  username: string;
  display_name: string;
  verified_rank: string | null;
  current_elo: number;
  phone: string;
  avatar_url?: string;
  verification_date?: string;
  verification_status: 'verified' | 'unverified';
  total_matches?: number;
  wins?: number;
  trust_score?: number;
  has_pending_request?: boolean;
  pending_request_rank?: string;
}

interface RankRequest {
  id: string;
  user_id: string;
  requested_rank: string;
  current_rank: string | null;
  evidence_url?: string | null;
  admin_notes?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  club_id?: string | null;
  profile?: {
    full_name: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface ClubNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const ClubMembersOptimized: React.FC = () => {
  const { user } = useAuth();
  const { clubProfile } = useClubRole();
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // States
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [rankRequests, setRankRequests] = useState<RankRequest[]>([]);
  const [notifications, setNotifications] = useState<ClubNotification[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  // Counts for badges
  const pendingRequestsCount = rankRequests.filter(
    r => r.status === 'pending'
  ).length;
  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user && clubProfile?.id) {
      loadAllData();
    }
  }, [user, clubProfile?.id]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadMembers(), loadRankRequests(), loadNotifications()]);
    setLoading(false);
  };

  const loadMembers = async () => {
    try {
      if (!clubProfile?.id) {
        setMembers([]);
        return;
      }

      // Get club members first
      // Show all members except those removed (status != 'removed' or status is null)
      const { data: clubMembersData, error: membersError } = await supabase
        .from('club_members')
        .select('user_id, status, join_date')
        .eq('club_id', clubProfile.id)
        .or('status.is.null,status.neq.removed');

      if (membersError) {
        console.error('Error loading club members:', membersError);
        // Fallback: load some sample profiles for demo
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(
            `
            user_id,
            full_name,
            display_name,
            verified_rank,
            elo,
            avatar_url,
            updated_at
          `
          )
          .limit(10);

        if (profilesError) throw profilesError;

        const sampleMembers =
          profilesData?.map(profile => ({
            id: profile.user_id,
            username: profile.display_name || profile.full_name || 'Unknown',
            display_name:
              profile.full_name || profile.display_name || 'Unknown',
            verified_rank: profile.verified_rank,
            current_elo: profile.elo || 1000,
            phone: '',
            avatar_url: profile.avatar_url,
            verification_date: profile.updated_at,
            verification_status: (profile.verified_rank
              ? 'verified'
              : 'unverified') as 'verified' | 'unverified',
            total_matches: 0,
            wins: 0,
            trust_score: 85.0,
            has_pending_request: false,
            pending_request_rank: undefined,
          })) || [];

        setMembers(sampleMembers as ClubMember[]);
        return;
      }

      // Get profiles for club members
      const userIds = clubMembersData?.map(m => m.user_id) || [];
      if (userIds.length === 0) {
        setMembers([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(
          `
          user_id,
          full_name,
          display_name,
          verified_rank,
          elo,
          avatar_url,
          updated_at
        `
        )
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Get pending rank requests for these members
      const { data: pendingRequests } = await supabase
        .from('rank_requests')
        .select('user_id, requested_rank')
        .in('user_id', userIds)
        .eq('status', 'pending')
        .eq('club_id', clubProfile?.id || '');

      const membersWithRequests =
        profilesData?.map(profile => {
          const pendingRequest = pendingRequests?.find(
            r => r.user_id === profile.user_id
          );
          const memberData = clubMembersData?.find(
            m => m.user_id === profile.user_id
          );

          return {
            id: profile.user_id,
            username: profile.display_name || profile.full_name || 'Unknown',
            display_name:
              profile.full_name || profile.display_name || 'Unknown',
            verified_rank: profile.verified_rank,
            current_elo: profile.elo || 1000,
            phone: '',
            avatar_url: profile.avatar_url,
            verification_date: memberData?.join_date || profile.updated_at,
            verification_status: (profile.verified_rank
              ? 'verified'
              : 'unverified') as 'verified' | 'unverified',
            total_matches: 0,
            wins: 0,
            trust_score: 85.0,
            has_pending_request: !!pendingRequest,
            pending_request_rank: pendingRequest?.requested_rank,
          } as ClubMember;
        }) || [];

      setMembers(membersWithRequests);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Lỗi khi tải danh sách thành viên');
    }
  };

  const loadRankRequests = async () => {
    if (!clubProfile?.id) return;

    try {
      const { data: requestsData, error } = await supabase
        .from('rank_requests')
        .select('*')
        .eq('club_id', clubProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const userIds = requestsData?.map(r => r.user_id).filter(Boolean) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, avatar_url')
        .in('user_id', userIds);

      const requestsWithProfiles =
        requestsData?.map(request => ({
          ...request,
          status: request.status as 'pending' | 'approved' | 'rejected',
          profile: profilesData?.find(p => p.user_id === request.user_id),
        })) || [];

      setRankRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error loading rank requests:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', [
          'rank_verification_request',
          'new_match',
          'member_promoted',
          'club_member_joined',
          'club_stats_update',
        ])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedNotifications = (data || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        created_at: n.created_at,
        is_read: n.is_read,
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleApproveRequest = async (
    requestId: string,
    requestedRank: string,
    userId: string
  ) => {
    setProcessing(requestId);
    try {
      console.log(
        'Starting approval process for user:',
        userId,
        'club:',
        clubProfile?.id
      );

      // Update rank request status
      const { error: requestError } = await supabase
        .from('rank_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestError) {
        console.error('Error updating rank request:', requestError);
        throw requestError;
      }
      console.log('✅ Rank request updated successfully');

      // Update user's verified rank
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verified_rank: requestedRank })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }
      console.log('✅ Profile verified_rank updated successfully');

      // Add user to club members if not already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('club_members')
        .select('id, status')
        .eq('club_id', clubProfile?.id)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing member:', checkError);
      }

      console.log('Existing member check result:', existingMember);

      if (!existingMember) {
        console.log('User is not a member yet, adding to club_members...');
        const { error: memberError, data: newMember } = await supabase
          .from('club_members')
          .insert({
            club_id: clubProfile?.id || '',
            user_id: userId,
            status: 'approved',
            join_date: new Date().toISOString(),
            membership_type: 'verified_member',
          })
          .select()
          .single();

        if (memberError) {
          console.error('Error adding user to club members:', memberError);
          // Don't throw error here, rank verification was successful
        } else {
          console.log('✅ User added to club_members successfully:', newMember);
        }
      } else {
        console.log('User is already a member, updating status...');
        // Update existing member status to approved if it wasn't
        const { error: updateMemberError, data: updatedMember } = await supabase
          .from('club_members')
          .update({
            status: 'approved',
            membership_type: 'verified_member',
          })
          .eq('id', existingMember.id)
          .select()
          .single();

        if (updateMemberError) {
          console.error('Error updating member status:', updateMemberError);
        } else {
          console.log('✅ Member status updated successfully:', updatedMember);
        }
      }

      toast.success(
        'Đã duyệt yêu cầu xác thực hạng và thêm vào danh sách thành viên'
      );
      await loadAllData(); // Reload all data
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Lỗi khi duyệt yêu cầu');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from('rank_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Đã từ chối yêu cầu xác thực hạng');
      await loadAllData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Lỗi khi từ chối yêu cầu');
    } finally {
      setProcessing(null);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredMembers = members.filter(
    member =>
      member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.verified_rank &&
        member.verified_rank.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingRequests = rankRequests.filter(r => r.status === 'pending');
  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='members' className='flex items-center gap-2'>
            <Users className='w-4 h-4' />
            Thành viên ({members.length})
          </TabsTrigger>
          <TabsTrigger value='verification' className='flex items-center gap-2'>
            <UserCheck className='w-4 h-4' />
            Xác thực hạng
            {pendingRequestsCount > 0 && (
              <Badge variant='destructive' className='ml-1 text-xs'>
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='flex items-center gap-2'
          >
            <Bell className='w-4 h-4' />
            Thông báo
            {unreadNotificationsCount > 0 && (
              <Badge variant='secondary' className='ml-1 text-xs'>
                {unreadNotificationsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value='members' className='mt-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Danh sách thành viên ({members.length})
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <div className='relative'>
                    <Search className='w-4 h-4 absolute left-3 top-3 text-muted-foreground' />
                    <Input
                      placeholder='Tìm kiếm thành viên...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10 w-64'
                    />
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={loadAllData}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4'>
                {filteredMembers.map(member => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-medium'>{member.display_name}</h4>
                          {member.has_pending_request && (
                            <Badge variant='outline' className='text-xs'>
                              <Clock className='w-3 h-3 mr-1' />
                              Chờ duyệt {member.pending_request_rank}
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <span>ELO: {member.current_elo}</span>
                          {member.verified_rank && (
                            <>
                              <span>•</span>
                              <Badge variant='secondary' className='text-xs'>
                                {member.verified_rank}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <TrustScoreBadge userId={member.id} />
                      <Button variant='outline' size='sm'>
                        <Eye className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value='verification' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCheck className='w-5 h-5' />
                Yêu cầu xác thực hạng ({pendingRequests.length} chờ duyệt)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4'>
                {pendingRequests.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <UserCheck className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <p>Không có yêu cầu xác thực hạng nào</p>
                  </div>
                ) : (
                  pendingRequests.map(request => (
                    <div key={request.id} className='p-4 border rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage src={request.profile?.avatar_url} />
                            <AvatarFallback>
                              {request.profile?.display_name
                                ?.charAt(0)
                                .toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className='font-medium'>
                              {request.profile?.full_name ||
                                request.profile?.display_name ||
                                'Unknown'}
                            </h4>
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <span>
                                Yêu cầu:{' '}
                                {request.current_rank || 'Chưa xác định'} →{' '}
                                {request.requested_rank}
                              </span>
                              <Badge variant='outline' className='text-xs'>
                                <Clock className='w-3 h-3 mr-1' />
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString('vi-VN')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processing === request.id}
                            className='text-red-600 hover:text-red-700'
                          >
                            <XCircle className='w-4 h-4' />
                            Từ chối
                          </Button>
                          <Button
                            size='sm'
                            onClick={() =>
                              handleApproveRequest(
                                request.id,
                                request.requested_rank,
                                request.user_id
                              )
                            }
                            disabled={processing === request.id}
                          >
                            <CheckCircle className='w-4 h-4' />
                            Duyệt
                          </Button>
                        </div>
                      </div>
                      {request.admin_notes && (
                        <div className='mt-3 p-3 bg-muted rounded-lg'>
                          <p className='text-sm text-muted-foreground'>
                            <strong>Ghi chú:</strong> {request.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value='notifications' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='w-5 h-5' />
                Thông báo gần đây ({recentNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4'>
                {recentNotifications.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <Bell className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <p>Không có thông báo nào</p>
                  </div>
                ) : (
                  recentNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        !notification.is_read
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() =>
                        !notification.is_read &&
                        markNotificationAsRead(notification.id)
                      }
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-medium'>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <Badge variant='secondary' className='text-xs'>
                                Mới
                              </Badge>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {notification.message}
                          </p>
                          <p className='text-xs text-muted-foreground mt-2'>
                            {new Date(notification.created_at).toLocaleString(
                              'vi-VN'
                            )}
                          </p>
                        </div>
                        <div className='ml-4'>
                          {notification.type ===
                            'rank_verification_request' && (
                            <UserCheck className='w-5 h-5 text-blue-500' />
                          )}
                          {notification.type === 'new_match' && (
                            <Trophy className='w-5 h-5 text-green-500' />
                          )}
                          {notification.type === 'club_member_joined' && (
                            <Users className='w-5 h-5 text-purple-500' />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubMembersOptimized;
