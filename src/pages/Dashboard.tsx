import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileStoryReel from '../components/mobile/cards/MobileStoryReel';
import MobileFeedCard from '../components/mobile/cards/MobileFeedCard';
import MobileFloatingActionButton from '../components/mobile/common/MobileFloatingActionButton';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
// Removed ChallengeDataChecker debug component

// Dashboard now uses real data from useSocialFeed hook

const Dashboard = () => {
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
        className='min-h-screen overflow-auto'
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
            className={`w-6 h-6 text-primary ${
              isPullRefreshing || loading ? 'animate-spin' : ''
            }`}
          />
        </div>

        {/* Story Reel with real data */}
        <MobileStoryReel stories={stories} />

        {/* Debug component removed */}

        {/* Social Feed */}
        <div className='px-4 space-y-4 pb-4'>
          {/* Loading state */}
          {loading && feedPosts.length === 0 && (
            <div className='text-center py-8'>
              <RefreshCw className='w-8 h-8 animate-spin mx-auto text-muted-foreground' />
              <p className='text-sm text-muted-foreground mt-2'>
                Đang tải feed...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className='text-center py-8'>
              <p className='text-sm text-destructive'>{error}</p>
              <button
                onClick={refreshFeed}
                className='text-sm text-primary hover:underline mt-2'
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
            <div className='text-center py-8 text-muted-foreground'>
              <div className='text-sm'>🎱</div>
              <div className='text-xs mt-2'>Bạn đã xem hết feed rồi!</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && feedPosts.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-4xl mb-2'>🎱</div>
              <p className='text-sm text-muted-foreground'>
                Chưa có hoạt động nào
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
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
