import { useMemo } from 'react';

/**
 * Simple club admin check hook for user app
 * Always returns false since this is the user-facing app
 */
export const useClubAdminCheck = () => {
  return useMemo(() => ({
    isClubAdmin: false,
    loading: false,
    error: null
  }), []);
};
