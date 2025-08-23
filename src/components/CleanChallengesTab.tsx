import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Users, Clock, Trophy, Target, Shield, Check, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CleanChallengesTabProps {
  clubId?: string;
}

interface Challenge {
  id: string;
  status: string;
  challenger_score?: number;
  opponent_score?: number;
  score_challenger?: number;
  score_opponent?: number;
  final_score_challenger?: number;
  final_score_opponent?: number;
  bet_points: number;
  race_to: number;
  created_at: string;
  scheduled_time?: string;
  club_confirmed?: boolean;
  club_note?: string;
  challenger_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  opponent_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

const CleanChallengesTab: React.FC<CleanChallengesTabProps> = ({ clubId }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [note, setNote] = useState<{ [key: string]: string }>({});

  // Process SPA transfer when club approves challenge
  const processSpaTransfer = async (challengeData: any) => {
    try {
      console.log('🎯 Processing SPA transfer for challenge:', challengeData.id);

      const {
        id: challengeId,
        challenger_id,
        opponent_id,
        winner_id,
        bet_points,
        challenger_spa_points,
        opponent_spa_points
      } = challengeData;

      if (!winner_id) {
        console.log('❌ No winner_id found in challenge data');
        return false;
      }

      if (!bet_points) {
        console.log('⚠️ No bet_points, using default values');
      }

      // Calculate SPA changes
      const challengerIsWinner = winner_id === challenger_id;
      const winnerAmount = bet_points || 50;  // Default 50 if no bet_points
      const loserAmount = bet_points || 25;   // Default 25 if no bet_points

      console.log('📊 SPA Transfer:');
      console.log('   Winner gets:', '+' + winnerAmount);
      console.log('   Loser loses:', '-' + loserAmount);
      console.log('   Challenger is winner:', challengerIsWinner);

      // Use correct functions for add/subtract
      if (challengerIsWinner) {
        // Challenger wins - ADD points to challenger, SUBTRACT from opponent
        const { data: challengerResult, error: challengerError } = await supabase
          .rpc('update_spa_points', {
            p_user_id: challenger_id,
            p_points: winnerAmount,
            p_source_type: 'challenge_win',
            p_description: `Thắng thách đấu ${bet_points} điểm`,
            p_reference_id: challengeId
          });

        if (challengerError) {
          console.error('❌ Error updating challenger SPA:', challengerError);
          return false;
        }
        console.log('✅ Challenger (winner) SPA updated:', challengerResult);

        // Subtract from opponent using correct function
        const { data: opponentResult, error: opponentError } = await supabase
          .rpc('subtract_spa_points', {
            p_user_id: opponent_id,
            p_points_to_subtract: loserAmount
          });

        if (opponentError) {
          console.error('❌ Error updating opponent SPA:', opponentError);
          return false;
        }
        console.log('✅ Opponent (loser) SPA updated:', opponentResult);

      } else {
        // Opponent wins - ADD points to opponent, SUBTRACT from challenger
        const { data: opponentResult, error: opponentError } = await supabase
          .rpc('update_spa_points', {
            p_user_id: opponent_id,
            p_points: winnerAmount,
            p_source_type: 'challenge_win',
            p_description: `Thắng thách đấu ${bet_points} điểm`,
            p_reference_id: challengeId
          });

        if (opponentError) {
          console.error('❌ Error updating opponent SPA:', opponentError);
          return false;
        }
        console.log('✅ Opponent (winner) SPA updated:', opponentResult);

        // Subtract from challenger using correct function
        const { data: challengerResult, error: challengerError } = await supabase
          .rpc('subtract_spa_points', {
            p_user_id: challenger_id,
            p_points_to_subtract: loserAmount
          });

        if (challengerError) {
          console.error('❌ Error updating challenger SPA:', challengerError);
          return false;
        }
        console.log('✅ Challenger (loser) SPA updated:', challengerResult);
      }

      console.log('✅ SPA transfer completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Exception in SPA transfer:', error);
      return false;
    }
  };

  // Club approval function with SPA processing
  const handleClubApproval = async (challengeId: string, approved: boolean) => {
    // Prevent double processing
    if (approving === challengeId) {
      console.log('⚠️ Already processing this challenge, ignoring duplicate request');
      return;
    }

    try {
      setApproving(challengeId);
      console.log(`🎯 Club approval: ${approved ? 'APPROVED' : 'REJECTED'} challenge ${challengeId}`);

      // Update challenge status directly
      const { error } = await supabase
        .from('challenges')
        .update({
          club_confirmed: approved,
          club_confirmed_at: new Date().toISOString(),
          club_note: note[challengeId] || '',
          // Don't change status if already completed - just update confirmation
          ...(approved ? {} : { status: 'rejected' })
        })
        .eq('id', challengeId);

      if (error) {
        console.error('❌ Club approval error:', error);
        toast.error(`Lỗi: ${error.message}`);
        return;
      }

      // If approved, process SPA transfer and notifications
      if (approved) {
        console.log('🎉 Challenge approved - processing SPA transfer...');
        
        // Get the challenge details for SPA processing and notifications
        const { data: challengeForSpa } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (challengeForSpa && challengeForSpa.winner_id) {
          console.log('Winner ID:', challengeForSpa.winner_id.substring(0, 8) + '...');
          console.log('Bet Points:', challengeForSpa.bet_points);
          
          // Process SPA transfer (ONLY ONCE)
          const spaSuccess = await processSpaTransfer(challengeForSpa);
          if (!spaSuccess) {
            toast.error('Lỗi xử lý điểm SPA');
            console.error('❌ SPA transfer failed');
          } else {
            toast.success('✅ Đã xử lý điểm SPA thành công!');
          }

          // Create notifications for winner and loser
          const notifications = [];
          
          // Winner notification
          notifications.push({
            user_id: challengeForSpa.winner_id,
            title: '🏆 Thắng thách đấu!',
            message: `Bạn đã thắng thách đấu với tỷ số ${challengeForSpa.challenger_score}-${challengeForSpa.opponent_score}. Đã được CLB xác nhận.`,
            type: 'challenge_win'
          });
          
          // Loser notification
          const loserId = challengeForSpa.winner_id === challengeForSpa.challenger_id 
            ? challengeForSpa.opponent_id 
            : challengeForSpa.challenger_id;
          
          notifications.push({
            user_id: loserId,
            title: '📊 Kết quả thách đấu',
            message: `Thách đấu đã kết thúc với tỷ số ${challengeForSpa.challenger_score}-${challengeForSpa.opponent_score}. Đã được CLB xác nhận.`,
            type: 'challenge_result'
          });
          
          // Insert notifications
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);
            
          if (notificationError) {
            console.warn('Notification error:', notificationError);
          } else {
            console.log('✅ Notifications sent to players');
          }
          
          console.log('🎉 Challenge processing completed successfully!');
          
        } else {
          console.log('⚠️ No winner_id found, skipping SPA transfer and notifications');
        }
      }

      // Refresh challenges
      await fetchChallenges();
      
      // Clear note
      setNote(prev => ({ ...prev, [challengeId]: '' }));
      
      toast.success(
        approved 
          ? '✅ Đã phê duyệt kết quả thách đấu!' 
          : '❌ Đã từ chối kết quả thách đấu!'
      );

    } catch (error) {
      console.error('❌ Exception in club approval:', error);
      toast.error('Có lỗi xảy ra khi xử lý phê duyệt');
    } finally {
      setApproving(null);
    }
  };

