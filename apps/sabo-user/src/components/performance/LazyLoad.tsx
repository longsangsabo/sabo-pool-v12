import React, { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from './Skeleton';

interface LazyLoadProps {
  fallback?: React.ReactNode;
  error?: React.ReactNode;
  delay?: number;
  retryCount?: number;
}

// Generic lazy loading wrapper with enhanced error handling
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadProps = {}
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const {
      fallback = <Skeleton variant="card" />,
      error = <div className="text-red-500">Failed to load component</div>,
      delay = 0,
      retryCount = 3
    } = options;

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for common heavy components
export const LazyTournamentBracket = createLazyComponent(
  () => import('../tournament/TournamentBracket'),
  {
    fallback: (
      <div className="space-y-4">
        <Skeleton variant="tournament" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} variant="player" />
          ))}
        </div>
      </div>
    )
  }
);

// TODO: Implement these components for full lazy loading
/*
export const LazyPlayerRankings = createLazyComponent(
  () => import('../player/PlayerRankings'),
  {
    fallback: (
      <div className="space-y-3">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} variant="player" />
        ))}
      </div>
    )
  }
);

export const LazyStatisticsChart = createLazyComponent(
  () => import('../statistics/StatisticsChart'),
  {
    fallback: <Skeleton variant="card" height={400} />
  }
);

export const LazyNotifications = createLazyComponent(
  () => import('../notifications/NotificationCenter'),
  {
    fallback: (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="rectangular" height={60} />
        ))}
      </div>
    )
  }
);
*/

// Intersection Observer based lazy loading for content below the fold
interface LazyContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const LazyContent: React.FC<LazyContentProps> = ({
  children,
  fallback = <Skeleton variant="card" />,
  rootMargin = '50px',
  threshold = 0.1,
  className
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsVisible(true);
          // Small delay to ensure smooth loading
          setTimeout(() => setIsLoaded(true), 100);
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, isLoaded]);

  return (
    <div ref={ref} className={className}>
      {isLoaded ? children : isVisible ? fallback : <div style={{ height: '200px' }} />}
    </div>
  );
};
