import { Suspense, lazy, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useThemedStyles } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
 User,
 Trophy,
 Target,
 Users,
 TrendingUp,
 Calendar,
 Bell,
 Activity,
 RefreshCw,
 Plus,
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import { EnhancedWalletBalance } from '@/components/enhanced/EnhancedWalletBalance';
import { MilestoneSummaryWidget } from '@/components/milestones/MilestoneSummaryWidget';
import { RecentMilestoneAwards } from '@/components/milestones/RecentMilestoneAwards';
import { Link } from 'react-router-dom';

// Import standardized design system
import { 
 StandardCard, 
 StandardStatsGrid, 
 StandardSkeleton 
} from '@/config/StandardComponents';
import { StandardPageWrapper, StandardPageHeader } from '@/config/PageLayoutConfig';

// Import Social Components
import MobileFeedCard from '@/components/mobile/cards/MobileFeedCard';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { toast } from 'sonner';

// Force dark mode for this page
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

const DashboardPage = () => {
 const { user, signOut, loading } = useAuth();
 const { getThemedValue, theme } = useThemedStyles();
 const { setTheme } = useTheme();

 // Force dark mode for dashboard
 useEffect(() => {
  setTheme('dark');
 }, [setTheme]);

 // Social Feed Integration (without stories)
 const {
  feedPosts,
  loading: feedLoading,
  error: feedError,
  refreshFeed,
  handleLike,
  handleDelete,
 } = useSocialFeed();

 const handleLogout = async () => {
  await signOut();
 };

 // Handle story click - removed since no stories
 // const handleStoryClick = useCallback((storyId: string) => {
 //  toast.info(`Xem story: ${storyId}`);
 // }, []);

 // Handle feed actions
 const handleComment = useCallback((postId: string) => {
  toast.info(`Bình luận bài viết: ${postId}`);
 }, []);

 const handleShare = useCallback((postId: string) => {
  toast.success('Đã chia sẻ bài viết!');
 }, []);

 const handleAction = useCallback((postId: string, action: string) => {
  toast.info(`Thao tác ${action} trên bài viết: ${postId}`);
 }, []);

 const handleRefreshFeed = useCallback(async () => {
  await refreshFeed();
  toast.success('Đã làm mới feed!');
 }, [refreshFeed]);

 // Standardized player stats using design system
 const playerStats = [
  {
   id: 'elo',
   label: 'ELO Rating',
   value: '1,250',
   icon: Trophy,
   color: 'yellow' as const,
   trend: { value: 5.2, direction: 'up' as const }
  },
  {
   id: 'wins',
   label: 'Trận thắng',
   value: 45,
   icon: TrendingUp,
   color: 'green' as const,
   trend: { value: 12.5, direction: 'up' as const }
  },
  {
   id: 'losses',
   label: 'Trận thua',
   value: 12,
   icon: Target,
   color: 'red' as const,
   trend: { value: 2.1, direction: 'down' as const }
  },
  {
   id: 'winrate',
   label: 'Tỷ lệ thắng',
   value: '78.9%',
   icon: Activity,
   color: 'blue' as const,
   trend: { value: 3.8, direction: 'up' as const }
  }
 ];

 // Quick actions using standardized design
 const quickActions = [
  {
   label: 'Tạo thách đấu',
   icon: Target,
   route: '/challenges',
   color: 'bg-primary-500 hover:bg-primary-600 text-var(--color-background)'
  },
  {
   label: 'Xem giải đấu',
   icon: Trophy,
   route: '/tournaments',
   color: 'bg-success-500 hover:bg-success-600 text-var(--color-background)'
  },
  {
   label: 'Cập nhật hồ sơ',
   icon: User,
   route: '/profile',
   color: 'bg-info-500 hover:bg-purple-600 text-var(--color-background)'
  },
  {
   label: 'Xem lịch',
   icon: Calendar,
   route: '/schedule',
   color: 'bg-warning-500 hover:bg-orange-600 text-var(--color-background)'
  }
 ];

 if (loading) {
  return (
   <div className="space-y-4 p-4">
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    <div className="grid grid-cols-2 gap-4">
     <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
     <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
   </div>
  );
 }

 const pageActions = (
  <div className="flex items-center space-x-3">
   <Button
    variant="outline"
    
    onClick={handleRefreshFeed}
    disabled={feedLoading}
    className="hidden sm:flex"
   >
    <RefreshCw className={`w-4 h-4 mr-2 ${feedLoading ? 'animate-spin' : ''}`} />
    Làm mới
   </Button>
   <Button
    variant="outline"
    
    onClick={handleLogout}
    className="hidden sm:flex"
   >
    Đăng xuất
   </Button>
   <Button asChild>
    <Link to="/profile">
     <User className="w-4 h-4 mr-2" />
     Hồ sơ
    </Link>
   </Button>
  </div>
 );

 return (
  <StandardPageWrapper variant="dashboard">
   <StandardPageHeader
    title={`Chào mừng, ${user?.user_metadata?.full_name || 'Bạn'}! 👋`}
    description="Chúc bạn có một ngày thi đấu thành công"
    actions={pageActions}
    variant="dashboard"
   />
   
   <div className="space-y-8">
    {/* Social Feed Section */}
    <StandardCard 
     title="Feed Cộng Đồng" 
     description="Hoạt động mới nhất từ cộng đồng bi-a SABO"
     variant="feature"
     className="bg-var(--color-foreground)/20 dark:bg-var(--color-foreground)/30 backdrop-blur-lg border-var(--color-background)/10 text-var(--color-background)"
     headerActions={
      <div className="flex items-center space-x-2">
       <Button 
        variant="ghost" 
         
        onClick={handleRefreshFeed}
        disabled={feedLoading}
       >
        <RefreshCw className={`w-4 h-4 mr-2 ${feedLoading ? 'animate-spin' : ''}`} />
        Làm mới
       </Button>
       <Button variant="outline" asChild>
        <Link to="/feed">
         Xem tất cả
        </Link>
       </Button>
      </div>
     }
    >
     <div className="form-spacing">
      {/* Loading state */}
      {feedLoading && feedPosts.length === 0 && (
       <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-body-small text-muted-foreground mt-2">
         Đang tải feed...
        </p>
       </div>
      )}

      {/* Error state */}
      {feedError && (
       <div className="text-center py-8">
        <p className="text-body-small text-destructive">{feedError}</p>
        <Button
         variant="outline"
         
         onClick={handleRefreshFeed}
         className="mt-2"
        >
         Thử lại
        </Button>
       </div>
      )}

      {/* Feed content - Show first 3 posts */}
      {!feedLoading && !feedError && feedPosts.slice(0, 3).map(post => (
       <MobileFeedCard
        key={post.id}
        post={post}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onAction={handleAction}
        onDelete={handleDelete}
       />
      ))}

      {/* Empty state */}
      {!feedLoading && !feedError && feedPosts.length === 0 && (
       <div className="text-center py-12">
        <div className="text-6xl mb-4">🎱</div>
        <h3 className="text-body-large-semibold mb-2">Chưa có hoạt động</h3>
        <p className="text-muted-foreground text-body-small">
         Tham gia thách đấu hoặc giải đấu để có hoạt động hiển thị
        </p>
        <div className="flex justify-center space-x-3 mt-6">
         <Button asChild>
          <Link to="/challenges">Xem thách đấu</Link>
         </Button>
         <Button variant="outline" asChild>
          <Link to="/tournaments">Xem giải đấu</Link>
         </Button>
        </div>
       </div>
      )}

      {/* Show more button */}
      {!feedLoading && feedPosts.length > 3 && (
       <div className="text-center pt-4">
        <Button variant="outline" asChild>
         <Link to="/feed">
          Xem thêm {feedPosts.length - 3} bài viết
         </Link>
        </Button>
       </div>
      )}
     </div>
    </StandardCard>
    {/* Wallet Balance Section */}
    <StandardCard 
     title="Số dư ví" 
     variant="feature"
     className="bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border-slate-700/50"
    >
     <Suspense fallback={<StandardSkeleton variant="custom" className="h-24" />}>
      <EnhancedWalletBalance />
     </Suspense>
     <div className="mt-6 grid md:grid-cols-2 gap-4">
      <MilestoneSummaryWidget />
      <RecentMilestoneAwards compact />
     </div>
    </StandardCard>

    {/* Player Statistics */}
    <StandardCard 
     title="Thông số người chơi" 
     description="Tổng quan về thành tích thi đấu của bạn"
     variant="default"
     className="bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border-slate-700/50"
    >
     <StandardStatsGrid 
      stats={playerStats} 
      variant="default"
     />
    </StandardCard>

    {/* Quick Actions */}
    <StandardCard 
     title="Hành động nhanh" 
     description="Các thao tác phổ biến để bắt đầu"
     variant="default"
     className="bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border-slate-700/50"
    >
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickActions.map((action, index) => {
       const Icon = action.icon;
       return (
        <Link
         key={action.label}
         to={action.route}
         className="block group"
        >
         <div className="text-center p-6 rounded-lg border border-slate-600/50 hover:border-slate-500/50 hover:shadow-md transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/60">
          <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${action.color}`}>
           <Icon className="w-6 h-6" />
          </div>
          <div className="font-medium text-slate-100 group-hover:text-var(--color-background)">
           {action.label}
          </div>
         </div>
        </Link>
       );
      })}
     </div>
    </StandardCard>

    {/* Recent Activity */}
    <StandardCard 
     title="Hoạt động gần đây" 
     variant="default"
     className="bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border-slate-700/50"
     headerActions={
      <Button variant="outline" asChild>
       <Link to="/activity">
        <Bell className="w-4 h-4 mr-2" />
        Xem tất cả
       </Link>
      </Button>
     }
    >
     <div className="text-center py-12 text-slate-400">
      <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-500" />
      <p className="font-medium text-slate-300">Chưa có hoạt động gần đây</p>
      <p className="text-body-small mt-2">
       Tham gia thách đấu hoặc giải đấu để có hoạt động hiển thị tại đây
      </p>
      <div className="flex justify-center space-x-3 mt-6">
       <Button asChild>
        <Link to="/challenges">Xem thách đấu</Link>
       </Button>
       <Button variant="outline" asChild>
        <Link to="/tournaments">Xem giải đấu</Link>
       </Button>
      </div>
     </div>
    </StandardCard>

    {/* Upcoming Schedule */}
    <StandardCard 
     title="Lịch thi đấu" 
     description="Các trận đấu sắp tới của bạn"
     variant="default"
     className="bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border-slate-700/50"
     headerActions={
      <Button variant="outline" asChild>
       <Link to="/schedule">
        <Calendar className="w-4 h-4 mr-2" />
        Xem lịch đầy đủ
       </Link>
      </Button>
     }
    >
     <div className="text-center py-12">
      <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
      <p className="text-slate-300 font-medium">
       Chưa có lịch thi đấu
      </p>
      <p className="text-body-small text-slate-400 mt-1">
       Đăng ký tham gia giải đấu để có lịch thi đấu
      </p>
      <Button className="mt-4" variant="outline" asChild>
       <Link to="/tournaments">Xem giải đấu</Link>
      </Button>
     </div>
    </StandardCard>
   </div>
  </StandardPageWrapper>
 );
};

export default DashboardPage;
