import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  threshold = 80,
  children,
  className
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartY(touch.clientY);
    
    // Only allow pull-to-refresh at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setCanPull(scrollTop === 0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canPull || isRefreshing) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [canPull, isRefreshing, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanPull(false);
  }, [canPull, isRefreshing, pullDistance, threshold, onRefresh]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = refreshProgress >= 1;

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ 
              opacity: 1, 
              y: Math.max(-60 + pullDistance * 0.8, -20)
            }}
            exit={{ opacity: 0, y: -60 }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center"
            className="pull-refresh-container" style={{ height: Math.max(pullDistance, 60) }}
          >
            <div className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-full',
              'bg-card/90 dark:bg-card/95 backdrop-blur-sm',
              'border border-border/50 dark:border-border/30',
              'shadow-lg dark:shadow-black/20'
            )}>
              <motion.div
                animate={isRefreshing ? {
                  rotate: 360,
                  transition: { duration: 1, repeat: Infinity, ease: 'linear' }
                } : {
                  rotate: refreshProgress * 360,
                  scale: shouldTrigger ? [1, 1.2, 1] : 1
                }}
                transition={shouldTrigger ? { duration: 0.3, repeat: Infinity } : undefined}
              >
                <RefreshCw 
                  className={cn(
                    'w-6 h-6 transition-colors duration-300',
                    shouldTrigger || isRefreshing 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  )} 
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
                className="text-xs font-medium text-center"
              >
                {isRefreshing ? (
                  <span className="text-primary">Đang làm mới...</span>
                ) : shouldTrigger ? (
                  <span className="text-primary">Thả để làm mới</span>
                ) : (
                  <span className="text-muted-foreground">Kéo để làm mới</span>
                )}
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                className="w-12 h-1 bg-muted rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: pullDistance > 10 ? 1 : 0 }}
              >
                <motion.div
                  className={cn(
                    'h-full rounded-full transition-colors duration-300',
                    shouldTrigger 
                      ? 'bg-gradient-to-r from-primary to-accent' 
                      : 'bg-primary/60'
                  )}
                  className="pull-refresh-progress" style={{ width: `${refreshProgress * 100}%` }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          y: isRefreshing ? 40 : Math.max(pullDistance * 0.3, 0)
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* Pull hint for desktop */}
      <div className="hidden md:block fixed bottom-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ delay: 2 }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-full',
            'bg-card/90 dark:bg-card/95 backdrop-blur-sm',
            'border border-border/50 dark:border-border/30',
            'text-xs text-muted-foreground',
            'shadow-lg dark:shadow-black/20'
          )}
        >
          <ChevronDown className="w-3 h-3" />
          <span>Kéo xuống để làm mới (mobile)</span>
        </motion.div>
      </div>
    </div>
  );
};

export default PullToRefresh;
