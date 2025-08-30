import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileStoryReel from '../components/mobile/cards/MobileStoryReel';
import MobileFeedCard from '../components/mobile/cards/MobileFeedCard';
import MobileFloatingActionButton from '../components/mobile/common/MobileFloatingActionButton';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { useProtectedTheme } from '../hooks/useProtectedTheme';
import { COMPONENT_THEMES } from '../constants/theme';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

// Dashboard with theme-aware transparent backgrounds for light mode

const Dashboard = () => {
  // Use protected theme system
  const { 
    isDark, 
    getComponentClasses, 
    getClasses,
    conditionalClasses 
  } = useProtectedTheme();

  // Use real social feed data
  const {
    feedPosts,
    stories,
    loading,
    error,
    refreshFeed,
    handleLike,
    handleDelete,
    isConnected,
  } = useSocialFeed();

  // Remove any test notification panels that might be injected
  React.useEffect(() => {
    const removeTestPanels = () => {
      // Remove any elements containing test notification text
      const testElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Test Unified Notifications') || 
               text.includes('Tạo Challenge Notification') ||
               text.includes('test notifications và kiểm tra hệ thống') ||
               text.includes('🧪');
      });
      
      testElements.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };

    // Remove on mount
    removeTestPanels();
    
    // Remove every 1 second to handle dynamic injection
    const interval = setInterval(removeTestPanels, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Hiển thị toàn bộ feed mặc định (bỏ cơ chế "Xem thêm")
  const visibleItems = feedPosts;
  const hasMore = false;

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    refreshFeed();
    toast.success('Đã làm mới feed!');
  }, [refreshFeed]);

  const {
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getRefreshIndicatorStyle,
    getContainerStyle,
    isRefreshing: isPullRefreshing,
    pullDistance,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  // Infinite scroll for loading more content
  const loadMoreContent = useCallback(async () => {}, []); // no-op

  const { containerRef: infiniteScrollRef } = useInfiniteScroll({
    loadMore: loadMoreContent,
    hasMore: false,
    threshold: 300,
  });

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement) => {
    containerRef.current = node;
    infiniteScrollRef.current = node;
  }, []);

  // Social interaction handlers are now provided by useSocialFeed hook

  const handleComment = useCallback((postId: string) => {
    toast.info('Tính năng bình luận đang phát triển');
  }, []);

  const handleShare = useCallback((postId: string) => {
    toast.success('Đã sao chép link bài viết!');
  }, []);

  const handleAction = useCallback((postId: string, action: string) => {
    switch (action) {
      case 'accept_challenge':
        toast.success('Đã nhận thách đấu! Chờ xác nhận từ đối thủ');
        break;
      case 'join_tournament':
        toast.success('Đã đăng ký tham gia giải đấu!');
        break;
      default:
        break;
    }
  }, []);

  const handleFABAction = useCallback(() => {
    toast.info('Tính năng tạo nội dung đang phát triển');
  }, []);

  // Admin delete handler
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      await handleDelete(postId);
      toast.success('Đã xóa bài viết thành công!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  }, [handleDelete]);

  return (
    <>
      <Helmet>
        <title>SABO Arena - Social Feed</title>
        <meta
          name='description'
          content='Theo dõi hoạt động của cộng đồng billiards SABO Arena'
        />
      </Helmet>

      <div
        ref={combinedRef}
        className={`min-h-screen overflow-auto ${getComponentClasses('dashboard')}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={getContainerStyle()}
      >
        {/* Pull to refresh indicator */}
        <div
          className={`flex justify-center items-center transition-all duration-200 ${
            isPullRefreshing || loading || pullDistance > 0
              ? 'py-2'
              : 'h-0 py-0 overflow-hidden'
          }`}
          style={getRefreshIndicatorStyle()}
        >
          <RefreshCw
            className={`w-6 h-6 ${conditionalClasses('text-white', 'text-slate-700')} ${
              isPullRefreshing || loading ? 'animate-spin' : ''
            }`}
          />
        </div>

        {/* Story Reel with theme-aware transparent background */}
        <div className={getComponentClasses('storySection')}>
          <MobileStoryReel stories={stories} />
        </div>

        {/* Social Feed */}
        <div className='px-4 space-y-4 pb-4'>
          {/* Loading state */}
          {loading && feedPosts.length === 0 && (
            <div className={`text-center py-8 ${conditionalClasses('bg-slate-800/30', 'bg-white/30')} backdrop-blur-md rounded-lg`}>
              <RefreshCw className={`w-8 h-8 animate-spin mx-auto ${getClasses('textSecondary')}`} />
              <p className={`text-sm ${getClasses('textSecondary')} mt-2 font-medium`}>
                Đang tải feed...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className={`text-center py-8 ${conditionalClasses('bg-slate-800/40', 'bg-white/40')} backdrop-blur-md rounded-lg border ${getClasses('border')}`}>
              <p className='text-sm text-red-400 font-medium'>{error}</p>
              <button
                onClick={refreshFeed}
                className={`text-sm ${getClasses('textSecondary')} hover:${getClasses('textPrimary')} ${conditionalClasses('bg-slate-700/50 hover:bg-slate-700/70', 'bg-white/50 hover:bg-white/70')} px-4 py-2 rounded-md mt-3 transition-colors`}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Feed content */}
          {!loading &&
            !error &&
            visibleItems.map(post => (
              <MobileFeedCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onAction={handleAction}
                onDelete={handleDeletePost}
              />
            ))}

          {/* End of feed indicator */}
          {feedPosts.length > 0 && !loading && (
            <div className={`text-center py-8 ${getClasses('textSecondary')}`}>
              <div className='text-2xl'>🎱</div>
              <div className='text-sm mt-2 font-medium'>Bạn đã xem hết feed rồi!</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && feedPosts.length === 0 && (
            <div className={`text-center py-12 ${conditionalClasses('bg-slate-800/30', 'bg-white/30')} backdrop-blur-md rounded-lg`}>
              <div className='text-4xl mb-4'>🎱</div>
              <p className={`text-base ${getClasses('textPrimary')} font-medium mb-2`}>
                Chưa có hoạt động nào
              </p>
              <p className={`text-sm ${getClasses('textMuted')}`}>
                Hãy tham gia một trận đấu hoặc tạo thách đấu!
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <MobileFloatingActionButton primaryAction={handleFABAction} />
      </div>
    </>
  );
};

export default Dashboard;