  // Fetch all challenges - simple and clean
  const fetchChallenges = async () => {
    try {
      // console.log('🔄 Fetching challenges...');
      
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            full_name,
            avatar_url
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching challenges:', error);
        return;
      }

      // console.log('✅ Fetched challenges:', data?.length || 0);
      // console.log('📋 Challenges data:', data);
      setChallenges(data || []);
    } catch (error) {
      console.error('❌ Exception fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Simple status filtering
  const pendingChallenges = challenges.filter(c => 
    c.status === 'pending' || c.status === 'open'
  );
  
  const activeChallenges = challenges.filter(c => 
    c.status === 'ongoing' || c.status === 'accepted'
  );
  
  const pendingApproval = challenges.filter(c => 
    c.status === 'completed' && c.club_confirmed === false
  );
  
  const completedChallenges = challenges.filter(c => 
    c.status === 'completed' && c.club_confirmed === true
  );

  // console.log('📊 Challenge counts:', {
  //   total: challenges.length,
  //   pending: pendingChallenges.length,
  //   active: activeChallenges.length,
  //   pendingApproval: pendingApproval.length,
  //   completed: completedChallenges.length
  // });

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    // Get scores from multiple possible column names
    const challengerScore = challenge.challenger_score ?? challenge.score_challenger ?? challenge.final_score_challenger;
    const opponentScore = challenge.opponent_score ?? challenge.score_opponent ?? challenge.final_score_opponent;
    
    const needsApproval = challenge.status === 'completed' && 
                         challengerScore !== null && challengerScore !== undefined &&
                         opponentScore !== null && opponentScore !== undefined &&
                         challenge.club_confirmed === false;

    return (
      <Card className="p-4 border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">
                {challenge.challenger_profile?.full_name || 'Player 1'} vs{' '}
                {challenge.opponent_profile?.full_name || 'Player 2'}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {challenge.status}
                </Badge>
                {challenge.club_confirmed && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    Đã phê duyệt
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {challenge.bet_points} points
            </div>
          </div>
          
          {/* Tỷ số hiển thị nổi bật cho tất cả trận có điểm */}
          {challengerScore !== null && challengerScore !== undefined && 
           opponentScore !== null && opponentScore !== undefined && (
            <div className={`text-sm font-mono p-3 rounded-lg border-2 ${
              challenge.status === 'completed' 
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
                : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  {challenge.challenger_profile?.full_name || 'Player 1'}
                </span>
                <span className="text-lg font-bold mx-4">
                  {challengerScore} - {opponentScore}
                </span>
                <span className="font-semibold">
                  {challenge.opponent_profile?.full_name || 'Player 2'}
                </span>
              </div>
              {challenge.status === 'completed' && (
                <div className="text-center text-xs mt-1 opacity-75">
                  ✅ Trận đấu đã hoàn thành
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Race to {challenge.race_to} | {new Date(challenge.created_at).toLocaleDateString('vi-VN')}
          </div>

          {challenge.club_note && (
            <div className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded border-l-2 border-blue-200">
              <strong>Ghi chú:</strong> {challenge.club_note}
            </div>
          )}

          {/* Club Approval Section */}
          {needsApproval && (
            <div className="border-t pt-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <Shield className="w-4 h-4" />
                Chờ phê duyệt kết quả
              </div>
              
              <Textarea
                placeholder="Ghi chú (tùy chọn)..."
                value={note[challenge.id] || ''}
                onChange={(e) => setNote(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                className="text-sm"
                rows={2}
              />
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleClubApproval(challenge.id, true)}
                  disabled={approving === challenge.id}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                  {approving === challenge.id ? 'Đang xử lý...' : 'Phê duyệt'}
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleClubApproval(challenge.id, false)}
                  disabled={approving === challenge.id}
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Từ chối
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const TabSection = ({ 
    title, 
    icon: Icon, 
    challenges: tabChallenges, 
    color 
  }: { 
    title: string; 
    icon: any; 
    challenges: Challenge[]; 
    color: string;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">{tabChallenges.length}</Badge>
      </div>
      
      {tabChallenges.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon className={`w-12 h-12 ${color} mx-auto mb-4 opacity-50`} />
          <p className="text-muted-foreground">Chưa có thách đấu</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tabChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Đang tải...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold">Club Challenges</h2>
        <Badge variant="outline">Total: {challenges.length}</Badge>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Chờ phê duyệt ({pendingApproval.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Đang diễn ra ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Sắp tới ({pendingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Hoàn thành ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <TabSection
            title="Chờ phê duyệt"
            icon={Shield}
            challenges={pendingApproval}
            color="text-purple-500"
          />
        </TabsContent>

        <TabsContent value="active">
          <TabSection
            title="Đang diễn ra"
            icon={Target}
            challenges={activeChallenges}
            color="text-red-500"
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <TabSection
            title="Sắp tới"
            icon={Clock}
            challenges={pendingChallenges}
            color="text-blue-500"
          />
        </TabsContent>

        <TabsContent value="completed">
          <TabSection
            title="Hoàn thành"
            icon={Trophy}
            challenges={completedChallenges}
            color="text-green-500"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CleanChallengesTab;
