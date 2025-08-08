// Re-export from MobilePlayerLayout for easier access
export {
  MOBILE_PAGE_TITLES,
  type MobilePageTitle,
} from '@/components/mobile/MobilePlayerLayout';
export { useMobilePageTitle } from '@/hooks/useMobilePageTitle';

import { MOBILE_PAGE_TITLES } from '@/components/mobile/MobilePlayerLayout';

/**
 * Utility để get page title cho specific route
 */
export const getPageTitle = (pathname: string): string | undefined => {
  const routeTitleMap: Record<string, string> = {
    '/': MOBILE_PAGE_TITLES.DASHBOARD,
    '/dashboard': MOBILE_PAGE_TITLES.DASHBOARD,
    '/profile': MOBILE_PAGE_TITLES.PROFILE,
    '/tournaments': MOBILE_PAGE_TITLES.TOURNAMENTS,
    '/challenges': MOBILE_PAGE_TITLES.CHALLENGES,
    '/leaderboard': MOBILE_PAGE_TITLES.LEADERBOARD,
    '/calendar': MOBILE_PAGE_TITLES.CALENDAR,
    '/community': MOBILE_PAGE_TITLES.COMMUNITY,
    '/feed': MOBILE_PAGE_TITLES.FEED,
    '/marketplace': MOBILE_PAGE_TITLES.MARKETPLACE,
    '/notifications': MOBILE_PAGE_TITLES.NOTIFICATIONS,
    '/settings': MOBILE_PAGE_TITLES.SETTINGS,
    '/wallet': MOBILE_PAGE_TITLES.WALLET,
    '/clubs': MOBILE_PAGE_TITLES.CLUBS,
    '/club-registration': MOBILE_PAGE_TITLES.CLUB_REGISTRATION,
    '/about': MOBILE_PAGE_TITLES.ABOUT,
    '/contact': MOBILE_PAGE_TITLES.CONTACT,
    '/news': MOBILE_PAGE_TITLES.NEWS,
    '/privacy': MOBILE_PAGE_TITLES.PRIVACY,
    '/terms': MOBILE_PAGE_TITLES.TERMS,
  };

  if (routeTitleMap[pathname]) {
    return routeTitleMap[pathname];
  }

  if (pathname.startsWith('/clubs/')) {
    return MOBILE_PAGE_TITLES.CLUB_DETAIL;
  }

  return undefined;
};

/**
 * Kiểm tra xem route có phải là trang chính không (hiển thị trong navigation)
 */
export const isMainPage = (pathname: string): boolean => {
  const mainPages = [
    '/',
    '/dashboard',
    '/profile',
    '/tournaments',
    '/challenges',
    '/leaderboard',
  ];

  return mainPages.includes(pathname);
};

/**
 * Kiểm tra xem route có cần hiển thị header không
 */
export const shouldShowHeader = (pathname: string): boolean => {
  // Hide header trên auth pages
  const authPages = [
    '/auth',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ];

  return !authPages.some(page => pathname.startsWith(page));
};

/**
 * Kiểm tra xem route có cần hiển thị navigation không
 */
export const shouldShowNavigation = (pathname: string): boolean => {
  // Hide navigation trên auth pages và admin pages
  const hiddenNavPages = ['/auth', '/admin'];

  return !hiddenNavPages.some(page => pathname.startsWith(page));
};
