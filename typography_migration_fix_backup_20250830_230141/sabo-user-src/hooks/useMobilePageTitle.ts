import { useLocation } from 'react-router-dom';
import {
  MOBILE_PAGE_TITLES,
  type MobilePageTitle,
} from '@/components/mobile/MobilePlayerLayout';

/**
 * Hook để tự động detect page title dựa trên route hiện tại
 */
export const useMobilePageTitle = (): MobilePageTitle | undefined => {
  const location = useLocation();
  const pathname = location.pathname;

  // Route mapping to page titles
  const routeTitleMap: Record<string, MobilePageTitle> = {
    // Core Routes
    '/': MOBILE_PAGE_TITLES.DASHBOARD,
    '/dashboard': MOBILE_PAGE_TITLES.DASHBOARD,
    '/profile': MOBILE_PAGE_TITLES.PROFILE,
    '/tournaments': MOBILE_PAGE_TITLES.TOURNAMENTS,
    '/challenges': MOBILE_PAGE_TITLES.CHALLENGES,
    '/leaderboard': MOBILE_PAGE_TITLES.LEADERBOARD,

    // Secondary Routes
    '/calendar': MOBILE_PAGE_TITLES.CALENDAR,
    '/community': MOBILE_PAGE_TITLES.COMMUNITY,
    '/feed': MOBILE_PAGE_TITLES.FEED,
    '/marketplace': MOBILE_PAGE_TITLES.MARKETPLACE,
    '/notifications': MOBILE_PAGE_TITLES.NOTIFICATIONS,
    '/settings': MOBILE_PAGE_TITLES.SETTINGS,
    '/wallet': MOBILE_PAGE_TITLES.WALLET,

    // Club Routes
    '/clubs': MOBILE_PAGE_TITLES.CLUBS,
    '/club-registration': MOBILE_PAGE_TITLES.CLUB_REGISTRATION,

    // Public Routes
    '/about': MOBILE_PAGE_TITLES.ABOUT,
    '/contact': MOBILE_PAGE_TITLES.CONTACT,
    '/news': MOBILE_PAGE_TITLES.NEWS,
    '/privacy': MOBILE_PAGE_TITLES.PRIVACY,
    '/terms': MOBILE_PAGE_TITLES.TERMS,
  };

  // Exact match first
  if (routeTitleMap[pathname]) {
    return routeTitleMap[pathname];
  }

  // Pattern matching for dynamic routes
  if (pathname.startsWith('/clubs/')) {
    return MOBILE_PAGE_TITLES.CLUB_DETAIL;
  }

  // Default: no title (SABO logo only)
  return undefined;
};
