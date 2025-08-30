import { useMemo } from 'react';

/**
 * Simple admin check hook for user app
 * Always returns false since this is the user-facing app
 */
export const useAdminCheck = () => {
  return useMemo(() => ({
    isAdmin: false,
    loading: false,
    error: null
  }), []);
};
