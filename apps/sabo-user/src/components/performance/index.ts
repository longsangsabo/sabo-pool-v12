// Performance Components
export { Skeleton, TournamentCardSkeleton, PlayerCardSkeleton, DashboardSkeleton } from './Skeleton';
export { createLazyComponent, LazyTournamentBracket, LazyPlayerRankings, LazyStatisticsChart, LazyNotifications, LazyContent } from './LazyLoad';
export { PerformanceMonitor, usePerformanceMonitoring } from './PerformanceMonitor';

// Re-export types for external use
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  bundleSize?: number;
  networkRequests?: number;
}
