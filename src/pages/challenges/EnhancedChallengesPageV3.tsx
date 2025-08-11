import React, { useState, useRef } from 'react';
import {
  RefreshCw,
  Plus,
  Target,
  Zap,
  Trophy,
  Star,
  Crown,
  Flame,
  Users,
  TrendingUp,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedChallengesV3 } from '@/hooks/useEnhancedChallengesV3';
import { EnhancedCommunityTab } from './components/tabs/EnhancedCommunityTab';
import { EnhancedMyTab } from './components/tabs/EnhancedMyTab';
import ImprovedCreateChallengeModal from '@/components/modals/ImprovedCreateChallengeModal';
import { supabase } from '@/integrations/supabase/client';

const EnhancedChallengesPageV3: React.FC = () => {
  const { user } = useAuth();
  const {
    // Core data
    challenges,
    loading,
    error,
    
    // Community challenges
    communityKeo,
    communityLive,
    communitySapToi,
    communityXong,
    
    // My challenges
    myDoiDoiThu,
    mySapToi,
    myHoanThanh,
    
    // Actions
    fetchChallenges,
    acceptChallenge,
    autoExpireChallenges,
  } = useEnhancedChallengesV3();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [userStats, setUserStats] = useState({
    totalChallenges: 0,
    winStreak: 0,
    eloRating: 1000,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCreateChallenge = () => {
    setShowCreateChallengeModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchChallenges();
      const randomPrompts = [
        'Dữ liệu mới nhất đã sẵn sàng! 🚀',
        'Kèo hot vừa được cập nhật! 🔥',
        'Sàn đấu đã được làm mới! ⚡',
        'Cao thủ mới đã xuất hiện! 🎯',
      ];
      const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
      toast.success(randomPrompt);
    } catch (error) {
      toast.error('Lỗi khi làm mới dữ liệu');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    setIsJoining(true);
    try {
      await acceptChallenge(challengeId);
      toast.success('🎯 Kèo ngon đã sẵn sàng! Chuẩn bị đối đầu nào! 🔥');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tham gia thách đấu';
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelChallenge = async (challengeId: string) => {
    try {
      console.log('Attempting to cancel challenge:', challengeId);
      console.log('Current user ID:', user.id);

      // First, check if the challenge exists and belongs to the user
      const { data: challengeCheck, error: checkError } = await supabase
        .from('challenges')
        .select('id, challenger_id, status')
        .eq('id', challengeId)
        .single();

      console.log('Challenge check:', { challengeCheck, checkError });

      if (checkError || !challengeCheck) {
        throw new Error('Không tìm thấy thách đấu');
      }

      if (challengeCheck.challenger_id !== user.id) {
        throw new Error('Bạn chỉ có thể hủy thách đấu do chính mình tạo');
      }

      if (!['pending', 'accepted'].includes(challengeCheck.status)) {
        throw new Error(`Không thể hủy thách đấu đang ở trạng thái "${challengeCheck.status}"`);
      }

      // Update challenge status to declined (cancelled equivalent)
      const { data, error } = await supabase
        .from('challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId)
        .select();

      console.log('Supabase update response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Challenge cancelled successfully:', data);

      // Refresh challenges to update UI
      await fetchChallenges();
      
      toast.success('🚫 Đã hủy thách đấu thành công!');
    } catch (error) {
      console.error('Error cancelling challenge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const getCommunityStats = () => ({
    keo: communityKeo.length,
    live: communityLive.length,
    sapToi: communitySapToi.length,
    xong: communityXong.length,
  });

  const getMyStats = () => ({
    doiDoiThu: myDoiDoiThu.length,
    sapToi: mySapToi.length,
    hoanThanh: myHoanThanh.length,
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu thách đấu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="text-destructive mb-4">❌ Lỗi tải dữ liệu</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Chưa đăng nhập</h2>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để xem thách đấu
          </p>
        </div>
      </div>
    );
  }

  const communityStats = getCommunityStats();
  const myStats = getMyStats();

  return (
    <div className="min-h-screen bg-black/80 dark:bg-black/90 backdrop-blur-sm">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/70 dark:bg-black/80 backdrop-blur-md border-b border-gray-600/50 dark:border-gray-500/20">
        <div className="p-4 space-y-4">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2"
            >
              🏆 THÁCH ĐẤU 🎯
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="text- font-medium">
                Hệ thống mới - Trải nghiệm tối ưu! ⚡
              </span>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="rounded-full bg-black/60 dark:bg-black/80 backdrop-blur-sm border-gray-600 dark:border-gray-500"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Làm mới
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                rotate: [0, -1, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                onClick={handleCreateChallenge}
              >
                <Target className="w-4 h-4 mr-2" />
                Tạo Thách Đấu 🎯
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollRef} className="p-4">
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm border border-gray-600/50 dark:border-gray-500/20">
            <TabsTrigger value="community" className="relative group">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500 group-data-[state=active]:text-blue-600" />
                <span className="text-blue-600 group-data-[state=active]:text-blue-700 font-medium">Cộng đồng</span>
              </span>
              {(communityStats.keo + communityStats.live + communityStats.sapToi + communityStats.xong) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {communityStats.keo + communityStats.live + communityStats.sapToi + communityStats.xong}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="my" className="relative group">
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500 group-data-[state=active]:text-amber-600" />
                <span className="text-amber-600 group-data-[state=active]:text-amber-700 font-medium">Của tôi</span>
              </span>
              {(myStats.doiDoiThu + myStats.sapToi + myStats.hoanThanh) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {myStats.doiDoiThu + myStats.sapToi + myStats.hoanThanh}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community">
            <EnhancedCommunityTab
              keoData={communityKeo}
              liveData={communityLive}
              sapToiData={communitySapToi}
              xongData={communityXong}
              currentUserId={user.id}
              onJoinChallenge={handleJoinChallenge}
              onCancelChallenge={handleCancelChallenge}
              isJoining={isJoining}
            />
          </TabsContent>

          <TabsContent value="my">
            <EnhancedMyTab
              doiDoiThuData={myDoiDoiThu}
              sapToiData={mySapToi}
              hoanThanhData={myHoanThanh}
              currentUserId={user.id}
              onCancelChallenge={handleCancelChallenge}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-3">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        >
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white border-0"
            onClick={handleCreateChallenge}
          >
            <Flame className="w-6 h-6 mr-2 animate-pulse" />
            KHIÊU CHIẾN NGAY
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shadow-lg bg-black/70 dark:bg-black/90 backdrop-blur-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Hỗ trợ
          </Button>
        </motion.div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="sticky bottom-0 bg-black/60 backdrop-blur-md border-t border-gray-600/30 p-4">
        <div className="flex justify-around text-center">
          <motion.div whileHover={{ scale: 1.1 }}>
            <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
              <Target className="w-4 h-4" />
              {challenges.length}
            </p>
            <p className="text-xs text-muted-foreground">Tổng kèo</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <p className="text-lg font-bold text-red-500 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {communityStats.live}
            </p>
            <p className="text-xs text-muted-foreground">Đang live</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <p className="text-lg font-bold text-green-500 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              {myStats.hoanThanh}
            </p>
            <p className="text-xs text-muted-foreground">Đã xong</p>
          </motion.div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      <ImprovedCreateChallengeModal
        isOpen={showCreateChallengeModal}
        onClose={() => setShowCreateChallengeModal(false)}
        onChallengeCreated={() => {
          fetchChallenges();
          setShowCreateChallengeModal(false);
        }}
      />
    </div>
  );
};

export default EnhancedChallengesPageV3;
