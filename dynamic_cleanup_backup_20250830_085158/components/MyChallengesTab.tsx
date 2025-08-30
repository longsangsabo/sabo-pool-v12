import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Timer,
  Trophy,
  Star,
  MessageCircle,
} from 'lucide-react';
import MatchCompletionModal from './MatchCompletionModal';

interface Challenge {
  id: string;
  challenger_user_id: string;
  challenged_user_id: string;
  status: string;
  bet_points: number;
  message: string;
  location: string;
  scheduled_time: string;
  stake_type: string;
  stake_amount: number;
  expires_at: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  challenge_id: string;
  status: string;
  played_at: string;
  winner_id: string;
  score_player1: number;
  score_player2: number;
  profiles?: {
    full_name: string;
    avatar_url: string;
    current_rank: string;
  };
}

const MyChallengesTab = () => {
  const { user } = useAuth();
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    match: Match | null;
  }>({ isOpen: false, match: null });

  useEffect(() => {
    if (user) {
      fetchChallengesAndMatches();
    }
  }, [user]);

  const fetchChallengesAndMatches = async () => {
    if (!user) return;

    try {
      console.log('🔄 [MyChallengesTab] Fetching challenges for user:', user.id);
      
      // Fetch incoming challenges with challenger profile
      const { data: incoming, error: incomingError } = await (supabase as any)
        .from('challenges')
        .select('*')
        .eq('opponent_id', user.id)
        .in('status', ['pending', 'open'])
        .order('created_at', { ascending: false });

      if (incomingError) throw incomingError;

      console.log('📥 [MyChallengesTab] Incoming challenges raw:', incoming);

      // Fetch challenger profiles for incoming challenges
      const incomingWithProfiles = await Promise.all(
        (incoming || []).map(async challenge => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', challenge.challenger_id)
            .single();

          return {
            ...challenge,
            profiles: profile
              ? {
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                }
              : {
                  full_name: 'Unknown',
                  avatar_url: '',
                },
          };
        })
      );

      // Fetch outgoing challenges with opponent profile
      const { data: outgoing, error: outgoingError } = await (supabase as any)
        .from('challenges')
        .select('*')
        .eq('challenger_id', user.id)
        .order('created_at', { ascending: false });

      if (outgoingError) throw outgoingError;

      console.log('📤 [MyChallengesTab] Outgoing challenges raw:', outgoing);

      const outgoingWithProfiles = await Promise.all(
        (outgoing || []).map(async challenge => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', challenge.opponent_id)
            .single();

          return {
            ...challenge,
            profiles: profile
              ? {
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                }
              : {
                  full_name: 'Unknown',
                  avatar_url: '',
                },
          };
        })
      );

      // Mock data for upcoming and past matches since these tables don't exist yet
      const upcomingWithProfiles: Match[] = [];
      const pastWithProfiles: Match[] = [];

      console.log('✅ [MyChallengesTab] Final results:', {
        incoming: incomingWithProfiles.length,
        outgoing: outgoingWithProfiles.length
      });

      setIncomingChallenges(incomingWithProfiles as any);
      setOutgoingChallenges(outgoingWithProfiles as any);
      setUpcomingMatches(upcomingWithProfiles as Match[]);
      setPastMatches(pastWithProfiles as Match[]);
    } catch (error) {
      console.error('Error fetching challenges/matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeResponse = async (
    challengeId: string,
    status: 'accepted' | 'declined'
  ) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', challengeId);

      if (error) throw error;

      // If accepted, create a match
      if (status === 'accepted') {
        const challenge = incomingChallenges.find(c => c.id === challengeId);
        // Note: Match creation will be handled when match_system table is properly configured
        console.log('Challenge accepted, would create match for:', challengeId);
      }

      toast.success(
        status === 'accepted'
          ? 'Đã chấp nhận thách đấu!'
          : 'Đã từ chối thách đấu'
      );
      fetchChallengesAndMatches();
    } catch (error) {
      console.error('Error responding to challenge:', error);
      toast.error('Lỗi khi phản hồi thách đấu');
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Đã hết hạn';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} phút`;
    }
    return `${hours} giờ`;
  };

  const getStakeDisplay = (challenge: Challenge) => {
    if (challenge.stake_type === 'friendly') return 'Giao hữu';
    if (challenge.stake_type === 'drinks') return 'Cơm nước';
    return `${challenge.stake_amount?.toLocaleString()} VNĐ`;
  };

  const openMatchCompletion = (match: Match) => {
    setCompletionModal({ isOpen: true, match });
  };

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue='incoming' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='incoming' className='relative'>
            Đến
            {incomingChallenges.length > 0 && (
              <Badge className='ml-1 h-5 w-5 rounded-full p-0 text-xs bg-error-500'>
                {incomingChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='outgoing'>Đi</TabsTrigger>
          <TabsTrigger value='upcoming'>Sắp tới</TabsTrigger>
          <TabsTrigger value='history'>Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value='incoming' className='space-y-4'>
          {incomingChallenges.length === 0 ? (
            <Card className='bg-white'>
              <CardContent className='text-center py-8'>
                <MessageCircle className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-neutral-500'>Không có thách đấu nào</p>
              </CardContent>
            </Card>
          ) : (
            incomingChallenges.map(challenge => (
              <Card
                key={challenge.id}
                className='border-l-4 border-l-blue-500 bg-white'
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div className='flex items-center space-x-3'>
                      <Avatar>
                        <AvatarImage src={challenge.profiles?.avatar_url} />
                        <AvatarFallback>
                          {challenge.profiles?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-semibold'>
                          {challenge.profiles?.full_name}
                        </h3>
                        <p className='text-sm text-neutral-600'>
                          {challenge.bet_points} điểm
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge variant='outline' className='mb-2'>
                        <Clock className='w-3 h-3 mr-1' />
                        {getTimeRemaining(challenge.expires_at)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <strong>Cược:</strong> {getStakeDisplay(challenge)}
                    </div>
                    {challenge.scheduled_time && (
                      <div className='flex items-center'>
                        <Calendar className='w-3 h-3 mr-1' />
                        {new Date(challenge.scheduled_time).toLocaleDateString(
                          'vi-VN'
                        )}
                      </div>
                    )}
                    {challenge.location && (
                      <div className='flex items-center col-span-2'>
                        <MapPin className='w-3 h-3 mr-1' />
                        {challenge.location}
                      </div>
                    )}
                  </div>

                  {challenge.message && (
                    <div className='bg-neutral-50 p-3 rounded'>
                      <p className='message-text'>"{challenge.message}"</p>
                    </div>
                  )}

                  <div className='flex space-x-2'>
                    <Button
                      size='sm'
                      onClick={() =>
                        handleChallengeResponse(challenge.id, 'accepted')
                      }
                      className='flex-1'
                    >
                      <CheckCircle className='w-4 h-4 mr-1' />
                      Chấp nhận
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleChallengeResponse(challenge.id, 'declined')
                      }
                      className='flex-1'
                    >
                      <XCircle className='w-4 h-4 mr-1' />
                      Từ chối
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value='outgoing' className='space-y-4'>
          {outgoingChallenges.length === 0 ? (
            <Card className='bg-white'>
              <CardContent className='text-center py-8'>
                <Trophy className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-neutral-500'>Chưa gửi thách đấu nào</p>
              </CardContent>
            </Card>
          ) : (
            outgoingChallenges.map(challenge => (
              <Card key={challenge.id} className='bg-white'>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div className='flex items-center space-x-3'>
                      <Avatar>
                        <AvatarImage src={challenge.profiles?.avatar_url} />
                        <AvatarFallback>
                          {challenge.profiles?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-semibold'>
                          {challenge.profiles?.full_name}
                        </h3>
                        <p className='text-sm text-neutral-600'>
                          {challenge.bet_points} điểm
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        challenge.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : challenge.status === 'open'
                            ? 'bg-primary-100 text-primary-800'
                            : challenge.status === 'accepted'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-error-100 text-error-800'
                      }
                    >
                      {challenge.status === 'pending'
                        ? 'Chờ phản hồi'
                        : challenge.status === 'open'
                          ? 'Mở'
                          : challenge.status === 'accepted'
                            ? 'Đã chấp nhận'
                            : challenge.status === 'declined'
                              ? 'Đã từ chối'
                              : challenge.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='text-sm text-neutral-600'>
                    <p>
                      <strong>Cược:</strong> {getStakeDisplay(challenge)}
                    </p>
                    {challenge.scheduled_time && (
                      <p>
                        <strong>Thời gian:</strong>{' '}
                        {new Date(challenge.scheduled_time).toLocaleString(
                          'vi-VN'
                        )}
                      </p>
                    )}
                    {challenge.message && (
                      <p>
                        <strong>Lời nhắn:</strong> "{challenge.message}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value='upcoming' className='space-y-4'>
          {upcomingMatches.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-neutral-500'>Không có trận đấu sắp tới</p>
              </CardContent>
            </Card>
          ) : (
            upcomingMatches.map(match => {
              const opponent =
                match.player1_id === user?.id ? match.profiles : match.profiles;
              const isPastMatchTime =
                match.played_at && new Date(match.played_at) < new Date();

              return (
                <Card key={match.id} className='border-l-4 border-l-green-500'>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-center space-x-3'>
                        <Avatar>
                          <AvatarImage src={opponent?.avatar_url} />
                          <AvatarFallback>
                            {opponent?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className='font-semibold'>
                            {opponent?.full_name}
                          </h3>
                          <p className='text-sm text-neutral-600'>
                            {opponent?.current_rank}
                          </p>
                        </div>
                      </div>
                      {isPastMatchTime && (
                        <Badge className='bg-warning-100 text-orange-800'>
                          Cần xác nhận kết quả
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-4'>
                    {match.played_at && (
                      <div className='flex items-center text-sm'>
                        <Timer className='w-4 h-4 mr-2' />
                        {new Date(match.played_at).toLocaleString('vi-VN')}
                      </div>
                    )}

                    {isPastMatchTime && (
                      <Button
                        size='sm'
                        onClick={() => openMatchCompletion(match)}
                        className='w-full'
                      >
                        Xác nhận kết quả
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value='history' className='space-y-4'>
          {pastMatches.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <Star className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                <p className='text-neutral-500'>Chưa có lịch sử thi đấu</p>
              </CardContent>
            </Card>
          ) : (
            pastMatches.map(match => {
              const opponent =
                match.player1_id === user?.id ? match.profiles : match.profiles;
              const isWinner = match.winner_id === user?.id;

              return (
                <Card key={match.id}>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-center space-x-3'>
                        <Avatar>
                          <AvatarImage src={opponent?.avatar_url} />
                          <AvatarFallback>
                            {opponent?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className='font-semibold'>
                            {opponent?.full_name}
                          </h3>
                          <p className='text-sm text-neutral-600'>
                            {opponent?.current_rank}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          isWinner
                            ? 'bg-success-100 text-success-800'
                            : 'bg-error-100 text-error-800'
                        }
                      >
                        {isWinner ? 'Thắng' : 'Thua'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className='flex justify-between text-sm'>
                      <span>
                        Tỉ số: {match.score_player1} - {match.score_player2}
                      </span>
                      <span>
                        {new Date(match.played_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <MatchCompletionModal
        isOpen={completionModal.isOpen}
        onClose={() => setCompletionModal({ isOpen: false, match: null })}
        match={completionModal.match}
        onMatchCompleted={fetchChallengesAndMatches}
      />
    </>
  );
};

export default MyChallengesTab;
