import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
 Plus,
 Filter,
 Search,
 Users,
 Trophy,
 MapPin,
 Bell,
 RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

import TournamentFeedCard from '@/components/TournamentFeedCard';
import EnhancedChallengeCard from '@/components/challenges/EnhancedChallengeCard';
import { EnhancedAuthFlow } from '@/components/auth/EnhancedAuthFlow';
import SocialFeedCard from '@/components/SocialFeedCard';
import CreatePostModal from '@/components/CreatePostModal';
import { useTournaments } from '@/hooks/useTournaments';
import { useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/hooks/useAuth';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { toast } from 'sonner';

const FeedPage = () => {
 const { user } = useAuth();
 const { tournaments, joinTournament } = useTournaments();
 const { receivedChallenges } = useChallenges();
 const { userLocation, requestLocationPermission } = useUserLocation();
 const {
  feedPosts,
  isConnected,
  handleLike,
  handleComment,
  handleShare,
  handleChallenge,
  refreshFeed,
  createPost,
 } = useRealtimeFeed();
 const [showAuthFlow, setShowAuthFlow] = useState(false);
 const [activeTab, setActiveTab] = useState('social');
 const [searchQuery, setSearchQuery] = useState('');
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [isRefreshing, setIsRefreshing] = useState(false);

 // Show auth flow if user is not logged in
 useEffect(() => {
  if (!user) {
   setShowAuthFlow(true);
  }
 }, [user]);

 const handleJoinTournament = async (tournamentId: string) => {
  if (!user) {
   setShowAuthFlow(true);
   return;
  }

  try {
   await joinTournament.mutateAsync({ tournamentId });
  } catch (error) {
   console.error('Error joining tournament:', error);
  }
 };

 const handleChallengeAction = (action: string, challengeId: string) => {
  toast.success(
   `Thách đấu đã được ${action === 'accepted' ? 'chấp nhận' : 'từ chối'}`
  );
 };

 const handleRefresh = async () => {
  setIsRefreshing(true);
  await refreshFeed();
  setIsRefreshing(false);
  toast.success('Đã làm mới feed!');
 };

 const handleCreatePost = async (content: string) => {
  await createPost(content);
  toast.success('Đã đăng bài thành công!');
 };

 const filteredTournaments = tournaments.filter(
  tournament =>
   tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   tournament.description?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const filteredChallenges = receivedChallenges.filter(challenge =>
  challenge.challenger_profile?.full_name
   ?.toLowerCase()
   .includes(searchQuery.toLowerCase())
 );

 if (!user) {
  return (
   <>
    {showAuthFlow && (
     <EnhancedAuthFlow
      onSuccess={() => {
       setShowAuthFlow(false);
       toast.success('Chào mừng bạn đến với SABO! 🎱');
      }}
     />
    )}
    <div className='flex items-center justify-center min-h-screen bg-neutral-50'>
     <div className='text-center p-8'>
      <h1 className='text-heading-bold mb-4'>Chào mừng đến SABO</h1>
      <p className='text-neutral-600 mb-6'>Vui lòng đăng nhập để tiếp tục</p>
      <Button onClick={() => setShowAuthFlow(true)}>Đăng nhập</Button>
     </div>
    </div>
   </>
  );
 }

 return (
  <>
   <Helmet>
    <title>Bảng Tin Cộng Đồng - SABO Billiards</title>
    <meta
     name='description'
     content='Theo dõi hoạt động, giải đấu và thách đấu từ cộng đồng bi-a SABO'
    />
   </Helmet>

   <div className='bg-neutral-50 min-h-screen'>
    {/* Header với Tabs */}
    <div className='sticky top-0 bg-white border-b border-neutral-200 z-10 shadow-sm'>
     <div className='px-4 py-3'>
      <h1 className='text-title font-bold text-neutral-900 mb-3'>Feed</h1>
      <Tabs
       value={activeTab}
       onValueChange={setActiveTab}
       className='w-full'
      >
       <TabsList className='grid w-full grid-cols-4 bg-neutral-100 rounded-lg p-1'>
        <TabsTrigger
         value='all'
         className='text-caption data-[state=active]:bg-white data-[state=active]:shadow-sm'
        >
         Tất cả
        </TabsTrigger>
        <TabsTrigger
         value='tournaments'
         className='text-caption data-[state=active]:bg-white data-[state=active]:shadow-sm'
        >
         Giải đấu
        </TabsTrigger>
        <TabsTrigger
         value='challenges'
         className='text-caption data-[state=active]:bg-white data-[state=active]:shadow-sm'
        >
         Thách đấu
        </TabsTrigger>
        <TabsTrigger
         value='social'
         className='text-caption data-[state=active]:bg-white data-[state=active]:shadow-sm'
        >
         Cộng đồng
        </TabsTrigger>
       </TabsList>
      </Tabs>
     </div>
    </div>

    {/* Content */}
    <div className='p-4 space-y-4'>
     <TabsContent value='social' className='mt-0 space-y-4'>
      {feedPosts.length === 0 ? (
       <div className='text-center py-12'>
        <div className='text-6xl mb-4'>👥</div>
        <h3 className='text-body-large-semibold text-neutral-900 mb-2'>
         Chưa có bài viết
        </h3>
        <p className='text-neutral-600'>Không có bài viết mới nào.</p>
       </div>
      ) : (
       feedPosts.map((post, index) => (
        <Card
         key={`social-${index}`}
         className='bg-white/70 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-lg'
        >
         <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
           <div className='w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
            {post.author?.charAt(0) || 'U'}
           </div>
           <div className='flex-1'>
            <h4 className='font-semibold text-neutral-900'>
             {post.author || 'Người dùng'}
            </h4>
            <p className='text-neutral-700 mt-1'>{post.content}</p>
            <div className='flex items-center gap-4 mt-3 text-body-small text-neutral-500'>
             <Button className='flex items-center gap-1 hover:text-primary-600'>
              <span>👍</span> {post.likes || 0}
             </Button>
             <Button className='flex items-center gap-1 hover:text-primary-600'>
              <span>💬</span> {post.comments || 0}
             </Button>
             <span>{post.time}</span>
            </div>
           </div>
          </div>
         </CardContent>
        </Card>
       ))
      )}
     </TabsContent>

     <TabsContent value='tournaments' className='mt-0 space-y-4'>
      {filteredTournaments.length === 0 ? (
       <div className='text-center py-12'>
        <div className='text-6xl mb-4'>🏆</div>
        <h3 className='text-body-large-semibold text-neutral-900 mb-2'>
         Chưa có giải đấu
        </h3>
        <p className='text-neutral-600'>Không có giải đấu mới nào.</p>
       </div>
      ) : (
       filteredTournaments.map((tournament, index) => (
        <Card
         key={`tournament-${index}`}
         className='bg-white shadow-sm border border-neutral-200'
        >
         <CardContent className='p-4'>
          <h4 className='font-semibold text-neutral-900'>
           {tournament.name}
          </h4>
          <p className='text-neutral-600 text-body-small mt-1'>
           {tournament.description}
          </p>
          <div className='flex items-center justify-between mt-3'>
           <span className='text-body-small text-neutral-500'>
            Giải thưởng:{' '}
            {tournament.prize_pool?.toLocaleString() || '0'} VNĐ
           </span>
           <Button
            
            onClick={() => handleJoinTournament(tournament.id)}
           >
            Tham gia
           </Button>
          </div>
         </CardContent>
        </Card>
       ))
      )}
     </TabsContent>

     <TabsContent value='challenges' className='mt-0 space-y-4'>
      {filteredChallenges.length === 0 ? (
       <div className='text-center py-12'>
        <div className='text-6xl mb-4'>⚔️</div>
        <h3 className='text-body-large-semibold text-neutral-900 mb-2'>
         Chưa có thách đấu
        </h3>
        <p className='text-neutral-600'>Không có thách đấu mới nào.</p>
       </div>
      ) : (
       filteredChallenges.map((challenge, index) => (
        <Card
         key={`challenge-${index}`}
         className='bg-white shadow-sm border border-neutral-200'
        >
         <CardContent className='p-4'>
          <h4 className='font-semibold text-neutral-900'>
           Thách đấu {challenge.bet_points || 0} điểm
          </h4>
          <p className='text-neutral-600 text-body-small mt-1'>
           Từ:{' '}
           {challenge.challenger_profile?.full_name || 'Người chơi'}
          </p>
          <div className='flex gap-2 mt-3'>
           <Button
            
            onClick={() =>
             handleChallengeAction('accept', challenge.id)
            }
           >
            Chấp nhận
           </Button>
           <Button
            
            variant='outline'
            onClick={() =>
             handleChallengeAction('decline', challenge.id)
            }
           >
            Từ chối
           </Button>
          </div>
         </CardContent>
        </Card>
       ))
      )}
     </TabsContent>
    </div>

    {/* Simple Create Post Button */}
    <div className='fixed bottom-20 right-4 z-50'>
     <Button
      
      className='w-14 h-14 rounded-full bg-primary hover:bg-primary/90'
      onClick={() => toast.info('Tính năng tạo bài viết đang phát triển')}
     >
      <Plus className='h-6 w-6' />
     </Button>
    </div>
   </div>
  </>
 );
};

export default FeedPage;
