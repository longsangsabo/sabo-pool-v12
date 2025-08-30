import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

/**
 * Calculate delay (ms) before refreshing a token given its expires_at (seconds epoch).
 * Refresh early (120s before), but never sooner than 5s and not later than expiry - 5s.
 */
export const calculateRefreshDelay = (
  expiresAt: number | null | undefined,
  nowSec: number = Date.now() / 1000
): number | null => {
  if (!expiresAt) return null;
  const refreshAt = expiresAt - 120; // refresh 2 minutes early
  let delaySec = refreshAt - nowSec;
  // If already past the ideal refresh moment, refresh soon
  if (delaySec < 0) delaySec = 5; // 5s fallback
  // Clamp to max window (do not schedule beyond expiry - 5s)
  const maxDelay = expiresAt - 5 - nowSec; // keep 5s safety buffer
  if (delaySec > maxDelay) delaySec = Math.max(5, maxDelay);
  return Math.max(5, Math.floor(delaySec)) * 1000; // ms
};

/**
 * Hook that sets up proactive token refresh to avoid sudden logout / redirect.
 * Relies on supabase autoRefreshToken but adds early, user-friendly refresh.
 */
export const useTokenRefresh = (session: Session | null) => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!session?.expires_at) return;

    const delay = calculateRefreshDelay(session.expires_at);
    if (delay == null) return;

    const schedule = () => {
      timeoutRef.current = window.setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.warn('🔄 Token early refresh failed:', error.message);
          } else if (data?.session?.expires_at) {
            // Reschedule with new expiry
            const nextDelay = calculateRefreshDelay(data.session.expires_at);
            if (nextDelay) schedule();
          }
        } catch (err) {
          console.warn('🔄 Token early refresh threw exception:', err);
        }
      }, delay);
    };

    schedule();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [session?.expires_at]);
};
