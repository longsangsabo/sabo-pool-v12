import { useLocation } from 'react-router-dom';
import { ADMIN_PAGE_TITLES } from '@/components/mobile/AdminPlayerLayout';

export const useAdminPageTitle = (): string | undefined => {
  const location = useLocation();
  const pathname = location.pathname;

  // Admin route mapping
  const routeTitleMap: Record<string, string> = {
    '/admin': ADMIN_PAGE_TITLES.DASHBOARD,
    '/admin/users': ADMIN_PAGE_TITLES.USERS,
    '/admin/tournaments': ADMIN_PAGE_TITLES.TOURNAMENTS,
    '/admin/clubs': ADMIN_PAGE_TITLES.CLUBS,
    '/admin/analytics': ADMIN_PAGE_TITLES.ANALYTICS,
    '/admin/transactions': ADMIN_PAGE_TITLES.TRANSACTIONS,
    '/admin/challenges': ADMIN_PAGE_TITLES.CHALLENGES,
    '/admin/leaderboard': ADMIN_PAGE_TITLES.LEADERBOARD,
    '/admin/notifications': ADMIN_PAGE_TITLES.NOTIFICATIONS,
    '/admin/settings': ADMIN_PAGE_TITLES.SETTINGS,
    '/admin/rank-verification': ADMIN_PAGE_TITLES.RANK_VERIFICATION,
    '/admin/legacy-claims': ADMIN_PAGE_TITLES.LEGACY_CLAIMS,
    '/admin/game-config': ADMIN_PAGE_TITLES.GAME_CONFIG,
    '/admin/payments': ADMIN_PAGE_TITLES.PAYMENTS,
    '/admin/emergency': ADMIN_PAGE_TITLES.EMERGENCY,
    '/admin/database': ADMIN_PAGE_TITLES.DATABASE,
    '/admin/automation': ADMIN_PAGE_TITLES.AUTOMATION,
    '/admin/development': ADMIN_PAGE_TITLES.DEVELOPMENT,
    '/admin/reports': ADMIN_PAGE_TITLES.REPORTS,
    '/admin/guide': ADMIN_PAGE_TITLES.GUIDE,
    '/admin/schedule': ADMIN_PAGE_TITLES.SCHEDULE,
    '/admin/ai-assistant': ADMIN_PAGE_TITLES.AI_ASSISTANT,
    '/admin/system-reset': ADMIN_PAGE_TITLES.SYSTEM_RESET,
    '/admin/doc-cleanup': ADMIN_PAGE_TITLES.DOC_CLEANUP,
    '/admin/testing': ADMIN_PAGE_TITLES.TESTING,
  };

  // Exact match first
  if (routeTitleMap[pathname]) {
    return routeTitleMap[pathname];
  }

  // Pattern matching for dynamic routes
  if (pathname.startsWith('/admin/users/')) {
    return ADMIN_PAGE_TITLES.USERS;
  }
  if (pathname.startsWith('/admin/tournaments/')) {
    return ADMIN_PAGE_TITLES.TOURNAMENTS;
  }
  if (pathname.startsWith('/admin/clubs/')) {
    return ADMIN_PAGE_TITLES.CLUBS;
  }

  // Default fallback
  if (pathname.startsWith('/admin')) {
    return ADMIN_PAGE_TITLES.DASHBOARD;
  }

  return undefined;
};
