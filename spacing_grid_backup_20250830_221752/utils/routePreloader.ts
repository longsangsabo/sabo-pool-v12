/**
 * Route Preloader for Performance Optimization
 * Preloads critical routes during idle time
 */

// Critical routes that should be preloaded
const criticalRoutes = {
  dashboard: () => import('../pages/Dashboard'),
  tournaments: () => import('../pages/TournamentsPage'),
  challenges: () => import('../pages/challenges/EnhancedChallengesPageV3'),
  profile: () => import('../pages/Profile'),
  leaderboard: () => import('../pages/LeaderboardPage'),
};

// Preload routes during idle time
export const preloadCriticalRoutes = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Object.values(criticalRoutes).forEach(route => {
        route().catch(() => {
          // Silently fail - preloading is optional
        });
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      Object.values(criticalRoutes).forEach(route => {
        route().catch(() => {
          // Silently fail - preloading is optional
        });
      });
    }, 2000);
  }
};

// Preload specific route on demand
export const preloadRoute = (routeName: keyof typeof criticalRoutes) => {
  if (criticalRoutes[routeName]) {
    return criticalRoutes[routeName]();
  }
  return Promise.resolve();
};
